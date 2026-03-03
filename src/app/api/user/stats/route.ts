import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface TournamentStats {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  position?: number;
}

export async function GET() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    
    // Initialize overall stats
    let matchesPlayed = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    const tournamentStats: TournamentStats[] = [];
    const processedMatchIds = new Set<string>();

    console.log("[Stats API] Fetching stats for user:", user.id);

    // 1. Get ALL participant records for this user (across all tournaments)
    const { data: participantData, error: pError } = await adminClient
      .from("participants")
      .select("id, tournament_id, name")
      .eq("user_id", user.id);
    
    console.log("[Stats API] Participants found:", participantData?.length || 0, pError ? `Error: ${pError.message}` : "");
    
    const participantIds = (participantData || []).map(p => p.id);
    const participantTournamentMap = new Map<string, string>();
    (participantData || []).forEach(p => participantTournamentMap.set(p.id, p.tournament_id));

    // 2. Get team IDs where user is a member (via user_id directly)
    const { data: teamMemberDataDirect, error: tmError1 } = await adminClient
      .from("team_members")
      .select("team_id, participant_id")
      .eq("user_id", user.id);
    
    console.log("[Stats API] Team memberships (direct user_id):", teamMemberDataDirect?.length || 0, tmError1 ? `Error: ${tmError1.message}` : "");

    // 3. Get team IDs where user is a member (via participant_id)
    let teamMemberDataViaParticipant: { team_id: string; participant_id: string }[] = [];
    if (participantIds.length > 0) {
      const { data: tmData, error: tmError2 } = await adminClient
        .from("team_members")
        .select("team_id, participant_id")
        .in("participant_id", participantIds);
      
      console.log("[Stats API] Team memberships (via participant):", tmData?.length || 0, tmError2 ? `Error: ${tmError2.message}` : "");
      teamMemberDataViaParticipant = tmData || [];
    }

    // Combine and dedupe team IDs
    const allTeamMemberships = [...(teamMemberDataDirect || []), ...teamMemberDataViaParticipant];
    const teamIdsSet = new Set<string>();
    allTeamMemberships.forEach(tm => {
      if (tm.team_id) teamIdsSet.add(tm.team_id);
    });
    const teamIds = Array.from(teamIdsSet);
    
    console.log("[Stats API] Total unique team IDs:", teamIds.length);

    // 4. Get team info to map teams to tournaments
    const teamTournamentMap = new Map<string, string>();
    if (teamIds.length > 0) {
      const { data: teamsData } = await adminClient
        .from("teams")
        .select("id, tournament_id")
        .in("id", teamIds);
      
      (teamsData || []).forEach(t => teamTournamentMap.set(t.id, t.tournament_id));
    }

    // 5. Get all tournaments the user participated in
    const tournamentIdsSet = new Set<string>();
    (participantData || []).forEach(p => tournamentIdsSet.add(p.tournament_id));
    teamTournamentMap.forEach(tid => tournamentIdsSet.add(tid));
    const tournamentIds = Array.from(tournamentIdsSet);

    console.log("[Stats API] Tournament IDs:", tournamentIds);

    // 6. Fetch tournament details
    const tournamentMap = new Map<string, { name: string; status: string }>();
    if (tournamentIds.length > 0) {
      const { data: tournaments } = await adminClient
        .from("tournaments")
        .select("id, name, status")
        .in("id", tournamentIds);
      
      (tournaments || []).forEach(t => tournamentMap.set(t.id, { name: t.name, status: t.status }));
    }

    // Initialize per-tournament stats
    tournamentIds.forEach(tid => {
      const tInfo = tournamentMap.get(tid);
      tournamentStats.push({
        tournamentId: tid,
        tournamentName: tInfo?.name || "بطولة غير معروفة",
        tournamentStatus: tInfo?.status || "unknown",
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
      });
    });

    const getTournamentStat = (tid: string) => tournamentStats.find(ts => ts.tournamentId === tid);

    // 7. Process INDIVIDUAL matches (1v1 - where user is directly a participant)
    if (participantIds.length > 0) {
      const { data: individualMatches, error: imError } = await adminClient
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_participant_id.in.(${participantIds.join(",")}),away_participant_id.in.(${participantIds.join(",")})`);

      console.log("[Stats API] Individual matches found:", individualMatches?.length || 0, imError ? `Error: ${imError.message}` : "");

      if (individualMatches) {
        for (const match of individualMatches) {
          // Only process if NOT a team match (no team IDs set)
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
          
          // Update tournament stats
          const tStat = getTournamentStat(match.tournament_id);
          if (tStat) {
            tStat.matchesPlayed++;
            tStat.goalsScored += myScore;
            tStat.goalsConceded += oppScore;
          }
          
          if (homeScore === awayScore) {
            draws++;
            if (tStat) tStat.draws++;
          } else if (isHome) {
            if (homeScore > awayScore) {
              wins++;
              if (tStat) tStat.wins++;
            } else {
              losses++;
              if (tStat) tStat.losses++;
            }
          } else {
            if (awayScore > homeScore) {
              wins++;
              if (tStat) tStat.wins++;
            } else {
              losses++;
              if (tStat) tStat.losses++;
            }
          }
        }
      }
    }

    // 8. Process TEAM matches (2v2 - where user's team participated)
    if (teamIds.length > 0) {
      const { data: teamMatches, error: tmError } = await adminClient
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`);

      console.log("[Stats API] Team matches found:", teamMatches?.length || 0, tmError ? `Error: ${tmError.message}` : "");

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
          
          // Update tournament stats
          const tStat = getTournamentStat(match.tournament_id);
          if (tStat) {
            tStat.matchesPlayed++;
            tStat.goalsScored += myScore;
            tStat.goalsConceded += oppScore;
          }
          
          if (homeScore === awayScore) {
            draws++;
            if (tStat) tStat.draws++;
          } else if (isHomeTeam) {
            if (homeScore > awayScore) {
              wins++;
              if (tStat) tStat.wins++;
            } else {
              losses++;
              if (tStat) tStat.losses++;
            }
          } else {
            if (awayScore > homeScore) {
              wins++;
              if (tStat) tStat.wins++;
            } else {
              losses++;
              if (tStat) tStat.losses++;
            }
          }
        }
      }
    }

    // Calculate win rate
    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

    console.log("[Stats API] Final stats:", { matchesPlayed, wins, draws, losses, goalsScored, goalsConceded, winRate });

    return NextResponse.json({
      matchesPlayed,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      winRate,
      tournamentsParticipated: tournamentStats.length,
      tournaments: tournamentStats.filter(t => t.matchesPlayed > 0 || t.tournamentStatus !== "unknown"),
    });
  } catch (error) {
    console.error("[API /user/stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
