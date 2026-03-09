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
    // Get all participants - filter includes approved, pending, and null (legacy)
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getParticipants] Error:", error);
      return [];
    }

    // Filter out only explicitly rejected participants
    const filtered = (data ?? []).filter(p => 
      p.registration_status !== "rejected"
    );

    return filtered as Participant[];
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
  yellowCards: number;
  redCards: number;
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

export interface TournamentPlacementStats {
  tournamentsParticipated: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  thirdPlaceFinishes: number;
  finalAppearances: number;
  podiumFinishes: number;
}

export async function getUserTournamentPlacementStats(userId: string): Promise<TournamentPlacementStats> {
  try {
    const supabase = createAdminClient();
    
    let tournamentsParticipated = 0;
    let firstPlaceFinishes = 0;
    let secondPlaceFinishes = 0;
    let thirdPlaceFinishes = 0;
    let finalAppearances = 0;

    // Get all finished tournaments where user participated
    const { data: participations, error: partError } = await supabase
      .from("participants")
      .select(`
        id,
        tournament_id,
        team_id,
        user_id,
        tournaments (
          id,
          name,
          type,
          status,
          players_per_team
        )
      `)
      .eq("user_id", userId);

    if (partError || !participations) {
      console.error("[getUserTournamentPlacementStats] Error:", partError);
      return { tournamentsParticipated: 0, firstPlaceFinishes: 0, secondPlaceFinishes: 0, thirdPlaceFinishes: 0, finalAppearances: 0, podiumFinishes: 0 };
    }

    // Also get user's team memberships (teams formed via team_members table)
    const { data: teamMemberships } = await supabase
      .from("team_members")
      .select("team_id, teams(tournament_id)")
      .eq("user_id", userId);
    
    // Build a map of tournament_id -> team_id for easy lookup
    const tournamentTeamMap = new Map<string, string>();
    if (teamMemberships) {
      for (const tm of teamMemberships) {
        const team = Array.isArray(tm.teams) ? tm.teams[0] : tm.teams;
        if (team && tm.team_id) {
          tournamentTeamMap.set(team.tournament_id, tm.team_id);
        }
      }
    }

    // Filter to finished tournaments only
    const finishedParticipations = participations.filter(p => {
      const tournament = Array.isArray(p.tournaments) ? p.tournaments[0] : p.tournaments;
      return tournament?.status === "finished";
    });

    tournamentsParticipated = finishedParticipations.length;

    for (const participation of finishedParticipations) {
      const tournament = Array.isArray(participation.tournaments) 
        ? participation.tournaments[0] 
        : participation.tournaments;
      
      if (!tournament) continue;

      // Get the user's team for this tournament (from team_members OR participants.team_id)
      const userTeamId = tournamentTeamMap.get(tournament.id) || participation.team_id;
      const isTeamBased = (tournament.players_per_team ?? 1) > 1;

      // Get all matches for this tournament
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .eq("status", "completed")
        .order("round", { ascending: false });

      if (!matches || matches.length === 0) continue;

      const isKnockout = tournament.type === "knockout";

      if (isKnockout) {
        // For knockout: find the final match (highest round)
        const maxRound = Math.max(...matches.map(m => m.round));
        const finalMatch = matches.find(m => m.round === maxRound);
        
        if (finalMatch) {
          // Check if user was in the final (via team_id, participant_id, or user_id)
          const isInFinal = 
            finalMatch.home_participant_id === participation.id ||
            finalMatch.away_participant_id === participation.id ||
            (userTeamId && (finalMatch.home_team_id === userTeamId || finalMatch.away_team_id === userTeamId)) ||
            finalMatch.home_user_id === userId ||
            finalMatch.away_user_id === userId;

          if (isInFinal) {
            finalAppearances++;
            
            // Check if winner (via team_id, participant_id, or user_id)
            const isWinner = 
              finalMatch.winner_participant_id === participation.id ||
              (userTeamId && finalMatch.winner_team_id === userTeamId) ||
              finalMatch.winner_user_id === userId;

            if (isWinner) {
              firstPlaceFinishes++;
            } else {
              secondPlaceFinishes++;
            }
          } else {
            // Check semi-final (second highest round)
            const semiFinalRound = maxRound - 1;
            const semiFinals = matches.filter(m => m.round === semiFinalRound);
            
            for (const semi of semiFinals) {
              const wasInSemi = 
                semi.home_participant_id === participation.id ||
                semi.away_participant_id === participation.id ||
                (userTeamId && (semi.home_team_id === userTeamId || semi.away_team_id === userTeamId)) ||
                semi.home_user_id === userId ||
                semi.away_user_id === userId;
              
              if (wasInSemi) {
                // Lost in semi = 3rd/4th place (count as 3rd)
                const lostSemi = 
                  semi.winner_participant_id !== participation.id &&
                  (!userTeamId || semi.winner_team_id !== userTeamId) &&
                  semi.winner_user_id !== userId;
                
                if (lostSemi) {
                  thirdPlaceFinishes++;
                }
                break;
              }
            }
          }
        }
      } else {
        // For league: calculate standings based on points
        const standings: Map<string, { points: number; goalDiff: number; participantId: string | null; teamId: string | null; userId: string | null }> = new Map();
        
        for (const match of matches) {
          // Determine the entity ID for home and away (prioritize team for team-based)
          const homeId = isTeamBased 
            ? (match.home_team_id || match.home_user_id || match.home_participant_id)
            : (match.home_participant_id || match.home_user_id);
          const awayId = isTeamBased
            ? (match.away_team_id || match.away_user_id || match.away_participant_id)
            : (match.away_participant_id || match.away_user_id);
          
          if (!homeId || !awayId) continue;
          
          if (!standings.has(homeId)) {
            standings.set(homeId, { 
              points: 0, 
              goalDiff: 0, 
              participantId: match.home_participant_id, 
              teamId: match.home_team_id,
              userId: match.home_user_id 
            });
          }
          if (!standings.has(awayId)) {
            standings.set(awayId, { 
              points: 0, 
              goalDiff: 0, 
              participantId: match.away_participant_id, 
              teamId: match.away_team_id,
              userId: match.away_user_id
            });
          }
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          const homeStats = standings.get(homeId)!;
          const awayStats = standings.get(awayId)!;
          
          homeStats.goalDiff += homeScore - awayScore;
          awayStats.goalDiff += awayScore - homeScore;
          
          if (homeScore > awayScore) {
            homeStats.points += 3;
          } else if (awayScore > homeScore) {
            awayStats.points += 3;
          } else {
            homeStats.points += 1;
            awayStats.points += 1;
          }
        }
        
        // Sort by points, then goal difference
        const sortedStandings = Array.from(standings.entries())
          .sort((a, b) => {
            if (b[1].points !== a[1].points) return b[1].points - a[1].points;
            return b[1].goalDiff - a[1].goalDiff;
          });
        
        // Find user's position - check by team_id, participant_id, or user_id
        const userPosition = sortedStandings.findIndex(([key, stats]) => 
          key === userTeamId ||
          key === participation.id ||
          key === userId ||
          stats.participantId === participation.id || 
          stats.teamId === userTeamId ||
          stats.userId === userId
        );
        
        if (userPosition === 0) {
          firstPlaceFinishes++;
          finalAppearances++; // 1st place counts as reaching final in league
        } else if (userPosition === 1) {
          secondPlaceFinishes++;
          finalAppearances++; // 2nd place also counts as reaching final
        } else if (userPosition === 2) {
          thirdPlaceFinishes++;
        }
      }
    }

    const podiumFinishes = firstPlaceFinishes + secondPlaceFinishes + thirdPlaceFinishes;

    return {
      tournamentsParticipated,
      firstPlaceFinishes,
      secondPlaceFinishes,
      thirdPlaceFinishes,
      finalAppearances,
      podiumFinishes
    };
  } catch (err) {
    console.error("[getUserTournamentPlacementStats] Exception:", err);
    return { tournamentsParticipated: 0, firstPlaceFinishes: 0, secondPlaceFinishes: 0, thirdPlaceFinishes: 0, finalAppearances: 0, podiumFinishes: 0 };
  }
}

