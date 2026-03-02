import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, CalendarDays, BarChart3, GitBranch, Target, LogIn, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import TournamentCountdown from "@/components/TournamentCountdown";
import SetupBanner from "@/components/SetupBanner";
import { TeamCard } from "@/components/TeamCard";
import {
  getTournamentById,
  getTournamentBySlug,
  getParticipants,
  getMatches,
  getTeams,
  getTeamMembersByTournament,
  getUserProfiles,
} from "@/lib/data";
import type { TeamMemberInfo } from "@/components/TeamCard";
import { computeStandings, computeTeamStandings } from "@/lib/tournament-utils";
import { isUuid, encodeSlug } from "@/lib/slug";
import { Match } from "@/lib/types";
import { registerAuthenticatedUser } from "@/app/public/actions";
import { checkTournamentSetupStatus, getEmptyStateText, formatValue, formatNumber } from "@/lib/empty-state";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

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
  searchParams?: Promise<{ registered?: string; error?: string }>;
};

export default async function TournamentHomePage(props: Props) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const errorFlag = searchParams?.error ?? null;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament && isUuid(slug)) {
    const byId = await getTournamentById(slug);
    if (byId) {
      redirect(`/t/${encodeSlug(byId.slug)}`);
    }
  }

  if (!tournament) {
    redirect("/tournaments");
  }

  // Check if current user is admin
  const adminResult = await requireAdmin();
  const isAdmin = adminResult.isAdmin;

  // Get current logged in user (for registration)
  const currentUser = await getCurrentUser();
  
  // Check tournament setup status
  const setupStatus = checkTournamentSetupStatus(tournament);

  const participants = await getParticipants(tournament.id);
  const matches = await getMatches(tournament.id);

  const teams = await getTeams(tournament.id);
  const teamMembers = await getTeamMembersByTournament(tournament.id);

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;
  const canRegister = tournament.status === "registration_open";
  
  // Check if user is already registered
  const isAlreadyRegistered = currentUser 
    ? participants.some(p => p.user_id === currentUser.id)
    : false;

  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));
  
  // Fetch user profiles for team members to get avatars
  const teamMemberUserIds = teamMembers
    .map(tm => tm.user_id)
    .filter((id): id is string => !!id);
  const userProfilesMap = await getUserProfiles(teamMemberUserIds);
  
  // Build team members map with avatar data
  const teamMembersMap = new Map<string, TeamMemberInfo[]>();
  for (const tm of teamMembers) {
    const members = teamMembersMap.get(tm.team_id) || [];
    const participantName = tm.participant_id ? (nameMap.get(tm.participant_id) || "—") : "—";
    const userProfile = tm.user_id ? userProfilesMap.get(tm.user_id) : null;
    const profileName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : null;
    members.push({
      name: profileName || participantName,
      avatarUrl: userProfile?.avatar_url || null,
    });
    teamMembersMap.set(tm.team_id, members);
  }

  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const goalsTotal = matches.reduce((sum, match) => {
    const home = typeof match.home_score === "number" ? match.home_score : 0;
    const away = typeof match.away_score === "number" ? match.away_score : 0;
    return sum + home + away;
  }, 0);

  const entityCount = isTeamBased ? teams.length : participants.length;
  const createdDate = new Date(tournament.created_at).toLocaleDateString("ar-SA");

  if (tournament.status === "finished") {
    let championName: string | null = null;
    let championMembers: string[] = [];
    let runnerUpName: string | null = null;
    let runnerUpMembers: string[] = [];

    if (tournament.type === "league") {
      if (isTeamBased) {
        const standings = computeTeamStandings(teams, matches);
        const championTeam = standings[0]?.team;
        const runnerUpTeam = standings[1]?.team;
        championName = championTeam?.name ?? null;
        championMembers = championTeam
          ? (teamMembersMap.get(championTeam.id) || []).map(m => m.name)
          : [];
        runnerUpName = runnerUpTeam?.name ?? null;
        runnerUpMembers = runnerUpTeam
          ? (teamMembersMap.get(runnerUpTeam.id) || []).map(m => m.name)
          : [];
      } else {
        const standings = computeStandings(participants, matches);
        championName = standings[0]?.participant.name ?? null;
        runnerUpName = standings[1]?.participant.name ?? null;
      }
    } else if (tournament.type === "knockout") {
      const finalMatch = matches.reduce((latest, match) => {
        if (!latest) return match;
        if (match.round > latest.round) return match;
        return latest;
      }, matches[0]);

      if (isTeamBased) {
        const winnerId = finalMatch?.winner_team_id ?? null;
        const loserId =
          finalMatch?.home_team_id === winnerId
            ? finalMatch?.away_team_id
            : finalMatch?.home_team_id;
        championName = winnerId ? teamNameMap.get(winnerId) ?? null : null;
        championMembers = winnerId ? (teamMembersMap.get(winnerId) || []).map(m => m.name) : [];
        runnerUpName = loserId ? teamNameMap.get(loserId) ?? null : null;
        runnerUpMembers = loserId ? (teamMembersMap.get(loserId) || []).map(m => m.name) : [];
      } else {
        const winnerId = finalMatch?.winner_participant_id ?? null;
        const loserId =
          finalMatch?.home_participant_id === winnerId
            ? finalMatch?.away_participant_id
            : finalMatch?.home_participant_id;
        championName = participants.find((p) => p.id === winnerId)?.name ?? null;
        runnerUpName = participants.find((p) => p.id === loserId)?.name ?? null;
      }
    }

    const participantStandings =
      tournament.type === "league" && !isTeamBased
        ? computeStandings(participants, matches)
        : [];
    const teamStandings =
      tournament.type === "league" && isTeamBased
        ? computeTeamStandings(teams, matches)
        : [];

    return (
      <div className="min-h-screen bg-background">
        <Container>
          <div className="h-1 w-full bg-primary shadow-[0_0_18px_rgba(0,230,118,0.35)] rounded-full mb-6" />
        <div className="mb-8">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للبطولات
          </Link>

          <Card className="p-8 md:p-10 bg-surface border-border relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <Trophy className="absolute -top-10 -left-10 w-64 h-64 text-gold" />
            </div>

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status="finished" />
                    {tournament.start_date && (
                      <TournamentCountdown
                        startDate={tournament.start_date}
                        matchesCount={matches.length}
                        completedMatches={completedMatches}
                        tournamentStatus={tournament.status}
                      />
                    )}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border text-secondary">
                      {isTeamBased ? "فرق" : "فردي"}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-foreground">
                    {tournament.name}
                  </h1>
                  <p className="mt-2 text-secondary text-lg max-w-2xl">
                    {tournament.type === "league" && "بطولة دوري مكتملة"}
                    {tournament.type === "knockout" && "بطولة خروج المغلوب مكتملة"}
                    {!tournament.type && "بطولة منتهية"}
                    <span className="mx-2 text-muted">•</span>
                    {createdDate}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-gold/30 bg-gold/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-24 h-24 text-gold" />
                  </div>
                  <div className="relative z-10 text-center py-6">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-gold/20">
                      🏆
                    </div>
                    <p className="text-xs uppercase tracking-widest text-gold font-bold">
                      بطل البطولة
                    </p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-black text-foreground">
                      {championName ?? getEmptyStateText('champion')}
                    </h2>
                    {isTeamBased && championMembers.length > 0 && (
                      <p className="mt-2 text-sm text-secondary font-medium">
                        {championMembers.join(" • ")}
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="bg-surface-2">
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm border border-border">
                      🥈
                    </div>
                    <p className="text-xs uppercase tracking-widest text-muted font-bold">
                      الوصيف
                    </p>
                    <h2 className="mt-2 text-2xl md:text-3xl font-black text-muted-foreground">
                      {runnerUpName ?? getEmptyStateText('champion')}
                    </h2>
                    {isTeamBased && runnerUpMembers.length > 0 && (
                      <p className="mt-2 text-sm text-muted">
                        {runnerUpMembers.join(" • ")}
                      </p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsTile 
                  label="المباريات" 
                  value={`${completedMatches}/${matches.length}`}
                  icon={<Target className="w-5 h-5 text-primary" />} 
                />
                <StatsTile 
                  label="الأهداف" 
                  value={goalsTotal} 
                  icon={<Trophy className="w-5 h-5 text-warning" />} 
                />
                <StatsTile 
                  label={isTeamBased ? "الفرق" : "المشاركون"} 
                  value={entityCount} 
                  icon={<Users className="w-5 h-5 text-info" />} 
                />
                <StatsTile 
                  label="النظام" 
                  value={tournament.type === "league" ? "دوري" : "خروج"}
                  icon={<GitBranch className="w-5 h-5 text-secondary" />} 
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                <a href="#participants" className="btn btn-secondary text-sm">
                  {isTeamBased ? "الفرق" : "المشاركون"}
                </a>
                <a href="#results" className="btn btn-secondary text-sm">
                  النتائج
                </a>
                <a href="#final" className="btn btn-secondary text-sm">
                  {tournament.type === "league" ? "الترتيب النهائي" : "ملخص الشجرة"}
                </a>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <section id="participants" className="scroll-mt-8">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {isTeamBased ? "الفرق" : "المشاركون"}
                </h2>
                <span className="button-secondary px-4 py-2 text-xs font-semibold">
                  {entityCount} {isTeamBased ? "فريق" : "مشارك"}
                </span>
              </div>

              {!isTeamBased ? (
                participants.length === 0 ? (
                  <p className="text-sm text-muted">لا يوجد مشاركون.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {participants.map((participant, index) => (
                      <li
                        key={participant.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-foreground">{participant.name}</span>
                      </li>
                    ))}
                  </ul>
                )
              ) : teams.length === 0 ? (
                <p className="text-sm text-muted">لا توجد فرق.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      teamId={team.id}
                      tournamentId={tournament.id}
                      teamName={team.name || "Unnamed Team"}
                      members={teamMembersMap.get(team.id) || []}
                    />
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section id="results">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground">النتائج / الجدول</h2>
                <span className="text-xs text-muted">{matches.length} مباراة</span>
              </div>

              {matches.length === 0 ? (
                <p className="text-sm text-muted">لم يتم إنشاء مباريات.</p>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupByRound(matches))
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([round, roundMatches]) => (
                      <div key={round}>
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                            الجولة {round}
                          </h3>
                          <span className="text-xs text-muted">{roundMatches.length} مباراة</span>
                        </div>
                        <div className="grid gap-3">
                          {roundMatches.map((match) => {
                            const homeName = isTeamBased
                              ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                              : nameMap.get(match.home_participant_id ?? "") ?? "-";
                            const awayName = isTeamBased
                              ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                              : nameMap.get(match.away_participant_id ?? "") ?? "-";
                            const homeMembers =
                              isTeamBased && match.home_team_id
                                ? teamMembersMap.get(match.home_team_id) || []
                                : [];
                            const awayMembers =
                              isTeamBased && match.away_team_id
                                ? teamMembersMap.get(match.away_team_id) || []
                                : [];

                            return (
                              <div
                                key={match.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm"
                              >
                                <div className="flex-1 text-right">
                                  <p className="font-semibold text-foreground">{homeName}</p>
                                  {isTeamBased && homeMembers.length > 0 && (
                                    <p className="text-xs text-muted mt-1">{homeMembers.join(" • ")}</p>
                                  )}
                                </div>
                                <div className="min-w-[120px] text-center">
                                  {match.home_score !== null && match.away_score !== null ? (
                                    <div className="text-2xl font-black text-primary">
                                      {match.home_score} : {match.away_score}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted">—</div>
                                  )}
                                  <span className="text-xs text-muted mt-1 block">
                                    {match.status === "completed" ? "✓ انتهت" : "⏱ قيد الانتظار"}
                                  </span>
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-foreground">{awayName}</p>
                                  {isTeamBased && awayMembers.length > 0 && (
                                    <p className="text-xs text-muted mt-1">{awayMembers.join(" • ")}</p>
                                  )}
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
          </section>

          <section id="final">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {tournament.type === "league" ? "الترتيب النهائي" : "ملخص الشجرة"}
                </h2>
              </div>

              {tournament.type === "league" ? (
                (isTeamBased ? teamStandings.length : participantStandings.length) === 0 ? (
                  <p className="text-sm text-muted">لا توجد بيانات ترتيب.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-foreground bg-surface-2">
                          <th className="px-4 py-3 text-right text-xs font-bold">#</th>
                          <th className="px-4 py-3 text-right text-xs font-bold">
                            {isTeamBased ? "الفريق" : "اللاعب"}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold">لعب</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-success">فوز</th>
                          <th className="px-4 py-3 text-center text-xs font-bold">تعادل</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-danger">خسارة</th>
                          <th className="px-4 py-3 text-center text-xs font-bold">الأهداف</th>
                          <th className="px-4 py-3 text-center text-xs font-bold">الفرق</th>
                          <th className="px-4 py-3 text-center text-xs font-bold">النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isTeamBased
                          ? teamStandings.map((standing, index) => {
                              const highlight =
                                index === 0
                                  ? "bg-warning/10"
                                  : index === 1 || index === 2
                                  ? "bg-surface-2"
                                  : "";
                              const members = teamMembersMap.get(standing.team.id) || [];
                              return (
                                <tr
                                  key={standing.team.id}
                                  className={`border-b border-border ${highlight}`}
                                >
                                  <td className="px-4 py-3 text-right font-bold text-foreground">
                                    {index === 0
                                      ? "🥇"
                                      : index === 1
                                      ? "🥈"
                                      : index === 2
                                      ? "🥉"
                                      : index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <p className="font-semibold text-foreground">{standing.team.name}</p>
                                    {members.length > 0 && (
                                      <p className="text-xs text-muted mt-0.5">{members.join(" • ")}</p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center text-secondary">{standing.played}</td>
                                  <td className="px-4 py-3 text-center text-success font-semibold">{standing.wins}</td>
                                  <td className="px-4 py-3 text-center text-secondary">{standing.draws}</td>
                                  <td className="px-4 py-3 text-center text-danger font-semibold">{standing.losses}</td>
                                  <td className="px-4 py-3 text-center text-secondary">
                                    {standing.goalsFor} - {standing.goalsAgainst}
                                  </td>
                                  <td className="px-4 py-3 text-center text-secondary">
                                    {standing.goalDiff >= 0 ? "+" : ""}
                                    {standing.goalDiff}
                                  </td>
                                  <td className="px-4 py-3 text-center font-black text-primary">{standing.points}</td>
                                </tr>
                              );
                            })
                          : participantStandings.map((standing, index) => {
                              const highlight =
                                index === 0
                                  ? "bg-warning/10"
                                  : index === 1 || index === 2
                                  ? "bg-surface-2"
                                  : "";
                              return (
                                <tr
                                  key={standing.participant.id}
                                  className={`border-b border-border ${highlight}`}
                                >
                                  <td className="px-4 py-3 text-right font-bold text-foreground">
                                    {index === 0
                                      ? "🥇"
                                      : index === 1
                                      ? "🥈"
                                      : index === 2
                                      ? "🥉"
                                      : index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                                    {standing.participant.name}
                                  </td>
                                  <td className="px-4 py-3 text-center text-secondary">{standing.played}</td>
                                  <td className="px-4 py-3 text-center text-success font-semibold">{standing.wins}</td>
                                  <td className="px-4 py-3 text-center text-secondary">{standing.draws}</td>
                                  <td className="px-4 py-3 text-center text-danger font-semibold">{standing.losses}</td>
                                  <td className="px-4 py-3 text-center text-secondary">
                                    {standing.goalsFor} - {standing.goalsAgainst}
                                  </td>
                                  <td className="px-4 py-3 text-center text-secondary">
                                    {standing.goalDiff >= 0 ? "+" : ""}
                                    {standing.goalDiff}
                                  </td>
                                  <td className="px-4 py-3 text-center font-black text-primary">{standing.points}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : matches.length === 0 ? (
                <p className="text-sm text-muted">لا توجد مباريات.</p>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupByRound(matches))
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([round, roundMatches]) => (
                      <div key={round}>
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
                          الجولة {round}
                          {roundMatches.length === 1 && " (النهائي)"}
                        </h3>
                        <div className="grid gap-4">
                          {roundMatches.map((match) => {
                            const homeName = isTeamBased
                              ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                              : nameMap.get(match.home_participant_id ?? "") ?? "-";
                            const awayName = isTeamBased
                              ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                              : nameMap.get(match.away_participant_id ?? "") ?? "-";
                            const winnerName = isTeamBased
                              ? teamNameMap.get(match.winner_team_id ?? "") ?? "-"
                              : nameMap.get(match.winner_participant_id ?? "") ?? "-";
                            const homeMembers =
                              isTeamBased && match.home_team_id
                                ? teamMembersMap.get(match.home_team_id) || []
                                : [];
                            const awayMembers =
                              isTeamBased && match.away_team_id
                                ? teamMembersMap.get(match.away_team_id) || []
                                : [];
                            const isHomeWinner = isTeamBased
                              ? match.winner_team_id === match.home_team_id
                              : match.winner_participant_id === match.home_participant_id;
                            const isAwayWinner = isTeamBased
                              ? match.winner_team_id === match.away_team_id
                              : match.winner_participant_id === match.away_participant_id;
                            const hasWinner = isTeamBased
                              ? match.winner_team_id
                              : match.winner_participant_id;

                            return (
                              <div
                                key={match.id}
                                className="rounded-2xl border border-border bg-surface-2 p-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span
                                        className={
                                          isHomeWinner
                                            ? "font-bold text-foreground"
                                            : "text-secondary"
                                        }
                                      >
                                        {homeName}
                                      </span>
                                      {isTeamBased && homeMembers.length > 0 && (
                                        <p className="text-xs text-muted mt-0.5">{homeMembers.join(" • ")}</p>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-primary">
                                      {match.home_score !== null ? match.home_score : "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span
                                        className={
                                          isAwayWinner
                                            ? "font-bold text-foreground"
                                            : "text-secondary"
                                        }
                                      >
                                        {awayName}
                                      </span>
                                      {isTeamBased && awayMembers.length > 0 && (
                                        <p className="text-xs text-muted mt-0.5">{awayMembers.join(" • ")}</p>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-primary">
                                      {match.away_score !== null ? match.away_score : "—"}
                                    </span>
                                  </div>
                                  {hasWinner && (
                                    <div className="text-center pt-3 border-t border-border">
                                      <span className="text-xs text-primary font-semibold">
                                        ✓ انتقل: {winnerName}
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
                </div>
              )}
            </Card>
          </section>
        </div>
      </Container>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Container>
      <div className="mb-8">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary mb-6 transition-colors"
        > <ArrowLeft className="w-4 h-4" />
          العودة للبطولات
        </Link>

        {/* Setup Banner for incomplete tournaments */}
        {setupStatus.isIncomplete && (
          <div className="mb-6">
            <SetupBanner
              tournamentId={tournament.id}
              tournamentSlug={tournament.slug}
              isAdmin={isAdmin}
              setupMessage={setupStatus.setupMessage}
            />
          </div>
        )}

        {/* Hero Section */}
        <Card className="p-8 md:p-10 bg-surface border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={tournament.status} />
                {tournament.start_date && (
                  <TournamentCountdown
                    startDate={tournament.start_date}
                    matchesCount={matches.length}
                    completedMatches={completedMatches}
                    tournamentStatus={tournament.status}
                  />
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border text-secondary">
                  {tournament.type === "league" ? "دوري" : tournament.type === "knockout" ? "خروج المغلوب" : "غير محدد"}
                </span>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                  {tournament.name}
                </h1>
                <p className="mt-2 text-secondary text-lg">
                  {tournament.type === "league" && "نظام الدوري الكامل"}
                  {tournament.type === "knockout" && "نظام خروج المغلوب"}
                  {!tournament.type && "لم يتم تحديد النظام بعد"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/t/${encodeSlug(tournament.slug)}/schedule`}>
                <Button size="lg" icon={<CalendarDays className="w-5 h-5"/>}>
                  جدول المباريات
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {canRegister && (
        <Card className="p-6 mb-8 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-foreground">سجل في البطولة</h3>
              <p className="text-sm text-secondary mt-1">
                {currentUser 
                  ? "انقر على الزر للتسجيل في البطولة"
                  : "يجب تسجيل الدخول للتسجيل في البطولة"
                }
              </p>
              
              {/* Success messages */}
              {searchParams?.registered === "success" && (
                <p className="text-sm font-semibold text-primary mt-3">
                  ✅ تم تسجيلك في البطولة بنجاح!
                </p>
              )}
              {searchParams?.registered === "already" && (
                <p className="text-sm font-semibold text-primary mt-3">
                  ✅ أنت مسجل في هذه البطولة مسبقاً
                </p>
              )}
              
              {/* Error messages */}
              {errorFlag === "auth" && (
                <p className="text-sm font-semibold text-danger mt-3">
                  يجب تسجيل الدخول للتسجيل في البطولة
                </p>
              )}
              {errorFlag === "closed" && (
                <p className="text-sm font-semibold text-danger mt-3">
                  التسجيل مغلق حالياً
                </p>
              )}
              {errorFlag === "notfound" && (
                <p className="text-sm font-semibold text-danger mt-3">
                  تعذر العثور على البطولة
                </p>
              )}
              {errorFlag === "server" && (
                <p className="text-sm font-semibold text-danger mt-3">
                  حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!currentUser ? (
                // Not logged in - show login buttons
                <>
                  <Link href={`/auth/login?redirect=/t/${encodeSlug(tournament.slug)}`}>
                    <Button size="lg" icon={<LogIn className="w-5 h-5" />}>
                      دخول
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg" variant="secondary" icon={<UserPlus className="w-5 h-5" />}>
                      تسجيل
                    </Button>
                  </Link>
                </>
              ) : isAlreadyRegistered ? (
                // Already registered
                <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold">
                  ✅ أنت مسجل
                </div>
              ) : (
                // Logged in - show register button
                <form action={registerAuthenticatedUser}>
                  <input type="hidden" name="tournamentId" value={tournament.id} />
                  <input type="hidden" name="tournamentSlug" value={tournament.slug} />
                  <Button type="submit" size="lg">
                    سجّلني في البطولة 🎮
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <StatsTile 
          label="المشاركون" 
          value={formatNumber(participants.length)} 
          icon={<Users className="w-5 h-5 text-primary" />} 
        />
        <StatsTile 
          label="المباريات" 
          value={formatNumber(matches.length)} 
          icon={<CalendarDays className="w-5 h-5 text-primary" />} 
        />
        <StatsTile 
          label="المكتملة" 
          value={`${completedMatches}/${formatNumber(matches.length)}`}
          sublabel={matches.length === 0 ? "لم تبدأ المباريات" : ""}
          icon={<Target className="w-5 h-5 text-primary" />} 
        />
        <StatsTile 
          label="المتوسط" 
          value={matches.length > 0 ? (goalsTotal / matches.length).toFixed(1) : "0"} 
          suffix="هدف/مباراة"
          icon={<BarChart3 className="w-5 h-5 text-primary" />} 
        />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-primary" />
        الأقسام
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <SectionAnchor 
          href="#participants"
          title="المشاركون"
          description={`عرض قائمة ${isTeamBased ? "الفرق" : "اللاعبين"}`}
          icon={<Users className="w-6 h-6" />}
        />
        
        <SectionAnchor 
          href="#matches"
          title="جدول المباريات"
          description="تصفح المباريات القادمة والنتائج"
          icon={<CalendarDays className="w-6 h-6" />}
        />

        {tournament.type === "league" && (
          <SectionAnchor 
            href="#standings"
            title="جدول الترتيب"
            description="متابعة النقاط والمراكز"
            icon={<BarChart3 className="w-6 h-6" />}
          />
        )}

        {tournament.type === "knockout" && (
          <SectionAnchor 
            href="#bracket"
            title="شجرة البطولة"
            description="مسار التأهل للنهائي"
            icon={<GitBranch className="w-6 h-6" />}
          />
        )}
      </div>

      {/* Participants Section */}
      <section id="participants" className="mb-10 scroll-mt-8">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {isTeamBased ? "الفرق" : "المشاركون"}
            </h2>
            <span className="button-secondary px-4 py-2 text-xs font-semibold">
              {isTeamBased ? teams.length : participants.length} {isTeamBased ? "فريق" : "مشارك"}
            </span>
          </div>
          {!isTeamBased ? (
            participants.length === 0 ? (
              <p className="text-sm text-muted">لا يوجد مشاركون بعد.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {participants.map((participant, index) => (
                  <li
                    key={participant.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-foreground">{participant.name}</span>
                  </li>
                ))}
              </ul>
            )
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted">لا توجد فرق بعد.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  teamId={team.id}
                  tournamentId={tournament.id}
                  teamName={team.name || "فريق"}
                  members={teamMembersMap.get(team.id) || []}
                />
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Matches Section */}
      <section id="matches" className="mb-10 scroll-mt-8">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              جدول المباريات
            </h2>
            <span className="text-xs text-muted">{matches.length} مباراة</span>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-muted">لم يتم إنشاء مباريات بعد.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupByRound(matches))
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundMatches]) => (
                  <div key={round}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                        الجولة {round}
                      </h3>
                      <span className="text-xs text-muted">{roundMatches.length} مباراة</span>
                    </div>
                    <div className="grid gap-3">
                      {roundMatches.map((match) => {
                        const homeName = isTeamBased
                          ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                          : nameMap.get(match.home_participant_id ?? "") ?? "-";
                        const awayName = isTeamBased
                          ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                          : nameMap.get(match.away_participant_id ?? "") ?? "-";
                        const homeMembers =
                          isTeamBased && match.home_team_id
                            ? teamMembersMap.get(match.home_team_id) || []
                            : [];
                        const awayMembers =
                          isTeamBased && match.away_team_id
                            ? teamMembersMap.get(match.away_team_id) || []
                            : [];

                        return (
                          <div
                            key={match.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm"
                          >
                            <div className="flex-1 text-right">
                              <p className="font-semibold text-foreground">{homeName}</p>
                              {isTeamBased && homeMembers.length > 0 && (
                                <p className="text-xs text-muted mt-1">{homeMembers.join(" • ")}</p>
                              )}
                            </div>
                            <div className="min-w-[100px] text-center">
                              {match.home_score !== null && match.away_score !== null ? (
                                <div className="text-xl font-black text-primary">
                                  {match.home_score} : {match.away_score}
                                </div>
                              ) : (
                                <div className="text-sm text-muted">vs</div>
                              )}
                              <span className="text-xs text-muted mt-1 block">
                                {match.status === "completed" ? "✓ انتهت" : "⏱ قادمة"}
                              </span>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-foreground">{awayName}</p>
                              {isTeamBased && awayMembers.length > 0 && (
                                <p className="text-xs text-muted mt-1">{awayMembers.join(" • ")}</p>
                              )}
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
      </section>

      {/* Standings Section - League only */}
      {tournament.type === "league" && (
        <section id="standings" className="mb-10 scroll-mt-8">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                جدول الترتيب
              </h2>
            </div>
            {(() => {
              const participantStandings = !isTeamBased ? computeStandings(participants, matches) : [];
              const teamStandings = isTeamBased ? computeTeamStandings(teams, matches) : [];
              const hasStandings = isTeamBased ? teamStandings.length > 0 : participantStandings.length > 0;
              
              if (!hasStandings) {
                return <p className="text-sm text-muted">لا توجد بيانات ترتيب بعد.</p>;
              }
              
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-foreground bg-surface-2">
                        <th className="px-3 py-3 text-right text-xs font-bold">#</th>
                        <th className="px-3 py-3 text-right text-xs font-bold">{isTeamBased ? "الفريق" : "اللاعب"}</th>
                        <th className="px-3 py-3 text-center text-xs font-bold">لعب</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-success">فوز</th>
                        <th className="px-3 py-3 text-center text-xs font-bold">تعادل</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-danger">خسارة</th>
                        <th className="px-3 py-3 text-center text-xs font-bold">+/-</th>
                        <th className="px-3 py-3 text-center text-xs font-bold">النقاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isTeamBased
                        ? teamStandings.map((standing, index) => {
                            const highlight = index === 0 ? "bg-primary/5" : index < 3 ? "bg-surface-2" : "";
                            const members = teamMembersMap.get(standing.team.id) || [];
                            return (
                              <tr key={standing.team.id} className={`border-b border-border ${highlight}`}>
                                <td className="px-3 py-3 text-right font-bold text-foreground">
                                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <p className="font-semibold text-foreground">{standing.team.name}</p>
                                  {members.length > 0 && <p className="text-xs text-muted">{members.join(" • ")}</p>}
                                </td>
                                <td className="px-3 py-3 text-center text-secondary">{standing.played}</td>
                                <td className="px-3 py-3 text-center text-success font-semibold">{standing.wins}</td>
                                <td className="px-3 py-3 text-center text-secondary">{standing.draws}</td>
                                <td className="px-3 py-3 text-center text-danger font-semibold">{standing.losses}</td>
                                <td className="px-3 py-3 text-center text-secondary">
                                  {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                                </td>
                                <td className="px-3 py-3 text-center font-black text-primary">{standing.points}</td>
                              </tr>
                            );
                          })
                        : participantStandings.map((standing, index) => {
                            const highlight = index === 0 ? "bg-primary/5" : index < 3 ? "bg-surface-2" : "";
                            return (
                              <tr key={standing.participant.id} className={`border-b border-border ${highlight}`}>
                                <td className="px-3 py-3 text-right font-bold text-foreground">
                                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold text-foreground">{standing.participant.name}</td>
                                <td className="px-3 py-3 text-center text-secondary">{standing.played}</td>
                                <td className="px-3 py-3 text-center text-success font-semibold">{standing.wins}</td>
                                <td className="px-3 py-3 text-center text-secondary">{standing.draws}</td>
                                <td className="px-3 py-3 text-center text-danger font-semibold">{standing.losses}</td>
                                <td className="px-3 py-3 text-center text-secondary">
                                  {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                                </td>
                                <td className="px-3 py-3 text-center font-black text-primary">{standing.points}</td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </Card>
        </section>
      )}

      {/* Bracket Section - Knockout only */}
      {tournament.type === "knockout" && (
        <section id="bracket" className="mb-10 scroll-mt-8">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                شجرة البطولة
              </h2>
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-muted">لم تتم القرعة بعد.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupByRound(matches))
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, roundMatches]) => (
                    <div key={round}>
                      <div className="mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                          {roundMatches.length === 1 ? "🏆 النهائي" : `الجولة ${round}`}
                        </h3>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {roundMatches.map((match) => {
                          const homeName = isTeamBased
                            ? teamNameMap.get(match.home_team_id ?? "") ?? "-"
                            : nameMap.get(match.home_participant_id ?? "") ?? "-";
                          const awayName = isTeamBased
                            ? teamNameMap.get(match.away_team_id ?? "") ?? "-"
                            : nameMap.get(match.away_participant_id ?? "") ?? "-";
                          const homeMembers = isTeamBased && match.home_team_id ? teamMembersMap.get(match.home_team_id) || [] : [];
                          const awayMembers = isTeamBased && match.away_team_id ? teamMembersMap.get(match.away_team_id) || [] : [];
                          const isHomeWinner = isTeamBased
                            ? match.winner_team_id === match.home_team_id
                            : match.winner_participant_id === match.home_participant_id;
                          const isAwayWinner = isTeamBased
                            ? match.winner_team_id === match.away_team_id
                            : match.winner_participant_id === match.away_participant_id;

                          return (
                            <div key={match.id} className="rounded-2xl border border-border bg-surface-2 p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className={isHomeWinner ? "font-bold text-foreground" : "text-secondary"}>{homeName}</span>
                                    {isTeamBased && homeMembers.length > 0 && <p className="text-xs text-muted">{homeMembers.join(" • ")}</p>}
                                  </div>
                                  <span className="text-sm font-bold text-primary">{match.home_score ?? "—"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className={isAwayWinner ? "font-bold text-foreground" : "text-secondary"}>{awayName}</span>
                                    {isTeamBased && awayMembers.length > 0 && <p className="text-xs text-muted">{awayMembers.join(" • ")}</p>}
                                  </div>
                                  <span className="text-sm font-bold text-primary">{match.away_score ?? "—"}</span>
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
        </section>
      )}
      </Container>
    </div>
  );
}

function StatsTile({
  label,
  value,
  icon,
  suffix,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  suffix?: string;
  sublabel?: string;
}) {
  return (
      <Card className="p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-foreground">
          {value} <span className="text-xs font-medium text-secondary">{suffix}</span>
        </p>
        {sublabel && (
          <p className="text-xs text-secondary mt-1">{sublabel}</p>
        )}
      </div>
      <div className="w-11 h-11 rounded-full bg-surface-2 border border-border flex items-center justify-center">
        {icon}
      </div>
    </Card>
  );
}

function NavTile({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="block group">
      <Card hoverable className="h-full border-transparent hover:border-primary/30 bg-surface hover:bg-surface-2/80 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md border border-primary/60 group-hover:bg-primary-dark group-hover:border-primary/80 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground group-hover:text-foreground transition-colors">{title}</h3>
            <p className="text-sm text-secondary mt-2">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SectionAnchor({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <a href={href} className="block group">
      <Card hoverable className="h-full border-transparent hover:border-primary/30 bg-surface hover:bg-surface-2/80 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md border border-primary/60 group-hover:bg-primary-dark group-hover:border-primary/80 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-lg text-foreground group-hover:text-foreground transition-colors">{title}</h3>
            <p className="text-sm text-secondary mt-2">{description}</p>
          </div>
        </div>
      </Card>
    </a>
  );
}
