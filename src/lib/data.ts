import { createAdminClient } from "@/lib/supabase/admin";
import { Match, Participant, Tournament, Pairing, Team, TeamMember, UserProfile, UserStats, Avatar } from "@/lib/types";

export async function getPublicTournaments() {
  try {
    // Use admin client to ensure we can read tournaments without auth issues
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      // .eq("is_public", true)  // Temporarily disabled until migration is applied
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[getPublicTournaments] Error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return [];
    }
    
    return (data ?? []) as Tournament[];
  } catch (err) {
    console.error("[getPublicTournaments] Exception:", err);
    return [];
  }
}

export async function getAllTournaments() {
  try {
    // Use admin client (service role) to bypass RLS issues during data load
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[getAllTournaments] Error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return [];
    }
    
    return (data ?? []) as Tournament[];
  } catch (err) {
    console.error("[getAllTournaments] Exception:", err);
    return [];
  }
}

export async function getActiveTournament() {
  try {
    // Since we don't have is_active column yet, return the latest tournament
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("[getActiveTournament] Error:", error);
      return null;
    }
    
    return data as Tournament | null;
  } catch (err) {
    console.error("[getActiveTournament] Exception:", err);
    return null;
  }
}

export async function getLatestTournament() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("[getLatestTournament] Error:", error);
      return null;
    }
    
    return data as Tournament | null;
  } catch (err) {
    console.error("[getLatestTournament] Exception:", err);
    return null;
  }
}

export async function getTournamentById(id: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("[getTournamentById] Error for id", id, ":", error);
      return null;
    }
    
    return data as Tournament | null;
  } catch (err) {
    console.error("[getTournamentById] Exception:", err);
    return null;
  }
}

export async function getTournamentBySlug(slug: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("[getTournamentBySlug] Error for slug", slug, ":", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    return data as Tournament | null;
  } catch (err) {
    console.error("[getTournamentBySlug] Exception:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function getParticipants(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    // Changed to include all registration statuses, not just 'approved'
    // Participants can be pending, approved, or rejected
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .in("registration_status", ["pending", "approved"])
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "42703" || error.code === "PGRST204") {
        const fallback = await supabase
          .from("participants")
          .select("*")
          .eq("tournament_id", tournamentId)
          .in("status", ["pending", "approved"])
          .order("created_at", { ascending: true });
        if (fallback.error) {
          console.error("[getParticipants] Fallback error:", fallback.error);
          return [];
        }
        return (fallback.data ?? []) as Participant[];
      }
      console.error("[getParticipants] Error:", error);
      return [];
    }

    return (data ?? []) as Participant[];
  } catch (err) {
    console.error("[getParticipants] Exception:", err);
    return [];
  }
}

export async function getPendingParticipants(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("registration_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42703" || error.code === "PGRST204") {
        const fallback = await supabase
          .from("participants")
          .select("*")
          .eq("tournament_id", tournamentId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (fallback.error) {
          console.error("[getPendingParticipants] Fallback error:", fallback.error);
          return [];
        }
        return (fallback.data ?? []) as Participant[];
      }
      console.error("[getPendingParticipants] Error:", error);
      return [];
    }

    return (data ?? []) as Participant[];
  } catch (err) {
    console.error("[getPendingParticipants] Exception:", err);
    return [];
  }
}

