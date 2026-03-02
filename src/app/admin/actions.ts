"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import {
  generateKnockoutRoundOne,
  generateLeagueSchedule,
  generateKnockoutRoundOneTeams,
  generateLeagueScheduleTeams,
  randomizeAndOrderMatches,
  randomizeAndOrderTeamMatches,
} from "@/lib/tournament-utils";

async function assertAdmin() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    throw new Error("غير مصرح");
  }
}

function slugifyTournamentName(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "tournament";
}

export async function createTournament(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const playersPerTeam = parseInt(String(formData.get("players_per_team") ?? "1"));
  const startDateRaw = String(formData.get("start_date") ?? "").trim();
  const teamFormationMode = playersPerTeam === 2 
    ? String(formData.get("team_formation_mode") ?? "")
    : null;
  
  if (!name || ![1, 2].includes(playersPerTeam) || !startDateRaw) return;
  if (playersPerTeam === 2 && !teamFormationMode) return;
  if (teamFormationMode && !["preformed", "random_draw"].includes(teamFormationMode)) return;
  
  // Convert date-only to ISO timestamp (add default time: 12:00 noon local)
  const startDate = `${startDateRaw}T12:00:00`;
  
  const supabase = createAdminClient();
  const baseSlug = slugifyTournamentName(name);
  const { data: existing } = await supabase
    .from("tournaments")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  const existingSlugs = new Set((existing ?? []).map((row: { slug: string }) => row.slug));
  let slug = baseSlug;
  if (existingSlugs.has(slug)) {
    let counter = 2;
    while (existingSlugs.has(`${baseSlug}-${counter}`)) {
      counter += 1;
    }
    slug = `${baseSlug}-${counter}`;
  }

  const { data, error } = await supabase.from("tournaments").insert({
    name,
    slug,
    status: "registration_open",
    allow_public_registration: true,
    players_per_team: playersPerTeam,
    team_formation_mode: teamFormationMode,
    start_date: startDate,
  }).select();
  
  if (error) {
    console.error("[createTournament] Insert error:", error);
    throw error;
  }
  
  const tournament = data?.[0];

  
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/t");
  revalidatePath("/tournaments");
  revalidatePath("/t");
  revalidatePath("/");
  
  if (tournament?.id) {
    redirect(`/admin/tournaments/${tournament.id}`);
  }
}

export async function setActiveTournament(formData: FormData) {
  await assertAdmin();
  void formData;
  // This action is now a no-op since we don't have is_active column yet
  // Users will manage tournaments through the list page
  revalidatePath("/admin/tournaments");
}

export async function deleteTournament(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", tournamentId);
  
  if (error) throw error;
  
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/t");
  revalidatePath("/tournaments");
  revalidatePath("/t");
  revalidatePath("/");
}

export async function togglePublicRegistration(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const allow = formData.get("allow") === "true";
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ allow_public_registration: allow })
    .eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/join");
}

export async function closeRegistration(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "registration_closed", allow_public_registration: false })
    .eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/join");
}

export async function openRegistration(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "registration_open", allow_public_registration: true })
    .eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/join");
}