export async function computeUserStatsFromMatches(userId: string): Promise<ComputedUserStats> {
  try {
    const supabase = createAdminClient();
    const processedMatchIds = new Set<string>();
    
    let matchesPlayed = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let yellowCards = 0;
    let redCards = 0;

    console.log("[computeUserStatsFromMatches] Fetching stats for user:", userId);

    // 1. Get ALL participant records for this user (across all tournaments)
    const { data: participantData, error: pError } = await supabase
      .from("participants")
      .select("id, tournament_id, name")
      .eq("user_id", userId);
    
    console.log("[computeUserStatsFromMatches] Participants found:", participantData?.length || 0, pError ? `Error: ${pError.message}` : "");
    
    const participantIds = (participantData || []).map(p => p.id);

    // 2. Get team IDs where user is a member (via user_id directly)
    const { data: teamMemberDataDirect, error: tmError1 } = await supabase
      .from("team_members")
      .select("team_id, participant_id")
      .eq("user_id", userId);
    
    console.log("[computeUserStatsFromMatches] Team memberships (direct user_id):", teamMemberDataDirect?.length || 0, tmError1 ? `Error: ${tmError1.message}` : "");

    // 3. Get team IDs where user is a member (via participant_id)
    let teamMemberDataViaParticipant: { team_id: string; participant_id: string }[] = [];
    if (participantIds.length > 0) {
      const { data: tmData, error: tmError2 } = await supabase
        .from("team_members")
        .select("team_id, participant_id")
        .in("participant_id", participantIds);
      
      console.log("[computeUserStatsFromMatches] Team memberships (via participant):", tmData?.length || 0, tmError2 ? `Error: ${tmError2.message}` : "");
      teamMemberDataViaParticipant = tmData || [];
    }

    // Combine and dedupe team IDs
    const allTeamMemberships = [...(teamMemberDataDirect || []), ...teamMemberDataViaParticipant];
    const teamIdsSet = new Set<string>();
    allTeamMemberships.forEach(tm => {
      if (tm.team_id) teamIdsSet.add(tm.team_id);
    });
    const teamIds = Array.from(teamIdsSet);
    
    console.log("[computeUserStatsFromMatches] Total unique team IDs:", teamIds.length);

    // 4. Process INDIVIDUAL matches (1v1 - where user is directly a participant)
    if (participantIds.length > 0) {
      const { data: individualMatches, error: imError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_participant_id.in.(${participantIds.join(",")}),away_participant_id.in.(${participantIds.join(",")})`);

      console.log("[computeUserStatsFromMatches] Individual matches found:", individualMatches?.length || 0, imError ? `Error: ${imError.message}` : "");

      if (individualMatches) {
        for (const match of individualMatches) {
          // Skip if this is a team match (has team IDs set)
          if (match.home_team_id || match.away_team_id) continue;
          if (processedMatchIds.has(match.id)) continue;
          
          const isHome = participantIds.includes(match.home_participant_id);
          const isAway = participantIds.includes(match.away_participant_id);
          
          if (!isHome && !isAway) continue;
          
          processedMatchIds.add(match.id);
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          const myScore = isHome ? homeScore : awayScore;
          const oppScore = isHome ? awayScore : homeScore;
          goalsScored += myScore;
          goalsConceded += oppScore;
          
          if (homeScore === awayScore) {
            draws++;
          } else if (isHome) {
            if (homeScore > awayScore) wins++;
            else losses++;
          } else {
            if (awayScore > homeScore) wins++;
            else losses++;
          }
          
          // Accumulate cards for individual matches
          if (isHome) {
            yellowCards += match.home_yellow_cards ?? 0;
            redCards += match.home_red_cards ?? 0;
          } else {
            yellowCards += match.away_yellow_cards ?? 0;
            redCards += match.away_red_cards ?? 0;
          }
        }
      }
    }

    // 5. Process TEAM matches (2v2 - where user's team participated)
    if (teamIds.length > 0) {
      const { data: teamMatches, error: tmError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`);

      console.log("[computeUserStatsFromMatches] Team matches found:", teamMatches?.length || 0, tmError ? `Error: ${tmError.message}` : "");

      if (teamMatches) {
        for (const match of teamMatches) {
          if (processedMatchIds.has(match.id)) continue;
          
          const isHomeTeam = teamIds.includes(match.home_team_id);
          const isAwayTeam = teamIds.includes(match.away_team_id);
          
          if (!isHomeTeam && !isAwayTeam) continue;
          
          processedMatchIds.add(match.id);
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          const myScore = isHomeTeam ? homeScore : awayScore;
          const oppScore = isHomeTeam ? awayScore : homeScore;
          goalsScored += myScore;
          goalsConceded += oppScore;
          
          if (homeScore === awayScore) {
            draws++;
          } else if (isHomeTeam) {
            if (homeScore > awayScore) wins++;
            else losses++;
          } else {
            if (awayScore > homeScore) wins++;
            else losses++;
          }
          
          // Accumulate cards for team matches (cards are shared by team)
          if (isHomeTeam) {
            yellowCards += match.home_yellow_cards ?? 0;
            redCards += match.home_red_cards ?? 0;
          } else {
            yellowCards += match.away_yellow_cards ?? 0;
            redCards += match.away_red_cards ?? 0;
          }
        }
      }
    }

    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
    
    console.log("[computeUserStatsFromMatches] Final stats:", { matchesPlayed, wins, draws, losses, goalsScored, goalsConceded, winRate, yellowCards, redCards });
    
    return { matchesPlayed, wins, draws, losses, goalsScored, goalsConceded, winRate, yellowCards, redCards };
  } catch (err) {
    console.error("[computeUserStatsFromMatches] Exception:", err);
    return { matchesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, winRate: 0, yellowCards: 0, redCards: 0 };
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
      // Supabase returns the joined relation - handle both array and object formats
      const tournamentsData = participation.tournaments;
      const tournament = Array.isArray(tournamentsData) 
        ? tournamentsData[0] 
        : tournamentsData;
      
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

// ===== PUBLIC PLAYER PROFILE FUNCTIONS =====

export async function getPlayerProfileById(userId: string): Promise<{
  profile: UserProfile | null;
  stats: ComputedUserStats;
  placements: TournamentPlacementStats;
  tournaments: TournamentActivity[];
} | null> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return null;
    
    const stats = await computeUserStatsFromMatches(userId);
    const placements = await getUserTournamentPlacementStats(userId);
    const tournaments = await getUserTournamentActivities(userId);
    
    return { profile, stats, placements, tournaments };
  } catch (err) {
    console.error("[getPlayerProfileById] Exception:", err);
    return null;
  }
}