export async function getMatches(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    
    // First get matches
    const { data: matches, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true })
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("[getMatches] Error:", error);
      return [];
    }

    if (!matches || matches.length === 0) {
      return [];
    }

    // Get all participant IDs from matches
    const participantIds = new Set<string>();
    matches.forEach(m => {
      if (m.home_participant_id) participantIds.add(m.home_participant_id);
      if (m.away_participant_id) participantIds.add(m.away_participant_id);
    });

    // Get all team IDs from matches
    const teamIds = new Set<string>();
    matches.forEach(m => {
      if (m.home_team_id) teamIds.add(m.home_team_id);
      if (m.away_team_id) teamIds.add(m.away_team_id);
    });

    // Fetch participant names
    const participantMap = new Map<string, string>();
    if (participantIds.size > 0) {
      const { data: participants } = await supabase
        .from("participants")
        .select("id, name")
        .in("id", Array.from(participantIds));
      
      participants?.forEach(p => {
        participantMap.set(p.id, p.name);
      });
    }

    // Fetch team names
    const teamMap = new Map<string, string>();
    if (teamIds.size > 0) {
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name")
        .in("id", Array.from(teamIds));
      
      teams?.forEach(t => {
        teamMap.set(t.id, t.name);
      });
    }

    // Attach names to matches - prioritize team names for team-based tournaments
    const matchesWithNames = matches.map(m => {
      // For team-based matches, use team names
      const isTeamMatch = m.home_team_id || m.away_team_id;
      
      return {
        ...m,
        home_name: isTeamMatch
          ? (m.home_team_id ? teamMap.get(m.home_team_id) || null : null)
          : (m.home_participant_id ? participantMap.get(m.home_participant_id) || null : null),
        away_name: isTeamMatch
          ? (m.away_team_id ? teamMap.get(m.away_team_id) || null : null)
          : (m.away_participant_id ? participantMap.get(m.away_participant_id) || null : null),
      };
    });
    
    return matchesWithNames as (Match & { home_name: string | null; away_name: string | null })[];
  } catch (err) {
    console.error("[getMatches] Exception:", err);
    return [];
  }
}

export async function getPairings(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tournament_pairings")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (error) {
      // If table doesn't exist (42P01), return empty array silently
      if (error.code === '42P01') {
        console.warn("[getPairings] Table 'tournament_pairings' does not exist yet. Please apply migration 006_add_slug_and_pairings.sql");
        return [];
      }
      console.error("[getPairings] Error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    return (data ?? []) as Pairing[];
  } catch (err) {
    console.error("[getPairings] Exception:", err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getTeams(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (error) {
      // Handle table not existing (42P01) or relation does not exist error
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.code === "PGRST116") {
        console.warn("[getTeams] Table 'teams' does not exist yet. Please apply migration 007_teams_schema.sql");
        return [];
      }
      console.error("[getTeams] Error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    return (data ?? []) as Team[];
  } catch (err) {
    console.error("[getTeams] Exception:", err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function getTeamMembers(teamId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        console.warn("[getTeamMembers] Table 'team_members' does not exist yet.");
        return [];
      }
      console.error("[getTeamMembers] Error:", error);
      return [];
    }

    return (data ?? []) as TeamMember[];
  } catch (err) {
    console.error("[getTeamMembers] Exception:", err);
    return [];
  }
}

export async function getTeamMembersByTournament(tournamentId: string) {
  try {
    const supabase = createAdminClient();
    // Get all teams for this tournament, then get all members
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournamentId);

    if (teamsError) {
      if (teamsError.code === "42P01") return [];
      console.error("[getTeamMembersByTournament] Error:", teamsError);
      return [];
    }

    if (!teams || teams.length === 0) return [];

    const teamIds = teams.map((t) => t.id);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .in("team_id", teamIds);

    if (error) {
      console.error("[getTeamMembersByTournament] Error:", error);
      return [];
    }

    return (data ?? []) as TeamMember[];
  } catch (err) {
    console.error("[getTeamMembersByTournament] Exception:", err);
    return [];
  }
}

// ===== USER PROFILE FUNCTIONS =====

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[getUserProfile] Error:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("[getUserProfile] Exception:", err);
    return null;
  }
}

export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const profileMap = new Map<string, UserProfile>();
  if (userIds.length === 0) return profileMap;
  
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .in("id", userIds);

    if (error) {
      console.error("[getUserProfiles] Error:", error);
      return profileMap;
    }

    for (const profile of (data ?? [])) {
      profileMap.set(profile.id, profile as UserProfile);
    }
    return profileMap;
  } catch (err) {
    console.error("[getUserProfiles] Exception:", err);
    return profileMap;
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("[getUserStats] Error:", error);
      return null;
    }

    return data as UserStats;
  } catch (err) {
    console.error("[getUserStats] Exception:", err);
    return null;
  }
}