export async function generateMatchesAction(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  
  // Get tournament info including team settings
  const { data: tournament, error: fetchError } = await supabase
    .from("tournaments")
    .select("type, players_per_team, team_formation_mode")
    .eq("id", tournamentId)
    .single();
  
  if (fetchError) {
    console.error("[generateMatchesAction] Failed to fetch tournament:", fetchError);
    throw new Error("فشل في جلب بيانات البطولة");
  }
    
  if (!tournament) throw new Error("البطولة غير موجودة");
  
  // ===== DEBUG LOGGING =====
  console.log("[generateMatchesAction] Tournament data:", {
    tournamentId,
    type: tournament.type,
    players_per_team: tournament.players_per_team,
    players_per_team_type: typeof tournament.players_per_team,
    team_formation_mode: tournament.team_formation_mode,
  });
  
  // Validate tournament type is set
  if (!tournament.type || !["league", "knockout"].includes(tournament.type)) {
    throw new Error("يجب تحديد نوع البطولة (دوري أو خروج مباشر) قبل إنشاء المباريات");
  }
  
  // Delete existing matches first to allow re-generation
  const { error: deleteError } = await supabase
    .from("matches")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteError) throw deleteError;
  
  // CRITICAL: Use Number() to handle potential string/number type mismatch from DB
  const playersPerTeam = Number(tournament.players_per_team) || 1;
  const isTeamTournament = playersPerTeam > 1;
  const isRandomDraw = tournament.team_formation_mode === "random_draw";
  const isKnockout = tournament.type === "knockout";
  
  console.log("[generateMatchesAction] Mode detection:", {
    playersPerTeam,
    isTeamTournament,
    isRandomDraw,
    isKnockout,
    branch: isTeamTournament ? "TEAM_MODE" : "INDIVIDUAL_MODE"
  });
  
  // ========== TEAM TOURNAMENT (2v2) ==========
  if (isTeamTournament) {
    console.log("[generateMatchesAction] Entering TEAM MODE branch");
    
    // Get teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournamentId);
    
    console.log("[generateMatchesAction] Teams query result:", {
      teamsCount: teams?.length ?? 0,
      teamsError: teamsError?.message,
      teamIds: teams?.map(t => t.id)
    });
    
    // VALIDATION: For random_draw mode, teams MUST be created first via runTeamDrawAction
    if (isRandomDraw && (!teams || teams.length === 0)) {
      throw new Error("يجب تشكيل الفرق أولاً قبل إنشاء المباريات. اضغط على 'تشكيل الفرق بالقرعة' أولاً.");
    }
    
    if (!teams || teams.length < 2) {
      throw new Error("لا توجد فرق كافية لإنشاء المباريات. تأكد من تكوين الفرق أولاً.");
    }
    
    // Validate all teams have proper members
    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("team_id, participant_id")
      .in("team_id", teams.map(t => t.id));
    
    console.log("[generateMatchesAction] Team members:", {
      totalMembers: teamMembers?.length ?? 0,
      membersByTeam: teams.map(t => ({
        teamId: t.id,
        teamName: t.name,
        memberCount: teamMembers?.filter(m => m.team_id === t.id).length ?? 0
      }))
    });
    
    const teamsWithMembers = new Set((teamMembers || []).map(m => m.team_id));
    const incompleteTeams = teams.filter(t => !teamsWithMembers.has(t.id));
    
    if (incompleteTeams.length > 0) {
      throw new Error(`يوجد ${incompleteTeams.length} فريق بدون أعضاء. تأكد من اكتمال تشكيل الفرق.`);
    }
    
    // Generate team-based matches
    let teamMatches;
    if (isKnockout) {
      teamMatches = generateKnockoutRoundOneTeams(teams);
    } else {
      teamMatches = generateLeagueScheduleTeams(teams);
    }
    
    console.log("[generateMatchesAction] Generated team matches:", {
      matchCount: teamMatches.length,
      sampleMatch: teamMatches[0]
    });
    
    // Insert team matches - EXPLICITLY set participant IDs to NULL
    const matchInserts = teamMatches.map((match) => ({
      tournament_id: tournamentId,
      home_team_id: match.homeTeamId,
      away_team_id: match.awayTeamId,
      home_participant_id: null,
      away_participant_id: null,
      round: match.round || 1,
      status: "scheduled",
    }));
    
    console.log("[generateMatchesAction] Inserting team matches:", {
      count: matchInserts.length,
      firstInsert: matchInserts[0]
    });
    
    const { error } = await supabase.from("matches").insert(matchInserts);
    if (error) {
      console.error("[generateMatchesAction] Insert error:", error);
      throw error;
    }
    
    console.log("[generateMatchesAction] SUCCESS: Team matches inserted");
  } 
  // ========== INDIVIDUAL TOURNAMENT (1v1) ==========
  else {
    console.log("[generateMatchesAction] Entering INDIVIDUAL MODE branch");
    // Get participants
    const { data: participants } = await supabase
      .from("participants")
      .select("id, name")
      .eq("tournament_id", tournamentId);
      
    if (!participants || participants.length < 2) {
      throw new Error("يجب أن يكون هناك مشاركين اثنين على الأقل");
    }
    
    // Generate individual matches
    let matches;
    if (isKnockout) {
      matches = generateKnockoutRoundOne(participants);
    } else {
      matches = generateLeagueSchedule(participants);
    }
    
    // Insert matches
    const matchInserts = matches.map((match) => ({
      tournament_id: tournamentId,
      home_participant_id: match.homeParticipantId,
      away_participant_id: match.awayParticipantId,
      home_team_id: null,
      away_team_id: null,
      round: match.round || 1,
      status: "scheduled",
    }));
    
    const { error } = await supabase.from("matches").insert(matchInserts);
    if (error) throw error;
  }
  
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

/**
 * Run Team Draw / Lottery for 2v2 tournaments with random_draw mode
 * Creates teams and assigns participants randomly (2 per team)
 * Must be called BEFORE generateMatchesAction for team tournaments
 */
