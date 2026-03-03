import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    
    // Initialize stats
    let matchesPlayed = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;

    // 1. Get participant IDs for this user (across all tournaments)
    const { data: participantData } = await adminClient
      .from("participants")
      .select("id, tournament_id")
      .eq("user_id", user.id);
    
    const participantIds = (participantData || []).map(p => p.id);

    // 2. Get team IDs where user is a member
    const { data: teamMemberData } = await adminClient
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id);
    
    const teamIds = (teamMemberData || []).map(tm => tm.team_id);

    // 3. Get all completed matches where user participated as individual
    if (participantIds.length > 0) {
      const { data: individualMatches } = await adminClient
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_participant_id.in.(${participantIds.join(",")}),away_participant_id.in.(${participantIds.join(",")})`);

      if (individualMatches) {
        for (const match of individualMatches) {
          // Skip if this is a team-based match
          if (match.home_team_id || match.away_team_id) continue;
          
          const isHome = participantIds.includes(match.home_participant_id);
          const isAway = participantIds.includes(match.away_participant_id);
          
          if (!isHome && !isAway) continue;
          
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          if (homeScore === awayScore) {
            draws++;
          } else if (isHome) {
            if (homeScore > awayScore) wins++;
            else losses++;
          } else if (isAway) {
            if (awayScore > homeScore) wins++;
            else losses++;
          }
        }
      }
    }

    // 4. Get all completed matches where user's team participated
    if (teamIds.length > 0) {
      const { data: teamMatches } = await adminClient
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`);

      if (teamMatches) {
        for (const match of teamMatches) {
          const isHomeTeam = teamIds.includes(match.home_team_id);
          const isAwayTeam = teamIds.includes(match.away_team_id);
          
          if (!isHomeTeam && !isAwayTeam) continue;
          
          matchesPlayed++;
          
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;
          
          if (homeScore === awayScore) {
            draws++;
          } else if (isHomeTeam) {
            if (homeScore > awayScore) wins++;
            else losses++;
          } else if (isAwayTeam) {
            if (awayScore > homeScore) wins++;
            else losses++;
          }
        }
      }
    }

    return NextResponse.json({
      matchesPlayed,
      wins,
      draws,
      losses,
    });
  } catch (error) {
    console.error("[API /user/stats] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