export async function getAvatars(): Promise<Avatar[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("avatars")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("[getAvatars] Error:", error);
      return [];
    }

    return (data ?? []) as Avatar[];
  } catch (err) {
    console.error("[getAvatars] Exception:", err);
    return [];
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profile)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("[updateUserProfile] Error:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("[updateUserProfile] Exception:", err);
    return null;
  }
}

export async function updateUserStats(userId: string, stats: Partial<UserStats>) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_stats")
      .update(stats)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[updateUserStats] Error:", error);
      return null;
    }

    return data as UserStats;
  } catch (err) {
    console.error("[updateUserStats] Exception:", err);
    return null;
  }
}

export async function getUserTournamentParticipations(userId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("participants")
      .select(`
        id,
        tournament_id,
        registration_status,
        team_id,
        created_at,
        tournaments (
          id,
          name,
          slug,
          status,
          start_date
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getUserTournamentParticipations] Error:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("[getUserTournamentParticipations] Exception:", err);
    return [];
  }
}

// Compute live user stats from actual match data across all tournaments
export interface ComputedUserStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  winRate: number;
}

export interface TournamentActivity {
  tournamentId: string;
  tournamentName: string;
  tournamentSlug: string;
  status: string;
  teamName: string | null;
  wins: number;
  draws: number;
  losses: number;
  rank: number | null;
}

export async function computeUserStatsFromMatches(userId: string): Promise<ComputedUserStats> {
  try {
    const supabase = createAdminClient();
    
    // Get all participant IDs for this user across all tournaments
    const { data: participations, error: partError } = await supabase
      .from("participants")
      .select("id, tournament_id, team_id")
      .eq("user_id", userId);
    
    if (partError || !participations || participations.length === 0) {
      return { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, winRate: 0 };
    }
    
    const participantIds = participations.map(p => p.id);
    const teamIds = participations.map(p => p.team_id).filter(Boolean) as string[];
    
    // Get all completed matches where user participated (as participant or via team)
    let matches: {
      home_participant_id: string | null;
      away_participant_id: string | null;
      home_team_id: string | null;
      away_team_id: string | null;
      home_user_id: string | null;
      away_user_id: string | null;
      home_score: number | null;
      away_score: number | null;
      winner_participant_id: string | null;
      winner_team_id: string | null;
      winner_user_id: string | null;
      status: string;
    }[] = [];
    
    // Query matches where user is home or away (via participant_id, team_id, or user_id)
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select(`
        home_participant_id,
        away_participant_id,
        home_team_id,
        away_team_id,
        home_user_id,
        away_user_id,
        home_score,
        away_score,
        winner_participant_id,
        winner_team_id,
        winner_user_id,
        status
      `)
      .eq("status", "completed");
    
    if (matchError) {
      console.error("[computeUserStatsFromMatches] Match query error:", matchError);
      return { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, winRate: 0 };
    }
    
    // Filter matches where user participated
    matches = (matchData ?? []).filter(m => {
      const isHomeParticipant = m.home_participant_id && participantIds.includes(m.home_participant_id);
      const isAwayParticipant = m.away_participant_id && participantIds.includes(m.away_participant_id);
      const isHomeTeam = m.home_team_id && teamIds.includes(m.home_team_id);
      const isAwayTeam = m.away_team_id && teamIds.includes(m.away_team_id);
      const isHomeUser = m.home_user_id === userId;
      const isAwayUser = m.away_user_id === userId;
      
      return isHomeParticipant || isAwayParticipant || isHomeTeam || isAwayTeam || isHomeUser || isAwayUser;
    });
    
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    
    for (const match of matches) {
      // Determine if user was home or away
      const isHome = 
        (match.home_participant_id && participantIds.includes(match.home_participant_id)) ||
        (match.home_team_id && teamIds.includes(match.home_team_id)) ||
        (match.home_user_id === userId);
      
      const myScore = isHome ? (match.home_score ?? 0) : (match.away_score ?? 0);
      const oppScore = isHome ? (match.away_score ?? 0) : (match.home_score ?? 0);
      
      goalsScored += myScore;
      goalsConceded += oppScore;
      
      // Determine result
      const isWinner = 
        (match.winner_participant_id && participantIds.includes(match.winner_participant_id)) ||
        (match.winner_team_id && teamIds.includes(match.winner_team_id)) ||
        (match.winner_user_id === userId);
      
      if (myScore === oppScore) {
        draws++;
      } else if (isWinner || myScore > oppScore) {
        wins++;
      } else {
        losses++;
      }
    }
    
    const matchesPlayed = matches.length;
    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
    
    return { matchesPlayed, wins, draws, losses, goalsScored, goalsConceded, winRate };
  } catch (err) {
    console.error("[computeUserStatsFromMatches] Exception:", err);
    return { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, winRate: 0 };
  }
}

export async function getUserTournamentActivities(userId: string): Promise<TournamentActivity[]> {
  try {
    const supabase = createAdminClient();
    
    // Get all participations with tournament info
    const { data: participations, error: partError } = await supabase
      .from("participants")
      .select(`
        id,
        tournament_id,
        team_id,
        tournaments (
          id,
          name,
          slug,
          status
        )
      `)
      .eq("user_id", userId);
    
    if (partError || !participations) {
      console.error("[getUserTournamentActivities] Error:", partError);
      return [];
    }
    
    const activities: TournamentActivity[] = [];
    
    for (const participation of participations) {
      const tournament = participation.tournaments as { id: string; name: string; slug: string; status: string } | null;
      if (!tournament) continue;
      
      // Get team name if team-based
      let teamName: string | null = null;
      if (participation.team_id) {
        const { data: team } = await supabase
          .from("teams")
          .select("name")
          .eq("id", participation.team_id)
          .single();
        teamName = team?.name ?? null;
      }
      
      // Get matches for this tournament where user participated
      const { data: tournamentMatches } = await supabase
        .from("matches")
        .select(`
          home_participant_id,
          away_participant_id,
          home_team_id,
          away_team_id,
          home_user_id,
          away_user_id,
          home_score,
          away_score,
          winner_participant_id,
          winner_team_id,
          winner_user_id,
          status
        `)
        .eq("tournament_id", tournament.id)
        .eq("status", "completed");
      
      // Filter to user's matches
      const userMatches = (tournamentMatches ?? []).filter(m => {
        return (
          m.home_participant_id === participation.id ||
          m.away_participant_id === participation.id ||
          (participation.team_id && (m.home_team_id === participation.team_id || m.away_team_id === participation.team_id)) ||
          m.home_user_id === userId ||
          m.away_user_id === userId
        );
      });
      
      let wins = 0;
      let draws = 0;
      let losses = 0;
      
      for (const match of userMatches) {
        const isHome = 
          match.home_participant_id === participation.id ||
          (participation.team_id && match.home_team_id === participation.team_id) ||
          match.home_user_id === userId;
        
        const myScore = isHome ? (match.home_score ?? 0) : (match.away_score ?? 0);
        const oppScore = isHome ? (match.away_score ?? 0) : (match.home_score ?? 0);
        
        const isWinner = 
          match.winner_participant_id === participation.id ||
          (participation.team_id && match.winner_team_id === participation.team_id) ||
          match.winner_user_id === userId;
        
        if (myScore === oppScore) {
          draws++;
        } else if (isWinner || myScore > oppScore) {
          wins++;
        } else {
          losses++;
        }
      }
      
      activities.push({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        tournamentSlug: tournament.slug,
        status: tournament.status,
        teamName,
        wins,
        draws,
        losses,
        rank: null, // TODO: Calculate rank from standings if finished
      });
    }
    
    return activities;
  } catch (err) {
    console.error("[getUserTournamentActivities] Exception:", err);
    return [];
  }
}