export async function runTeamDrawAction(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  
  console.log("[runTeamDrawAction] Starting team draw for tournament:", tournamentId);
  
  // Get tournament info
  const { data: tournament, error: fetchError } = await supabase
    .from("tournaments")
    .select("players_per_team, team_formation_mode")
    .eq("id", tournamentId)
    .single();
    
  if (fetchError) {
    console.error("[runTeamDrawAction] Failed to fetch tournament:", fetchError);
    throw new Error("فشل في جلب بيانات البطولة");
  }
    
  if (!tournament) throw new Error("البطولة غير موجودة");
  
  console.log("[runTeamDrawAction] Tournament settings:", {
    players_per_team: tournament.players_per_team,
    players_per_team_type: typeof tournament.players_per_team,
    team_formation_mode: tournament.team_formation_mode,
  });
  
  // Use Number() to handle potential type mismatch
  const playersPerTeam = Number(tournament.players_per_team) || 1;
  
  if (playersPerTeam !== 2) {
    console.error("[runTeamDrawAction] Not a 2v2 tournament:", playersPerTeam);
    throw new Error("تشكيل الفرق متاح فقط لبطولات 2v2");
  }
  
  if (tournament.team_formation_mode !== "random_draw") {
    console.error("[runTeamDrawAction] Not random_draw mode:", tournament.team_formation_mode);
    throw new Error("هذه البطولة ليست بنظام القرعة العشوائية");
  }
  
  // Get all participants
  const { data: participants } = await supabase
    .from("participants")
    .select("id, name")
    .eq("tournament_id", tournamentId);
  
  console.log("[runTeamDrawAction] Participants found:", participants?.length ?? 0);
    
  if (!participants || participants.length < 4) {
    throw new Error("يجب أن يكون هناك 4 مشاركين على الأقل للعب 2v2");
  }
  
  // Validate even number of participants
  if (participants.length % 2 !== 0) {
    throw new Error(`عدد المشاركين (${participants.length}) غير مناسب لتكوين فرق - لازم عدد زوجي`);
  }
  
  // Delete existing teams and team_members for this tournament (allows re-draw)
  const { data: existingTeams } = await supabase
    .from("teams")
    .select("id")
    .eq("tournament_id", tournamentId);
  
  console.log("[runTeamDrawAction] Existing teams to delete:", existingTeams?.length ?? 0);
  
  if (existingTeams && existingTeams.length > 0) {
    // Delete team members first (foreign key constraint)
    const { error: deleteMembersError } = await supabase
      .from("team_members")
      .delete()
      .in("team_id", existingTeams.map(t => t.id));
    
    if (deleteMembersError) {
      console.error("[runTeamDrawAction] Failed to delete team members:", deleteMembersError);
    }
    
    // Delete teams
    const { error: deleteTeamsError } = await supabase
      .from("teams")
      .delete()
      .eq("tournament_id", tournamentId);
    
    if (deleteTeamsError) {
      console.error("[runTeamDrawAction] Failed to delete teams:", deleteTeamsError);
    }
  }
  
  // Shuffle participants randomly using Fisher-Yates
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  const numTeams = shuffled.length / 2;
  console.log("[runTeamDrawAction] Creating", numTeams, "teams");
  
  // Create team names (فريق A, فريق B, etc.)
  const teamLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const teamsToInsert = [];
  for (let i = 0; i < numTeams; i++) {
    teamsToInsert.push({
      tournament_id: tournamentId,
      name: `فريق ${teamLetters[i] ?? i + 1}`,
    });
  }
  
  const { data: insertedTeams, error: insertTeamsError } = await supabase
    .from("teams")
    .insert(teamsToInsert)
    .select();
  
  if (insertTeamsError) {
    console.error("[runTeamDrawAction] Failed to insert teams:", insertTeamsError);
    throw insertTeamsError;
  }
  if (!insertedTeams || insertedTeams.length === 0) {
    throw new Error("فشل في إنشاء الفرق");
  }
  
  console.log("[runTeamDrawAction] Teams created:", insertedTeams.map(t => ({ id: t.id, name: t.name })));
  
  // Assign 2 participants per team
  const teamMembersToInsert = [];
  let participantIndex = 0;
  
  for (const team of insertedTeams) {
    for (let j = 0; j < 2 && participantIndex < shuffled.length; j++) {
      teamMembersToInsert.push({
        team_id: team.id,
        participant_id: shuffled[participantIndex].id,
      });
      participantIndex++;
    }
  }
  
  console.log("[runTeamDrawAction] Team members to insert:", teamMembersToInsert.length);
  
  const { error: insertMembersError } = await supabase
    .from("team_members")
    .insert(teamMembersToInsert);
  
  if (insertMembersError) {
    console.error("[runTeamDrawAction] Failed to insert team members:", insertMembersError);
    throw insertMembersError;
  }
  
  // Verify the teams and members were created
  const { data: verifyTeams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("tournament_id", tournamentId);
  
  const { data: verifyMembers } = await supabase
    .from("team_members")
    .select("team_id, participant_id")
    .in("team_id", (verifyTeams || []).map(t => t.id));
  
  console.log("[runTeamDrawAction] SUCCESS - Final verification:", {
    teamsCreated: verifyTeams?.length ?? 0,
    membersCreated: verifyMembers?.length ?? 0,
    teams: verifyTeams?.map(t => t.name),
    membersByTeam: verifyTeams?.map(t => ({
      team: t.name,
      memberCount: verifyMembers?.filter(m => m.team_id === t.id).length ?? 0
    }))
  });
  
  revalidatePath("/admin");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/t`);
}

export async function addParticipant(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .ilike("name", name)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from("participants").insert({
    tournament_id: tournamentId,
    name,
    registration_status: "approved",
    approved_at: new Date().toISOString(),
  });
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/participants");
}

export async function addParticipantsBulk(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const raw = String(formData.get("names") ?? "");
  const names = raw
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length === 0) return;

  const supabase = createAdminClient();
  const { data: existingRows } = await supabase
    .from("participants")
    .select("name")
    .eq("tournament_id", tournamentId);

  const existingNames = new Set(
    (existingRows ?? []).map((row: { name: string }) => row.name.toLowerCase()),
  );

  const uniqueNames: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const normalized = name.toLowerCase();
    if (seen.has(normalized) || existingNames.has(normalized)) continue;
    seen.add(normalized);
    uniqueNames.push(name);
  }

  if (uniqueNames.length === 0) return;

  const now = new Date().toISOString();
  const inserts = uniqueNames.map((name) => ({
    tournament_id: tournamentId,
    name,
    registration_status: "approved",
    approved_at: now,
  }));

  const { error } = await supabase.from("participants").insert(inserts);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/participants");
  revalidatePath("/t");
}

export async function removeParticipant(formData: FormData) {
  await assertAdmin();
  const participantId = String(formData.get("participantId"));
  const tournamentId = String(formData.get("tournamentId"));
  
  const supabase = createAdminClient();
  
  // Verify the participant belongs to this tournament
  const { data: participant } = await supabase
    .from("participants")
    .select("id, tournament_id")
    .eq("id", participantId)
    .single();

  if (!participant || participant.tournament_id !== tournamentId) {
    throw new Error("هذا المشارك لا ينتمي إلى هذه البطولة");
  }

  const { error } = await supabase.from("participants").delete().eq("id", participantId);
  if (error) throw error;
  
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
}

export async function approveRegistration(formData: FormData) {
  await assertAdmin();
  const participantId = String(formData.get("participantId"));
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", participantId)
    .eq("tournament_id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin/t");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/t");
  revalidatePath("/tournaments");
  revalidatePath("/");
}

export async function rejectRegistration(formData: FormData) {
  await assertAdmin();
  const participantId = String(formData.get("participantId"));
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .update({ status: "rejected" })
    .eq("id", participantId)
    .eq("tournament_id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin/t");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function updateParticipant(formData: FormData) {
  await assertAdmin();
  const participantId = String(formData.get("participantId"));
  const tournamentId = String(formData.get("tournamentId"));
  const newName = String(formData.get("name") ?? "").trim();

  // Validation
  if (!newName || newName.length === 0) {
    throw new Error("اسم المشارك لا يمكن أن يكون فارغًا");
  }

  const supabase = createAdminClient();

  // Check for duplicate names (case-insensitive) in the same tournament
  const { data: existingParticipants } = await supabase
    .from("participants")
    .select("id, name")
    .eq("tournament_id", tournamentId)
    .ilike("name", newName);

  if (existingParticipants && existingParticipants.length > 0) {
    const isDuplicate = existingParticipants.some((p: { id: string }) => p.id !== participantId);
    if (isDuplicate) {
      throw new Error("اسم المشارك موجود بالفعل في هذه البطولة");
    }
  }

  // Update the participant name
  const { error } = await supabase
    .from("participants")
    .update({ name: newName })
    .eq("id", participantId);

  if (error) throw error;

  // Revalidate all paths that display participants
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/participants");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/bracket");
}

export async function setTournamentType(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const type = String(formData.get("type"));
  const supabase = createAdminClient();
  const { error } = await supabase.from("tournaments").update({ type }).eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

/**
 * Set tournament format: individual (1v1) or team-based (2v2) with formation mode
 * Can be called AFTER registration to change the format
 */
export async function setTournamentFormat(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const format = String(formData.get("format")); // "individual", "team_preformed", "team_random"
  
  console.log("[setTournamentFormat] Setting format:", { tournamentId, format });
  
  let playersPerTeam: number;
  let teamFormationMode: string | null;
  
  switch (format) {
    case "individual":
      playersPerTeam = 1;
      teamFormationMode = null;
      break;
    case "team_preformed":
      playersPerTeam = 2;
      teamFormationMode = "preformed";
      break;
    case "team_random":
      playersPerTeam = 2;
      teamFormationMode = "random_draw";
      break;
    default:
      throw new Error("صيغة غير صالحة");
  }
  
  const supabase = createAdminClient();
  
  // Delete existing teams if switching to individual
  if (playersPerTeam === 1) {
    const { data: existingTeams } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournamentId);
    
    if (existingTeams && existingTeams.length > 0) {
      await supabase.from("team_members").delete().in("team_id", existingTeams.map(t => t.id));
      await supabase.from("teams").delete().eq("tournament_id", tournamentId);
    }
  }
  
  const { error } = await supabase
    .from("tournaments")
    .update({ 
      players_per_team: playersPerTeam,
      team_formation_mode: teamFormationMode 
    })
    .eq("id", tournamentId);
  
  if (error) {
    console.error("[setTournamentFormat] Update error:", error);
    throw error;
  }
  
  console.log("[setTournamentFormat] SUCCESS:", { playersPerTeam, teamFormationMode });
  
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function setPlayersPerTeam(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const playersPerTeam = Number(formData.get("playersPerTeam"));
  // FIFA only supports 1v1 or 2v2
  if (playersPerTeam !== 1 && playersPerTeam !== 2) {
    throw new Error("FIFA يدعم فقط 1v1 أو 2v2");
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ players_per_team: playersPerTeam })
    .eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function createTeams(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  // Get tournament settings
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("players_per_team")
    .eq("id", tournamentId)
    .single();

  if (!tournament) throw new Error("البطولة غير موجودة");

  const playersPerTeam = tournament.players_per_team ?? 1;

  // Get all participants
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  if (!participants || participants.length === 0) {
    throw new Error("لا يوجد مشاركون في هذه البطولة");
  }

  // If 1v1, no team creation needed
  if (playersPerTeam === 1) {
    revalidatePath("/admin");
    revalidatePath("/admin/t");
    return;
  }

  // 2v2: Require even number of participants
  if (participants.length % 2 !== 0) {
    throw new Error(`عدد المشاركين (${participants.length}) يجب أن يكون زوجياً للعب 2v2`);
  }

  if (participants.length < 4) {
    throw new Error("يجب أن يكون هناك 4 مشاركين على الأقل للعب 2v2");
  }

  // Delete existing teams for this tournament
  const { error: deleteTeamsError } = await supabase
    .from("teams")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteTeamsError) throw deleteTeamsError;

  // Shuffle participants randomly
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  // Calculate number of teams (always full teams for 2v2)
  const numTeams = shuffled.length / 2;

  // Create teams
  const teamNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const teamsToInsert = [];
  for (let i = 0; i < numTeams; i++) {
    teamsToInsert.push({
      tournament_id: tournamentId,
      name: `فريق ${teamNames[i] ?? i + 1}`,
    });
  }

  const { data: insertedTeams, error: insertTeamsError } = await supabase
    .from("teams")
    .insert(teamsToInsert)
    .select();
  if (insertTeamsError) throw insertTeamsError;

  // Assign participants to teams (2 per team)
  const teamMembersToInsert = [];
  let participantIndex = 0;
  for (const team of insertedTeams) {
    for (let j = 0; j < 2; j++) {
      teamMembersToInsert.push({
        team_id: team.id,
        participant_id: shuffled[participantIndex].id,
        user_id: null, // NULL for public registrations (no auth yet)
      });
      participantIndex++;
    }
  }

  const { error: insertMembersError } = await supabase
    .from("team_members")
    .insert(teamMembersToInsert);
  if (insertMembersError) throw insertMembersError;

  revalidatePath("/admin");
  revalidatePath("/admin/t");

  return;
}

export async function deleteTeams(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("tournament_id", tournamentId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
}

export async function updateTeamName(formData: FormData) {
  await assertAdmin();
  const teamId = String(formData.get("teamId"));
  const tournamentId = String(formData.get("tournamentId"));
  const name = String(formData.get("name")).trim();
  
  if (!name) {
    throw new Error("اسم الفريق مطلوب");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("teams")
    .update({ name })
    .eq("id", teamId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/bracket");
}

export async function savePairings(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const raw = String(formData.get("pairings") ?? "");
  if (!raw) return;

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("tournament_pairings")
    .select("id")
    .eq("tournament_id", tournamentId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const pairings = JSON.parse(raw) as {
    homeParticipantId: string;
    awayParticipantId: string | null;
  }[];

  if (!Array.isArray(pairings) || pairings.length === 0) return;

  const inserts = pairings.map((pairing) => ({
    tournament_id: tournamentId,
    home_participant_id: pairing.homeParticipantId,
    away_participant_id: pairing.awayParticipantId,
  }));

  const { error } = await supabase.from("tournament_pairings").insert(inserts);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
}

export async function saveSchedule(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const raw = String(formData.get("schedule") ?? "");
  if (!raw) return;

  const supabase = createAdminClient();

  const { data: existingMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .limit(1);

  if (existingMatches && existingMatches.length > 0) return;

  const schedule = JSON.parse(raw) as {
    round: number;
    homeParticipantId: string | null;
    awayParticipantId: string | null;
  }[];

  if (!Array.isArray(schedule) || schedule.length === 0) return;

  const inserts = schedule.map((match) => ({
    tournament_id: tournamentId,
    round: match.round,
    home_participant_id: match.homeParticipantId,
    away_participant_id: match.awayParticipantId,
    status: match.awayParticipantId ? "scheduled" : "completed",
    winner_participant_id: match.awayParticipantId ? null : match.homeParticipantId,
  }));

  const { error } = await supabase.from("matches").insert(inserts);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/bracket");
}

export async function resetDraw(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  // Delete matches
  const { error: deleteMatchesError } = await supabase
    .from("matches")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteMatchesError) throw deleteMatchesError;

  // Delete pairings
  const { error: deletePairingsError } = await supabase
    .from("tournament_pairings")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deletePairingsError) throw deletePairingsError;

  // Delete teams (this also deletes team_members via cascade)
  const { error: deleteTeamsError } = await supabase
    .from("teams")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteTeamsError && deleteTeamsError.code !== "42P01") throw deleteTeamsError;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/bracket");
}

export async function generateDraw(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const type = String(formData.get("type"));
  const supabase = createAdminClient();

  // Get tournament settings
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("players_per_team")
    .eq("id", tournamentId)
    .single();

  const playersPerTeam = tournament?.players_per_team ?? 1;

  // Delete existing matches
  const { error: deleteError } = await supabase.from("matches")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteError) throw deleteError;

  // If team-based (players_per_team > 1), use teams
  if (playersPerTeam > 1) {
    const { data: teams } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (!teams || teams.length === 0) {
      throw new Error("لم يتم إنشاء الفرق بعد. يرجى إجراء القرعة أولاً.");
    }

    if (type === "league") {
      const rawSchedule = generateLeagueScheduleTeams(teams);
      const schedule = randomizeAndOrderTeamMatches(rawSchedule);
      const inserts = schedule.map((match) => ({
        tournament_id: tournamentId,
        round: match.round,
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        status: "scheduled",
      }));
      if (inserts.length > 0) {
        const { error } = await supabase.from("matches").insert(inserts);
        if (error) throw error;
      }
    }

    if (type === "knockout") {
      const roundOne = generateKnockoutRoundOneTeams(teams);
      const inserts = roundOne.map((match) => ({
        tournament_id: tournamentId,
        round: 1,
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        status: match.awayTeamId ? "scheduled" : "completed",
        winner_team_id: match.awayTeamId ? null : match.homeTeamId,
      }));
      if (inserts.length > 0) {
        const { error } = await supabase.from("matches").insert(inserts);
        if (error) throw error;
      }
    }
  } else {
    // Individual (1v1) - use participants directly
    const { data: participants } = await supabase
      .from("participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (!participants || participants.length === 0) return;

    if (type === "league") {
      const rawSchedule = generateLeagueSchedule(participants);
      const schedule = randomizeAndOrderMatches(rawSchedule);
      const inserts = schedule.map((match) => ({
        tournament_id: tournamentId,
        round: match.round,
        home_participant_id: match.homeParticipantId,
        away_participant_id: match.awayParticipantId,
        status: "scheduled",
      }));
      if (inserts.length > 0) {
        const { error } = await supabase.from("matches").insert(inserts);
        if (error) throw error;
      }
    }

    if (type === "knockout") {
      const roundOne = generateKnockoutRoundOne(participants);
      const inserts = roundOne.map((match) => ({
        tournament_id: tournamentId,
        round: 1,
        home_participant_id: match.homeParticipantId,
        away_participant_id: match.awayParticipantId,
        status: match.awayParticipantId ? "scheduled" : "completed",
        winner_participant_id: match.awayParticipantId ? null : match.homeParticipantId,
      }));
      if (inserts.length > 0) {
        const { error } = await supabase.from("matches").insert(inserts);
        if (error) throw error;
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/bracket");
}

export async function startTournament(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  const { error } = await supabase.from("tournaments").update({ status: "running" }).eq("id", tournamentId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/t");
}

export async function updateMatchScore(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));
  const tournamentId = String(formData.get("tournamentId"));
  const round = Number(formData.get("round"));

  const supabase = createAdminClient();

  // Get tournament to check format (1v1 vs 2v2)
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("type, players_per_team")
    .eq("id", tournamentId)
    .maybeSingle();

  const isTeamBased = (tournament?.players_per_team ?? 1) === 2;

  // Get the match to determine winner entity
  const { data: match } = await supabase
    .from("matches")
    .select("home_participant_id, away_participant_id, home_team_id, away_team_id")
    .eq("id", matchId)
    .maybeSingle();

  // Determine winner based on format
  let winnerUpdate: Record<string, string | null> = {};
  if (!Number.isNaN(homeScore) && !Number.isNaN(awayScore) && homeScore !== awayScore) {
    if (isTeamBased) {
      // 2v2: set winner_team_id
      const winnerTeamId = homeScore > awayScore ? match?.home_team_id : match?.away_team_id;
      winnerUpdate = { winner_team_id: winnerTeamId, winner_participant_id: null };
    } else {
      // 1v1: set winner_participant_id
      const winnerParticipantId = homeScore > awayScore ? match?.home_participant_id : match?.away_participant_id;
      winnerUpdate = { winner_participant_id: winnerParticipantId, winner_team_id: null };
    }
  } else if (homeScore === awayScore) {
    // Draw - clear winner
    winnerUpdate = { winner_participant_id: null, winner_team_id: null };
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update({
      home_score: Number.isNaN(homeScore) ? null : homeScore,
      away_score: Number.isNaN(awayScore) ? null : awayScore,
      status:
        Number.isNaN(homeScore) || Number.isNaN(awayScore)
          ? "scheduled"
          : "completed",
      ...winnerUpdate,
    })
    .eq("id", matchId);
  if (updateError) throw updateError;

  // Handle knockout advancement for both formats
  if (tournament?.type === "knockout") {
    await handleKnockoutAdvancement(tournamentId, round, isTeamBased);
  }
  await handleFinishCheck(tournamentId, isTeamBased);

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/bracket");
  revalidatePath("/champion");
}

export async function setMatchWinner(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  const winnerId = String(formData.get("winnerId"));
  const tournamentId = String(formData.get("tournamentId"));
  const round = Number(formData.get("round"));

  const supabase = createAdminClient();
  
  // Get tournament format
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("players_per_team")
    .eq("id", tournamentId)
    .maybeSingle();

  const isTeamBased = (tournament?.players_per_team ?? 1) === 2;

  const updateData = isTeamBased
    ? { winner_team_id: winnerId, winner_participant_id: null, status: "completed" }
    : { winner_participant_id: winnerId, winner_team_id: null, status: "completed" };

  const { error } = await supabase
    .from("matches")
    .update(updateData)
    .eq("id", matchId);
  if (error) throw error;

  await handleKnockoutAdvancement(tournamentId, round, isTeamBased);
  await handleFinishCheck(tournamentId, isTeamBased);

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/t");
  revalidatePath("/bracket");
  revalidatePath("/champion");
}

export async function resetTournament(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();
  
  const { error: deleteMatchesError } = await supabase.from("matches").delete().eq("tournament_id", tournamentId);
  if (deleteMatchesError) throw deleteMatchesError;

  const { error: deletePairingsError } = await supabase
    .from("tournament_pairings")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deletePairingsError) throw deletePairingsError;

  // Delete teams (also deletes team_members via cascade)
  const { error: deleteTeamsError } = await supabase
    .from("teams")
    .delete()
    .eq("tournament_id", tournamentId);
  if (deleteTeamsError && deleteTeamsError.code !== "42P01") throw deleteTeamsError;
  
  const { error: deleteParticipantsError } = await supabase.from("participants").delete().eq("tournament_id", tournamentId);
  if (deleteParticipantsError) throw deleteParticipantsError;
  
  const { error: updateError } = await supabase
    .from("tournaments")
    .update({
      status: "registration_open",
      allow_public_registration: false,
      type: null,
      players_per_team: 1,
    })
    .eq("id", tournamentId);
  if (updateError) throw updateError;

  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/participants");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/bracket");
  revalidatePath("/champion");
  revalidatePath("/join");
}

// ─── Partial Reset / Rollback Actions ────────────────────────────────

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/t");
  revalidatePath("/participants");
  revalidatePath("/t");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/bracket");
  revalidatePath("/champion");
  revalidatePath("/join");
  revalidatePath("/tournaments");
}

/**
 * Stage 1 – Reset to Registration Open
 * Keeps: nothing except tournament shell
 * Deletes: matches, pairings, teams/team_members
 * Sets: status→registration_open, type→null, players_per_team→1
 */
export async function resetToRegistrationOpen(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  // Delete children first (referential integrity)
  await supabase.from("matches").delete().eq("tournament_id", tournamentId);
  await supabase.from("tournament_pairings").delete().eq("tournament_id", tournamentId);
  await supabase.from("teams").delete().eq("tournament_id", tournamentId);

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "registration_open",
      allow_public_registration: false,
      type: null,
      players_per_team: 1,
    })
    .eq("id", tournamentId);
  if (error) throw error;

  revalidateAll();
}

/**
 * Stage 2 – Reset to Registration Closed
 * Keeps: participants
 * Deletes: matches, pairings, teams/team_members
 * Sets: status→registration_closed, type→null, players_per_team→1
 */
export async function resetToRegistrationClosed(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  await supabase.from("matches").delete().eq("tournament_id", tournamentId);
  await supabase.from("tournament_pairings").delete().eq("tournament_id", tournamentId);
  await supabase.from("teams").delete().eq("tournament_id", tournamentId);

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "registration_closed",
      type: null,
      players_per_team: 1,
    })
    .eq("id", tournamentId);
  if (error) throw error;

  revalidateAll();
}

/**
 * Stage 3 – Reset to Type/Format Selection
 * Keeps: participants, current type/format (unless clearType checkbox sent)
 * Deletes: matches, pairings, teams/team_members
 * Sets: status→registration_closed
 */
export async function resetToTypeSelection(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const clearType = formData.get("clearType") === "true";
  const supabase = createAdminClient();

  await supabase.from("matches").delete().eq("tournament_id", tournamentId);
  await supabase.from("tournament_pairings").delete().eq("tournament_id", tournamentId);
  await supabase.from("teams").delete().eq("tournament_id", tournamentId);

  const updatePayload: Record<string, unknown> = {
    status: "registration_closed",
  };
  if (clearType) {
    updatePayload.type = null;
    updatePayload.players_per_team = 1;
  }

  const { error } = await supabase
    .from("tournaments")
    .update(updatePayload)
    .eq("id", tournamentId);
  if (error) throw error;

  revalidateAll();
}

/**
 * Stage 4 – Reset to After Team Draw
 * Keeps: participants, teams, team_members
 * Deletes: matches, pairings
 * Sets: status→registration_closed
 */
export async function resetToAfterTeamDraw(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  await supabase.from("matches").delete().eq("tournament_id", tournamentId);
  await supabase.from("tournament_pairings").delete().eq("tournament_id", tournamentId);

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "registration_closed" })
    .eq("id", tournamentId);
  if (error) throw error;

  revalidateAll();
}

/**
 * Stage 5 – Reset to After Match Generation (clear scores only)
 * Keeps: participants, teams, matches structure
 * Resets: all match scores/winners → null, status → scheduled
 * For knockout: also removes generated rounds > 1
 * Sets: tournament status→running
 */
export async function resetToAfterMatchGeneration(formData: FormData) {
  await assertAdmin();
  const tournamentId = String(formData.get("tournamentId"));
  const supabase = createAdminClient();

  // For knockout, remove auto-generated later rounds and keep only round 1
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("type")
    .eq("id", tournamentId)
    .maybeSingle();

  if (tournament?.type === "knockout") {
    await supabase.from("matches").delete().eq("tournament_id", tournamentId).gt("round", 1);
  }

  // Reset all remaining matches to scheduled, null scores
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      home_score: null,
      away_score: null,
      winner_participant_id: null,
      winner_team_id: null,
      status: "scheduled",
    })
    .eq("tournament_id", tournamentId);
  if (matchError) throw matchError;

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "running" })
    .eq("id", tournamentId);
  if (error) throw error;

  revalidateAll();
}

async function handleKnockoutAdvancement(tournamentId: string, round: number, isTeamBased: boolean) {
  const supabase = createAdminClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("type")
    .eq("id", tournamentId)
    .maybeSingle();

  if (!tournament || tournament.type !== "knockout") return;

  const { data: currentRoundMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("round", round)
    .order("created_at", { ascending: true });

  if (!currentRoundMatches || currentRoundMatches.length === 0) return;

  // Check if all matches have a winner (based on format)
  const completed = currentRoundMatches.every((match: { winner_team_id?: string; winner_participant_id?: string }) => 
    isTeamBased ? match.winner_team_id : match.winner_participant_id
  );
  if (!completed) return;

  // Get winners based on format
  const winners = currentRoundMatches.map((match: { winner_team_id?: string; winner_participant_id?: string }) => 
    isTeamBased ? match.winner_team_id : match.winner_participant_id
  );
  if (winners.length <= 1) return;

  const { data: nextRoundMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("round", round + 1);

  if (nextRoundMatches && nextRoundMatches.length > 0) return;

  // Create next round matches based on format
  const inserts = [];
  for (let i = 0; i < winners.length; i += 2) {
    const home = winners[i];
    const away = winners[i + 1] ?? null;
    
    if (isTeamBased) {
      // 2v2: use team IDs
      inserts.push({
        tournament_id: tournamentId,
        round: round + 1,
        home_team_id: home,
        away_team_id: away,
        home_participant_id: null,
        away_participant_id: null,
        status: away ? "scheduled" : "completed",
        winner_team_id: away ? null : home,
        winner_participant_id: null,
      });
    } else {
      // 1v1: use participant IDs
      inserts.push({
        tournament_id: tournamentId,
        round: round + 1,
        home_participant_id: home,
        away_participant_id: away,
        home_team_id: null,
        away_team_id: null,
        status: away ? "scheduled" : "completed",
        winner_participant_id: away ? null : home,
        winner_team_id: null,
      });
    }
  }

  const { error } = await supabase.from("matches").insert(inserts);
  if (error) throw error;
}

async function handleFinishCheck(tournamentId: string, isTeamBased: boolean) {
  const supabase = createAdminClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("type, status")
    .eq("id", tournamentId)
    .maybeSingle();

  if (!tournament || tournament.status === "finished") return;

  const { data: matches } = await supabase
    .from("matches")
    .select("home_score, away_score, winner_participant_id, winner_team_id")
    .eq("tournament_id", tournamentId);

  if (!matches || matches.length === 0) return;

  const allCompleted = matches.every((match: { winner_team_id?: string; winner_participant_id?: string; home_score?: number; away_score?: number }) => {
    if (tournament.type === "knockout") {
      // Check correct winner field based on format
      return isTeamBased ? Boolean(match.winner_team_id) : Boolean(match.winner_participant_id);
    }
    return match.home_score !== null && match.away_score !== null;
  });

  if (!allCompleted) return;

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "finished" })
    .eq("id", tournamentId);
  if (error) throw error;
}

// ===== PARTICIPANT APPROVAL ACTIONS =====

export async function approveParticipantAction(
  participantId: string,
  tournamentId: string
) {
  await assertAdmin();

  const supabase = createAdminClient();

  // Update participant status
  const { error } = await supabase
    .from("participants")
    .update({
      registration_status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", participantId)
    .eq("tournament_id", tournamentId);

  if (error) throw error;

  // Get participant to find user_id
  const { data: participant } = await supabase
    .from("participants")
    .select("user_id")
    .eq("id", participantId)
    .single();

  if (participant?.user_id) {
    // Update user stats
    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("tournaments_joined")
      .eq("user_id", participant.user_id)
      .single();

    if (currentStats) {
      await supabase
        .from("user_stats")
        .update({
          tournaments_joined: (currentStats.tournaments_joined || 0) + 1,
        })
        .eq("user_id", participant.user_id);
    }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function rejectParticipantAction(
  participantId: string,
  tournamentId: string
) {
  await assertAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("participants")
    .update({
      registration_status: "rejected",
    })
    .eq("id", participantId)
    .eq("tournament_id", tournamentId);

  if (error) throw error;

  revalidatePath(`/admin/tournaments/${tournamentId}`);
}