// ===== LEADERBOARD FUNCTIONS =====

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goalsScored: number;
  goalsConceded: number;
  tournamentsWon: number;
  podiumFinishes: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createAdminClient();
    
    // OPTIMIZED: Fetch all data in parallel with single bulk queries
    const [
      { data: profiles, error: profilesError },
      { data: allParticipants },
      { data: allTeamMembers },
      { data: allCompletedMatches },
      { data: allTournaments }
    ] = await Promise.all([
      supabase.from("user_profiles").select("id, first_name, last_name, avatar_url"),
      supabase.from("participants").select("id, user_id, tournament_id, team_id"),
      supabase.from("team_members").select("team_id, participant_id, user_id"),
      supabase.from("matches").select("id, tournament_id, round, home_participant_id, away_participant_id, home_team_id, away_team_id, home_score, away_score, status, winner_participant_id, winner_team_id, winner_user_id, home_yellow_cards, home_red_cards, away_yellow_cards, away_red_cards").eq("status", "completed"),
      supabase.from("tournaments").select("id, type, status, players_per_team")
    ]);
    
    if (profilesError || !profiles) {
      console.error("[getLeaderboard] Error fetching profiles:", profilesError);
      return [];
    }
    
    // Build lookup maps for efficient processing
    const participantsByUserId = new Map<string, Array<{ id: string; tournament_id: string }>>();
    for (const p of allParticipants || []) {
      if (p.user_id) {
        if (!participantsByUserId.has(p.user_id)) {
          participantsByUserId.set(p.user_id, []);
        }
        participantsByUserId.get(p.user_id)!.push({ id: p.id, tournament_id: p.tournament_id });
      }
    }
    
    // Build team membership maps
    const teamIdsByUserId = new Map<string, Set<string>>();
    const teamIdsByParticipantId = new Map<string, string>();
    for (const tm of allTeamMembers || []) {
      if (tm.user_id && tm.team_id) {
        if (!teamIdsByUserId.has(tm.user_id)) {
          teamIdsByUserId.set(tm.user_id, new Set());
        }
        teamIdsByUserId.get(tm.user_id)!.add(tm.team_id);
      }
      if (tm.participant_id && tm.team_id) {
        teamIdsByParticipantId.set(tm.participant_id, tm.team_id);
      }
    }
    
    // Also add teams via participant mappings
    for (const p of allParticipants || []) {
      if (p.user_id) {
        const teamId = teamIdsByParticipantId.get(p.id);
        if (teamId) {
          if (!teamIdsByUserId.has(p.user_id)) {
            teamIdsByUserId.set(p.user_id, new Set());
          }
          teamIdsByUserId.get(p.user_id)!.add(teamId);
        }
      }
    }
    
    // Build tournament info map
    const tournamentInfo = new Map<string, { type: string | null; status: string; playersPerTeam: number }>();
    for (const t of allTournaments || []) {
      tournamentInfo.set(t.id, { 
        type: t.type, 
        status: t.status,
        playersPerTeam: t.players_per_team ?? 1 
      });
    }
    
    // Group matches by tournament for standings calculation
    type MatchData = NonNullable<typeof allCompletedMatches>[number];
    const matchesByTournament = new Map<string, MatchData[]>();
    for (const match of allCompletedMatches || []) {
      if (!matchesByTournament.has(match.tournament_id)) {
        matchesByTournament.set(match.tournament_id, []);
      }
      matchesByTournament.get(match.tournament_id)!.push(match);
    }
    
    // Pre-calculate tournament standings for finished tournaments
    const tournamentStandings = new Map<string, Array<{ entityId: string; points: number; goalDiff: number; participantId: string | null; teamId: string | null }>>();
    const knockoutWinners = new Map<string, { first: string | null; second: string | null; thirdPlace: Set<string> }>();
    
    for (const [tournamentId, matches] of matchesByTournament) {
      const tInfo = tournamentInfo.get(tournamentId);
      if (!tInfo || tInfo.status !== "finished") continue;
      
      const isTeamBased = tInfo.playersPerTeam > 1;
      const isKnockout = tInfo.type === "knockout";
      
      if (isKnockout) {
        // For knockout: find final and semi-final results
        const maxRound = Math.max(...matches.map(m => m.round));
        const finalMatch = matches.find(m => m.round === maxRound);
        
        if (finalMatch) {
          // Winner and runner-up from final
          const winnerId = isTeamBased 
            ? (finalMatch.winner_team_id || finalMatch.winner_participant_id)
            : (finalMatch.winner_participant_id || finalMatch.winner_team_id);
          
          const homeId = isTeamBased ? finalMatch.home_team_id : finalMatch.home_participant_id;
          const awayId = isTeamBased ? finalMatch.away_team_id : finalMatch.away_participant_id;
          const loserId = winnerId === homeId ? awayId : homeId;
          
          // Third place from semi-finals
          const semiFinalRound = maxRound - 1;
          const semiFinals = matches.filter(m => m.round === semiFinalRound);
          const thirdPlaceIds = new Set<string>();
          
          for (const semi of semiFinals) {
            const semiWinnerId = isTeamBased 
              ? (semi.winner_team_id || semi.winner_participant_id)
              : (semi.winner_participant_id || semi.winner_team_id);
            const semiHomeId = isTeamBased ? semi.home_team_id : semi.home_participant_id;
            const semiAwayId = isTeamBased ? semi.away_team_id : semi.away_participant_id;
            const semiLoserId = semiWinnerId === semiHomeId ? semiAwayId : semiHomeId;
            if (semiLoserId) thirdPlaceIds.add(semiLoserId);
          }
          
          knockoutWinners.set(tournamentId, {
            first: winnerId || null,
            second: loserId || null,
            thirdPlace: thirdPlaceIds
          });
        }
      } else {
        // For league: calculate full standings
        const standings = new Map<string, { points: number; goalDiff: number; participantId: string | null; teamId: string | null }>();
        
        for (const match of matches) {
          const homeId = isTeamBased 
            ? (match.home_team_id || match.home_participant_id)
            : (match.home_participant_id || match.home_team_id);
          const awayId = isTeamBased
            ? (match.away_team_id || match.away_participant_id)
            : (match.away_participant_id || match.away_team_id);
          
          if (!homeId || !awayId) continue;
          
          if (!standings.has(homeId)) {
            standings.set(homeId, { points: 0, goalDiff: 0, participantId: match.home_participant_id, teamId: match.home_team_id });
          }
          if (!standings.has(awayId)) {
            standings.set(awayId, { points: 0, goalDiff: 0, participantId: match.away_participant_id, teamId: match.away_team_id });
          }
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          standings.get(homeId)!.goalDiff += homeScore - awayScore;
          standings.get(awayId)!.goalDiff += awayScore - homeScore;
          
          if (homeScore > awayScore) {
            standings.get(homeId)!.points += 3;
          } else if (awayScore > homeScore) {
            standings.get(awayId)!.points += 3;
          } else {
            standings.get(homeId)!.points += 1;
            standings.get(awayId)!.points += 1;
          }
        }
        
        // Sort standings
        const sorted = Array.from(standings.entries())
          .map(([entityId, stats]) => ({ entityId, ...stats }))
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalDiff - a.goalDiff;
          });
        
        tournamentStandings.set(tournamentId, sorted);
      }
    }
    
    // Helper to find user's placement in a tournament
    const getUserPlacement = (userId: string, participantIds: string[], teamIds: string[], tournamentId: string): number => {
      const tInfo = tournamentInfo.get(tournamentId);
      if (!tInfo || tInfo.status !== "finished") return -1;
      
      const isKnockout = tInfo.type === "knockout";
      
      if (isKnockout) {
        const results = knockoutWinners.get(tournamentId);
        if (!results) return -1;
        
        // Check if user's entity won
        for (const pId of participantIds) {
          if (results.first === pId) return 1;
          if (results.second === pId) return 2;
          if (results.thirdPlace.has(pId)) return 3;
        }
        for (const tId of teamIds) {
          if (results.first === tId) return 1;
          if (results.second === tId) return 2;
          if (results.thirdPlace.has(tId)) return 3;
        }
      } else {
        const standings = tournamentStandings.get(tournamentId);
        if (!standings) return -1;
        
        // Find user's position
        for (let i = 0; i < standings.length && i < 3; i++) {
          const entry = standings[i];
          if (participantIds.includes(entry.entityId) || 
              (entry.participantId && participantIds.includes(entry.participantId)) ||
              teamIds.includes(entry.entityId) ||
              (entry.teamId && teamIds.includes(entry.teamId))) {
            return i + 1; // 1st, 2nd, or 3rd
          }
        }
      }
      
      return -1; // Not in top 3
    };
    
    // Process stats for each user in memory
    const entries: LeaderboardEntry[] = [];
    
    for (const profile of profiles) {
      const userId = profile.id;
      const userParticipations = participantsByUserId.get(userId) || [];
      const participantIds = userParticipations.map(p => p.id);
      const teamIds = Array.from(teamIdsByUserId.get(userId) || []);
      
      // Skip users with no participation
      if (participantIds.length === 0 && teamIds.length === 0) continue;
      
      let matchesPlayed = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsScored = 0;
      let goalsConceded = 0;
      const processedMatchIds = new Set<string>();
      
      // Process matches in memory
      for (const match of allCompletedMatches || []) {
        // Skip if already processed
        if (processedMatchIds.has(match.id)) continue;
        
        // Check if this is a team match
        const isTeamMatch = match.home_team_id || match.away_team_id;
        
        if (isTeamMatch) {
          // Team match - check if user's team participated
          const isHomeTeam = teamIds.includes(match.home_team_id);
          const isAwayTeam = teamIds.includes(match.away_team_id);
          if (!isHomeTeam && !isAwayTeam) continue;
          
          processedMatchIds.add(match.id);
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          if (isHomeTeam) {
            goalsScored += homeScore;
            goalsConceded += awayScore;
            if (homeScore > awayScore) wins++;
            else if (homeScore < awayScore) losses++;
            else draws++;
          } else {
            goalsScored += awayScore;
            goalsConceded += homeScore;
            if (awayScore > homeScore) wins++;
            else if (awayScore < homeScore) losses++;
            else draws++;
          }
        } else {
          // Individual match - check participant IDs
          const isHome = participantIds.includes(match.home_participant_id);
          const isAway = participantIds.includes(match.away_participant_id);
          if (!isHome && !isAway) continue;
          
          processedMatchIds.add(match.id);
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          if (isHome) {
            goalsScored += homeScore;
            goalsConceded += awayScore;
            if (homeScore > awayScore) wins++;
            else if (homeScore < awayScore) losses++;
            else draws++;
          } else {
            goalsScored += awayScore;
            goalsConceded += homeScore;
            if (awayScore > homeScore) wins++;
            else if (awayScore < homeScore) losses++;
            else draws++;
          }
        }
      }
      
      // Skip users with no matches played
      if (matchesPlayed === 0) continue;
      
      const winRate = Math.round((wins / matchesPlayed) * 100);
      
      // Calculate tournament achievements using pre-computed standings
      let tournamentsWon = 0;
      let podiumFinishes = 0;
      
      // Get unique tournament IDs for this user
      const userTournamentIds = new Set<string>();
      for (const p of userParticipations) {
        userTournamentIds.add(p.tournament_id);
      }
      // Also add tournaments from team memberships
      for (const tId of teamIds) {
        // Find tournament for this team from participants
        for (const p of allParticipants || []) {
          if (p.team_id === tId) {
            userTournamentIds.add(p.tournament_id);
          }
        }
      }
      
      // Check placement in each finished tournament
      for (const tournamentId of userTournamentIds) {
        const placement = getUserPlacement(userId, participantIds, teamIds, tournamentId);
        if (placement === 1) {
          tournamentsWon++;
          podiumFinishes++;
        } else if (placement === 2 || placement === 3) {
          podiumFinishes++;
        }
      }
      
      entries.push({
        rank: 0,
        userId: profile.id,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "لاعب",
        avatarUrl: profile.avatar_url || null,
        matchesPlayed,
        wins,
        losses,
        draws,
        winRate,
        goalsScored,
        goalsConceded,
        tournamentsWon,
        podiumFinishes,
      });
    }
    
    // Sort by wins (primary), then win rate (secondary), then matches played (tertiary)
    entries.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.matchesPlayed - a.matchesPlayed;
    });
    
    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries;
  } catch (err) {
    console.error("[getLeaderboard] Exception:", err);
    return [];
  }
}