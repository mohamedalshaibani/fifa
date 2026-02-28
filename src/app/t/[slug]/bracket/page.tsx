import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import { getTournamentById, getTournamentBySlug, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { Match } from "@/lib/types";
import { isUuid, encodeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function groupByRound(matches: Match[]) {
  return matches.reduce(
    (acc, match) => {
      const round = match.round.toString();
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BracketPage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/bracket`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  if (tournament.type !== "knockout") {
    redirect(`/t/${encodeSlug(tournament.slug)}`);
  }

  const participants = await getParticipants(tournament.id);
  const matches = await getMatches(tournament.id);
  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);
  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));
  // Map team_id -> list of participant names
  const teamMembersMap = new Map<string, string[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    members.push(participantName);
    teamMembersMap.set(tm.team_id, members);
  }

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;

  return (
    <div className="min-h-screen bg-background">
      <Container>
        {/* Broadcast TV Header */}
        <header className="mb-8">
        <div className="scoreboard mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="live-indicator">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                BRACKET
              </div>
              <h1 className="text-2xl font-black text-foreground">
                {tournament.name} - شجرة المنافسة
              </h1>
            </div>
            <StatusBadge status={tournament.status} />
          </div>
        </div>
        
        <Link
          href={`/t/${encodeSlug(tournament.slug)}`}
          className="text-primary hover:text-primary-dark transition-colors font-bold text-sm"
        >
          ← العودة للبطولة
        </Link>
      </header>

      {/* Broadcast TV Bracket */}
      <div className="space-y-8">
        {matches.length === 0 ? (
          <div className="scoreboard">
            <p className="text-muted p-8 text-center text-lg">لم تتم القرعة بعد.</p>
          </div>
        ) : (
          <>
            {Object.entries(groupByRound(matches))
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, roundMatches]) => (
                <div key={round}>
                  {/* Round Header - TV Style */}
                  <div className="bg-primary/10 text-foreground px-6 py-3 rounded-2xl mb-4 border border-primary/20">
                    <h2 className="text-lg font-black tracking-wide">
                      {roundMatches.length === 1 ? "🏆 FINAL MATCH" : `ROUND ${round}`}
                    </h2>
                  </div>
                  <div className="grid gap-4">
                    {roundMatches.map((match) => {
                      // Get display names and members based on format
                      const homeName = isTeamBased
                        ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                        : nameMap.get(match.home_participant_id ?? "") ?? "-";
                      const awayName = isTeamBased
                        ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                        : nameMap.get(match.away_participant_id ?? "") ?? "-";
                      const winnerName = isTeamBased
                        ? teamNameMap.get(match.winner_team_id ?? "") ?? "-"
                        : nameMap.get(match.winner_participant_id ?? "") ?? "-";
                      const homeMembers = isTeamBased && match.home_team_id
                        ? teamMembersMap.get(match.home_team_id) || []
                        : [];
                      const awayMembers = isTeamBased && match.away_team_id
                        ? teamMembersMap.get(match.away_team_id) || []
                        : [];
                      const isHomeWinner = isTeamBased
                        ? match.winner_team_id === match.home_team_id
                        : match.winner_participant_id === match.home_participant_id;
                      const isAwayWinner = isTeamBased
                        ? match.winner_team_id === match.away_team_id
                        : match.winner_participant_id === match.away_participant_id;
                      const hasWinner = isTeamBased ? match.winner_team_id : match.winner_participant_id;

                      return (
                        <div
                          key={match.id}
                          className="scoreboard hover:bg-white/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
                        >
                          {/* Match Status Strip */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                            <div className="text-primary font-black text-sm">
                              {roundMatches.length === 1 ? "🏆 FINAL" : `ROUND ${round}`}
                            </div>
                            {match.status === 'completed' && hasWinner && (
                              <div className="text-accent text-xs font-bold">COMPLETED</div>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                              {/* Home Team - TV Scoreboard */}
                              <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                isHomeWinner ? "bg-primary/5 border-2 border-primary/40 shadow-lg" : "bg-white/60 border border-slate-200"
                              }`}>
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                                    isHomeWinner ? "bg-primary/10 border-primary/40" : "bg-white/60 border-slate-200"
                                  }`}>
                                    <span className={`text-sm font-black ${
                                      isHomeWinner ? "text-primary" : "text-foreground"
                                    }`}>{homeName.charAt(0)}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-black text-lg ${
                                      isHomeWinner ? "text-primary" : "text-foreground"
                                    }`}>
                                      {homeName}
                                    </div>
                                    {isTeamBased && homeMembers.length > 0 && (
                                      <p className="text-xs text-muted mt-0.5">{homeMembers.join(' • ')}</p>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-3xl font-black px-4 py-2 rounded-lg min-w-[60px] text-center ${
                                  isHomeWinner ? "bg-primary/15 text-foreground" : "text-foreground"
                                }`}>
                                  {match.home_score !== null ? match.home_score : "—"}
                                </div>
                              </div>
                              
                              {/* Away Team - TV Scoreboard */}
                              <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                isAwayWinner ? "bg-primary/5 border-2 border-primary/40 shadow-lg" : "bg-white/60 border border-slate-200"
                              }`}>
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                                    isAwayWinner ? "bg-primary/10 border-primary/40" : "bg-white/60 border-slate-200"
                                  }`}>
                                    <span className={`text-sm font-black ${
                                      isAwayWinner ? "text-primary" : "text-foreground"
                                    }`}>{awayName.charAt(0)}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className={`font-black text-lg ${
                                      isAwayWinner ? "text-primary" : "text-foreground"
                                    }`}>
                                      {awayName}
                                    </div>
                                    {isTeamBased && awayMembers.length > 0 && (
                                      <p className="text-xs text-muted mt-0.5">{awayMembers.join(' • ')}</p>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-3xl font-black px-4 py-2 rounded-lg min-w-[60px] text-center ${
                                  isAwayWinner ? "bg-primary/15 text-foreground" : "text-foreground"
                                }`}>
                                  {match.away_score !== null ? match.away_score : "—"}
                                </div>
                              </div>
                              
                              {/* Winner Banner - TV Style */}
                              {hasWinner && (
                                <div className="text-center pt-3 mt-3 border-t border-primary/30 bg-primary/5">
                                  <span className="text-sm text-primary font-black flex items-center justify-center gap-2">
                                    🏆 WINNER: {winnerName}
                                  </span>
                                </div>
                              )}
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/t/${encodeSlug(tournament.slug)}/participants`}
          className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
        >
          <Users className="h-4 w-4 text-primary" />
          المشاركون
        </Link>
        <Link
          href={`/t/${encodeSlug(tournament.slug)}/schedule`}
          className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4 text-primary" />
          الجدول
        </Link>
      </div>
      </Container>
    </div>
  );
}
