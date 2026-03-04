import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, BarChart3, GitBranch } from "lucide-react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { getTournamentById, getTournamentBySlug, getMatches, getParticipants, getTeams, getTeamMembersByTournament } from "@/lib/data";
import { groupMatchesByRound } from "@/lib/tournament-utils";
import { isUuid, encodeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SchedulePage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}/schedule`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
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
        <PageHeader
          title="جدول المباريات"
          icon={<CalendarDays className="h-6 w-6 text-primary" />}
          backHref={`/t/${encodeSlug(tournament.slug)}`}
          backText={tournament.name}
          badge={<StatusBadge status={tournament.status} />}
        />

      <Card>
        {matches.length === 0 ? (
          <p className="text-sm text-muted">لم يتم إنشاء مباريات بعد.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupMatchesByRound(matches))
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, roundMatches]) => (
                <div key={round}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                      الجولة {round}
                    </h2>
                    <span className="text-xs text-muted">
                      {roundMatches.length} مباراة
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {roundMatches.map((match) => {
                      // Get display names
                      const homeName = isTeamBased
                        ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                        : nameMap.get(match.home_participant_id ?? "") ?? "-";
                      const awayName = isTeamBased
                        ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                        : nameMap.get(match.away_participant_id ?? "") ?? "-";
                      const homeMembers = isTeamBased && match.home_team_id
                        ? teamMembersMap.get(match.home_team_id) || []
                        : [];
                      const awayMembers = isTeamBased && match.away_team_id
                        ? teamMembersMap.get(match.away_team_id) || []
                        : [];

                      return (
                        <div
                          key={match.id}
                          className="card p-0 overflow-hidden shadow-lg border-2 border-border/40 bg-white/90 backdrop-blur-md hover:border-primary/60 transition-all duration-300 animate-fade-in"
                        >
                          <div className="relative flex items-stretch">
                            {/* Enhanced Home Team */}
                            <div className="flex-1 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-right flex flex-col justify-center group-hover:from-primary/15 transition-all duration-300">
                              <div className="flex items-center justify-end gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-md animate-float">
                                  <span className="text-sm font-black text-primary drop-shadow-sm">{homeName.charAt(0)}</span>
                                </div>
                              </div>
                              <h3 className="font-black text-xl text-foreground truncate group-hover:text-primary transition-colors duration-300">{homeName}</h3>
                              {isTeamBased && homeMembers.length > 0 && (
                                <p className="text-sm text-secondary mt-2 leading-relaxed font-medium">{homeMembers.join(' • ')}</p>
                              )}
                            </div>
                            
                            {/* Enhanced Scoreboard */}
                            <div className="min-w-[160px] bg-surface/90 backdrop-blur-md border-x-2 border-border/60 flex flex-col justify-center items-center p-6 relative">
                              {/* Subtle glow effect for completed matches */}
                              {match.home_score !== null && match.away_score !== null && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse"></div>
                              )}
                              <div className="relative z-10">
                                {match.home_score !== null && match.away_score !== null ? (
                                  <div className="text-5xl font-black text-primary font-mono tracking-wider mb-2 drop-shadow-lg animate-bounce-in">
                                    {match.home_score} : {match.away_score}
                                  </div>
                                ) : (
                                  <div className="text-2xl font-black text-muted mb-2 animate-pulse">VS</div>
                                )}
                                <StatusBadge status={match.status} size="sm" />
                              </div>
                            </div>
                            
                            {/* Away Team */}
                            <div className="flex-1 p-4 bg-gradient-to-l from-accent/5 to-transparent text-left flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-8 w-8 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                                  <span className="text-xs font-bold text-accent">{awayName.charAt(0)}</span>
                                </div>
                              </div>
                              <h3 className="font-black text-lg text-foreground truncate">{awayName}</h3>
                              {isTeamBased && awayMembers.length > 0 && (
                                <p className="text-xs text-muted mt-1 leading-tight">{awayMembers.join(' • ')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/t/${encodeSlug(tournament.slug)}/participants`}
          className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
        >
          <Users className="h-4 w-4 text-primary" />
          المشاركون
        </Link>
        {tournament.type === "league" && (
          <Link
            href={`/t/${encodeSlug(tournament.slug)}/standings`}
            className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            الترتيب
          </Link>
        )}
        {tournament.type === "knockout" && (
          <Link
            href={`/t/${encodeSlug(tournament.slug)}/bracket`}
            className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
          >
            <GitBranch className="h-4 w-4 text-primary" />
            الشجرة
          </Link>
        )}
      </div>
      </Container>
    </div>
  );
}
