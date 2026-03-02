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