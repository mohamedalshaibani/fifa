"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { Trophy, Users, CalendarDays, BarChart3, GitBranch, Target, LogIn, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import TournamentCountdown from "@/components/TournamentCountdown";
import SetupBanner from "@/components/SetupBanner";
import RegisterButton from "@/components/RegisterButton";
import type { TeamMemberInfo } from "@/components/TeamCard";
import type { UserProfile } from "@/lib/types";
import { computeStandings, computeTeamStandings, groupMatchesByRound } from "@/lib/tournament-utils";
import { encodeSlug } from "@/lib/slug";
import { Match, Tournament, Team, Participant } from "@/lib/types";
import { registerUserForTournament } from "@/app/public/actions";
import { getEmptyStateText, formatNumber } from "@/lib/empty-state";
import { useLanguage } from "@/lib/i18n";

interface SetupStatus {
  isIncomplete: boolean;
  setupMessage: string | null;
}

interface TournamentDetailContentProps {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  teams: Team[];
  teamMembersMap: Map<string, TeamMemberInfo[]>;
  participantProfilesMap: Map<string, UserProfile>;
  isAdmin: boolean;
  currentUser: { id: string } | null;
  setupStatus: SetupStatus;
  searchParams?: { registered?: string; error?: string };
}

export function TournamentDetailContent({
  tournament,
  participants,
  matches,
  teams,
  teamMembersMap,
  participantProfilesMap,
  isAdmin,
  currentUser,
  setupStatus,
  searchParams,
}: TournamentDetailContentProps) {
  const { t, isRTL, language } = useLanguage();

  const playersPerTeam = tournament.players_per_team ?? 1;
  const isTeamBased = playersPerTeam === 2;
  const canRegister = tournament.status === "registration_open";
  const isAlreadyRegistered = currentUser 
    ? participants.some(p => p.user_id === currentUser.id)
    : false;

  const nameMap = new Map(participants.map((p) => [p.id, p.name]));
  const participantUserIdMap = new Map(participants.map((p) => [p.id, p.user_id]));
  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));

  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const goalsTotal = matches.reduce((sum, match) => {
    const home = typeof match.home_score === "number" ? match.home_score : 0;
    const away = typeof match.away_score === "number" ? match.away_score : 0;
    return sum + home + away;
  }, 0);

  const entityCount = isTeamBased ? teams.length : participants.length;
  const createdDate = new Date(tournament.created_at).toLocaleDateString(isRTL ? "ar-SA" : "en-US");
  const errorFlag = searchParams?.error ?? null;

  // Finished tournament view
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
          <div className="mb-8">
            <BackLink fallbackHref="/tournaments" />

            <Card className="p-4 sm:p-6 md:p-8 lg:p-10 bg-surface border-border relative overflow-hidden">
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
                        {isTeamBased ? t("tournamentDetail.teams") : t("tournamentDetail.individual")}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground break-words hyphens-auto leading-tight">
                      {tournament.name}
                    </h1>
                    <p className="mt-2 text-secondary text-base sm:text-lg max-w-2xl">
                      {tournament.type === "league" && t("tournamentDetail.leagueCompleted")}
                      {tournament.type === "knockout" && t("tournamentDetail.knockoutCompleted")}
                      {!tournament.type && t("tournamentDetail.tournamentFinished")}
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
                        {t("tournamentDetail.champion")}
                      </p>
                      <h2 className="mt-2 text-3xl md:text-4xl font-black text-foreground">
                        {championName ?? getEmptyStateText('champion', language)}
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
                        {t("tournamentDetail.runnerUp")}
                      </p>
                      <h2 className="mt-2 text-2xl md:text-3xl font-black text-muted-foreground">
                        {runnerUpName ?? getEmptyStateText('champion', language)}
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
                    label={t("tournamentDetail.matchesLabel")} 
                    value={`${completedMatches}/${matches.length}`}
                    icon={<Target className="w-5 h-5 text-primary" />} 
                  />
                  <StatsTile 
                    label={t("tournamentDetail.goalsLabel")} 
                    value={goalsTotal} 
                    icon={<Trophy className="w-5 h-5 text-warning" />} 
                  />
                  <StatsTile 
                    label={isTeamBased ? t("tournamentDetail.teamsLabel") : t("tournamentDetail.participantsLabel")} 
                    value={entityCount} 
                    icon={<Users className="w-5 h-5 text-info" />} 
                  />
                  <StatsTile 
                    label={t("tournamentDetail.formatLabel")} 
                    value={tournament.type === "league" ? t("tournamentDetail.leagueTypeLabel") : t("tournamentDetail.knockoutTypeLabel")}
                    icon={<GitBranch className="w-5 h-5 text-secondary" />} 
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  <a href="#participants" className="btn btn-secondary text-sm">
                    {isTeamBased ? t("tournamentDetail.teamsLabel") : t("tournamentDetail.participantsLabel")}
                  </a>
                  <a href="#results" className="btn btn-secondary text-sm">
                    {t("tournamentDetail.results")}
                  </a>
                  <a href="#final" className="btn btn-secondary text-sm">
                    {tournament.type === "league" ? t("tournamentDetail.finalStandings") : t("tournamentDetail.bracketSummary")}
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Participants Section */}
            <section id="participants" className="scroll-mt-8">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    {isTeamBased ? t("tournamentDetail.participantsTeamsLabel") : t("tournamentDetail.participantsLabel")}
                  </h2>
                  <span className="button-secondary px-4 py-2 text-xs font-semibold">
                    {participants.length} {t("tournamentDetail.participantCount")}
                    {isTeamBased && teams.length > 0 && ` • ${teams.length} ${t("tournamentDetail.teamCount")}`}
                  </span>
                </div>

                {/* Show teams if team-based AND teams are formed */}
                {isTeamBased && teams.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => {
                      const members = teamMembersMap.get(team.id) || [];
                      return (
                        <div
                          key={team.id}
                          className="rounded-2xl border border-border bg-surface-2 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-lg">
                              👥
                            </span>
                            <h3 className="font-bold text-foreground text-base">
                              {team.name || t("tournamentDetail.unnamedTeam")}
                            </h3>
                          </div>
                          {members.length > 0 ? (
                            <ul className="space-y-2 ps-2 border-s-2 border-primary/20 ms-5">
                              {members.map((member, idx) => {
                                const memberName = typeof member === 'string' ? member : member.name;
                                const memberAvatar = typeof member === 'string' ? null : member.avatarUrl;
                                return (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-secondary">
                                    {memberAvatar ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img 
                                        src={memberAvatar} 
                                        alt={memberName}
                                        className="w-6 h-6 rounded-full object-cover border border-border"
                                      />
                                    ) : (
                                      <span className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs border border-border">
                                        👤
                                      </span>
                                    )}
                                    <span className="font-medium">{memberName}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted ps-2">{t("tournamentDetail.noMembers")}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : participants.length === 0 ? (
                  /* No participants registered yet */
                  <p className="text-sm text-muted">{t("tournamentDetail.noParticipants")}</p>
                ) : (
                  /* Show participants list (for individual tournaments OR before teams are formed) */
                  <div className="space-y-4">
                    {isTeamBased && teams.length === 0 && (
                      <p className="text-sm text-muted mb-4 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
                        ⏳ {t("tournamentDetail.teamsNotFormed")}
                      </p>
                    )}
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {participants.map((participant, index) => {
                        const profile = participant.user_id ? participantProfilesMap.get(participant.user_id) : null;
                        const avatarUrl = profile?.avatar_url;
                        
                        return (
                          <li
                            key={participant.id}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarUrl}
                                alt={participant.name}
                                className="h-9 w-9 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 border border-border text-lg">
                                👤
                              </span>
                            )}
                            {participant.user_id ? (
                              <Link
                                href={`/player/${participant.user_id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
                              >
                                {participant.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-foreground">{participant.name}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Card>
            </section>

            {/* Results Section */}
            <section id="results">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-lg font-bold text-foreground">{t("tournamentDetail.resultsSchedule")}</h2>
                  <span className="text-xs text-muted">{matches.length} {t("tournament.match")}</span>
                </div>

                {matches.length === 0 ? (
                  <p className="text-sm text-muted">{t("tournamentDetail.noMatchesCreated")}</p>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupMatchesByRound(matches))
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([round, roundMatches]) => (
                        <div key={round}>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                              {t("tournament.round")} {round}
                            </h3>
                            <span className="text-xs text-muted">{roundMatches.length} {t("tournament.match")}</span>
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
                              
                              const homeUserId = !isTeamBased && match.home_participant_id 
                                ? participantUserIdMap.get(match.home_participant_id) 
                                : null;
                              const awayUserId = !isTeamBased && match.away_participant_id 
                                ? participantUserIdMap.get(match.away_participant_id) 
                                : null;

                              return (
                                <div
                                  key={match.id}
                                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm"
                                >
                                  <div className="flex-1 text-right">
                                    {homeUserId ? (
                                      <Link href={`/player/${homeUserId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                        {homeName}
                                      </Link>
                                    ) : (
                                      <p className="font-semibold text-foreground">{homeName}</p>
                                    )}
                                    {isTeamBased && homeMembers.length > 0 && (
                                      <p className="text-xs text-muted mt-1">{homeMembers.map(m => m.name).join(" • ")}</p>
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
                                      {match.status === "completed" ? `✓ ${t("tournamentDetail.matchFinished")}` : `⏱ ${t("tournamentDetail.matchPending")}`}
                                    </span>
                                  </div>
                                  <div className="flex-1 text-left">
                                    {awayUserId ? (
                                      <Link href={`/player/${awayUserId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                        {awayName}
                                      </Link>
                                    ) : (
                                      <p className="font-semibold text-foreground">{awayName}</p>
                                    )}
                                    {isTeamBased && awayMembers.length > 0 && (
                                      <p className="text-xs text-muted mt-1">{awayMembers.map(m => m.name).join(" • ")}</p>
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

            {/* Final Standings Section */}
            <section id="final">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    {tournament.type === "league" ? t("tournamentDetail.finalStandings") : t("tournamentDetail.bracketSummary")}
                  </h2>
                </div>

                {tournament.type === "league" ? (
                  (isTeamBased ? teamStandings.length : participantStandings.length) === 0 ? (
                    <p className="text-sm text-muted">{t("tournamentDetail.noStandingsData")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-foreground bg-surface-2">
                            <th className="px-4 py-3 text-right text-xs font-bold">#</th>
                            <th className="px-4 py-3 text-right text-xs font-bold">
                              {isTeamBased ? t("tournamentDetail.team") : t("tournamentDetail.player")}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold">{t("tournamentDetail.played")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-success">{t("tournamentDetail.won")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold">{t("tournamentDetail.draw")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-danger">{t("tournamentDetail.lost")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold">{t("tournamentDetail.goalsFor")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold">{t("tournamentDetail.goalDiff")}</th>
                            <th className="px-4 py-3 text-center text-xs font-bold">{t("tournamentDetail.points")}</th>
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
                                        <p className="text-xs text-muted mt-0.5">{members.map(m => m.name).join(" • ")}</p>
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
                  <p className="text-sm text-muted">{t("tournamentDetail.noMatchesYet")}</p>
                ) : (
                  <BracketView 
                    matches={matches} 
                    isTeamBased={isTeamBased} 
                    nameMap={nameMap} 
                    participantUserIdMap={participantUserIdMap}
                    teamNameMap={teamNameMap} 
                    teamMembersMap={teamMembersMap}
                  />
                )}
              </Card>
            </section>
          </div>
        </Container>
      </div>
    );
  }

  // Active tournament view
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Container>
        <div className="mb-8">
          <BackLink fallbackHref="/tournaments" />

          {setupStatus.isIncomplete && (
            <div className="mb-6">
              <SetupBanner
                tournamentId={tournament.id}
                tournamentSlug={tournament.slug}
                isAdmin={isAdmin}
                setupMessage={t("tournamentDetail.setupMessage")}
              />
            </div>
          )}

          <Card className="p-4 sm:p-6 md:p-8 lg:p-10 bg-surface border-primary/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
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
                    {tournament.type === "league" 
                      ? t("tournamentDetail.leagueTypeLabel") 
                      : tournament.type === "knockout" 
                      ? t("tournamentDetail.knockoutTypeLabel") 
                      : t("tournamentDetail.notDefined")}
                  </span>
                </div>
                
                <div className="min-w-0 w-full">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight break-words hyphens-auto leading-tight">
                    {tournament.name}
                  </h1>
                  <p className="mt-2 text-secondary text-base sm:text-lg">
                    {tournament.type === "league" && t("tournament.leagueFormat")}
                    {tournament.type === "knockout" && t("tournament.knockoutFormat")}
                    {!tournament.type && t("tournamentDetail.formatNotSet")}
                  </p>
                </div>
              </div>

              {matches.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/t/${encodeSlug(tournament.slug)}/schedule`}>
                    <Button size="lg" icon={<CalendarDays className="w-5 h-5"/>}>
                      {t("tournamentDetail.matchSchedule")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {canRegister && (
          <Card className="p-6 mb-8 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-foreground">{t("tournamentDetail.registerTitle")}</h3>
                <p className="text-sm text-secondary mt-1">
                  {currentUser 
                    ? t("tournamentDetail.clickToRegister")
                    : t("tournamentDetail.loginToRegister")
                  }
                </p>
                
                {searchParams?.registered === "success" && (
                  <p className="text-sm font-semibold text-primary mt-3">
                    ✅ {t("tournamentDetail.registeredSuccess")}
                  </p>
                )}
                {searchParams?.registered === "already" && (
                  <p className="text-sm font-semibold text-primary mt-3">
                    ✅ {t("tournamentDetail.alreadyRegistered")}
                  </p>
                )}
                
                {errorFlag === "auth" && (
                  <p className="text-sm font-semibold text-danger mt-3">
                    {t("tournamentDetail.errorAuth")}
                  </p>
                )}
                {errorFlag === "closed" && (
                  <p className="text-sm font-semibold text-danger mt-3">
                    {t("tournamentDetail.errorClosed")}
                  </p>
                )}
                {errorFlag === "notfound" && (
                  <p className="text-sm font-semibold text-danger mt-3">
                    {t("tournamentDetail.errorNotFound")}
                  </p>
                )}
                {errorFlag === "server" && (
                  <p className="text-sm font-semibold text-danger mt-3">
                    {t("tournamentDetail.errorServer")}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {!currentUser ? (
                  <>
                    <Link href={`/auth/login?redirect=/t/${encodeSlug(tournament.slug)}`}>
                      <Button size="lg" icon={<LogIn className="w-5 h-5" />}>
                        {t("tournamentDetail.login")}
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="lg" variant="secondary" icon={<UserPlus className="w-5 h-5" />}>
                        {t("tournamentDetail.signUp")}
                      </Button>
                    </Link>
                  </>
                ) : isAlreadyRegistered ? (
                  <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold">
                    ✅ {t("tournamentDetail.youAreRegistered")}
                  </div>
                ) : (
                  <RegisterButton
                    tournamentId={tournament.id}
                    tournamentSlug={tournament.slug}
                    registerAction={registerUserForTournament}
                  />
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <StatsTile 
            label={t("tournamentDetail.participantsLabel")} 
            value={formatNumber(participants.length)} 
            icon={<Users className="w-5 h-5 text-primary" />} 
          />
          <StatsTile 
            label={t("tournamentDetail.matchesLabel")} 
            value={formatNumber(matches.length)} 
            icon={<CalendarDays className="w-5 h-5 text-primary" />} 
          />
          <StatsTile 
            label={t("tournamentDetail.completedStat")} 
            value={`${completedMatches}/${formatNumber(matches.length)}`}
            sublabel={matches.length === 0 ? t("tournamentDetail.matchesNotStarted") : ""}
            icon={<Target className="w-5 h-5 text-primary" />} 
          />
          <StatsTile 
            label={t("tournamentDetail.averageStat")} 
            value={matches.length > 0 ? (goalsTotal / matches.length).toFixed(1) : "0"} 
            suffix={t("tournamentDetail.goalsPerMatch")}
            icon={<BarChart3 className="w-5 h-5 text-primary" />} 
          />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          {t("tournamentDetail.sections")}
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
          <SectionAnchor 
            href="#participants"
            title={isTeamBased ? t("tournamentDetail.participantsTeamsLabel") : t("tournamentDetail.participantsLabel")}
            description={isTeamBased ? t("tournamentDetail.viewParticipantsTeams") : t("tournamentDetail.viewPlayersList")}
            icon={<Users className="w-6 h-6" />}
          />
          
          {matches.length > 0 && (
            <SectionAnchor 
              href="#matches"
              title={t("tournamentDetail.matchSchedule")}
              description={t("tournamentDetail.browseMatchesResults")}
              icon={<CalendarDays className="w-6 h-6" />}
            />
          )}

          {tournament.type === "league" && (
            <SectionAnchor 
              href="#standings"
              title={t("tournamentDetail.standings")}
              description={t("tournamentDetail.trackPointsRankings")}
              icon={<BarChart3 className="w-6 h-6" />}
            />
          )}

          {tournament.type === "knockout" && (
            <SectionAnchor 
              href="#bracket"
              title={t("tournamentDetail.bracket")}
              description={t("tournamentDetail.pathToFinal")}
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
                {isTeamBased ? t("tournamentDetail.participantsTeamsLabel") : t("tournamentDetail.participantsLabel")}
              </h2>
              <span className="button-secondary px-4 py-2 text-xs font-semibold">
                {participants.length} {t("tournamentDetail.participantCount")}
                {isTeamBased && teams.length > 0 && ` • ${teams.length} ${t("tournamentDetail.teamCount")}`}
              </span>
            </div>

            {/* For team-based tournaments with teams formed: show teams with members */}
            {isTeamBased && teams.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => {
                  const members = teamMembersMap.get(team.id) || [];
                  return (
                    <div
                      key={team.id}
                      className="rounded-2xl border border-border bg-surface-2 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-lg">
                          👥
                        </span>
                        <h3 className="font-bold text-foreground text-base">
                          {team.name || t("tournamentDetail.unnamedTeam")}
                        </h3>
                      </div>
                      {members.length > 0 ? (
                        <ul className="space-y-2 ps-2 border-s-2 border-primary/20 ms-5">
                          {members.map((member, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-secondary">
                              {member.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={member.avatarUrl} 
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs border border-border">
                                  👤
                                </span>
                              )}
                              <span className="font-medium">{member.name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted ps-2">{t("tournamentDetail.noMembers")}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : participants.length === 0 ? (
              /* No participants registered yet */
              <p className="text-sm text-muted">{t("tournamentDetail.noParticipantsYet")}</p>
            ) : (
              /* Show participants list (for individual tournaments OR team-based before teams are formed) */
              <div className="space-y-4">
                {isTeamBased && (
                  <p className="text-sm text-muted mb-4 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
                    ⏳ {t("tournamentDetail.teamsNotFormed")}
                  </p>
                )}
                <ul className="grid gap-3 sm:grid-cols-2">
                  {participants.map((participant, index) => {
                    const profile = participant.user_id ? participantProfilesMap.get(participant.user_id) : null;
                    const avatarUrl = profile?.avatar_url;
                    
                    return (
                      <li
                        key={participant.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt={participant.name}
                            className="h-9 w-9 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 border border-border text-lg">
                            👤
                          </span>
                        )}
                        {participant.user_id ? (
                          <Link
                            href={`/player/${participant.user_id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {participant.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-foreground">{participant.name}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </section>

        {/* Matches Section */}
        {matches.length > 0 && (
          <section id="matches" className="mb-10 scroll-mt-8">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  {t("tournamentDetail.matchSchedule")}
                </h2>
                <span className="text-xs text-muted">{matches.length} {t("tournament.match")}</span>
              </div>
              <div className="space-y-6">
                {Object.entries(groupMatchesByRound(matches))
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, roundMatches]) => (
                    <div key={round}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                          {t("tournament.round")} {round}
                        </h3>
                        <span className="text-xs text-muted">{roundMatches.length} {t("tournament.match")}</span>
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
                          
                          const homeUserId = !isTeamBased && match.home_participant_id 
                            ? participantUserIdMap.get(match.home_participant_id) 
                            : null;
                          const awayUserId = !isTeamBased && match.away_participant_id 
                            ? participantUserIdMap.get(match.away_participant_id) 
                            : null;

                          return (
                            <div
                              key={match.id}
                              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-4 text-sm"
                            >
                              <div className="flex-1 text-right">
                                {homeUserId ? (
                                  <Link href={`/player/${homeUserId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                    {homeName}
                                  </Link>
                                ) : (
                                  <p className="font-semibold text-foreground">{homeName}</p>
                                )}
                                {isTeamBased && homeMembers.length > 0 && (
                                  <p className="text-xs text-muted mt-1">{homeMembers.map(m => m.name).join(" • ")}</p>
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
                                  {match.status === "completed" ? `✓ ${t("tournamentDetail.matchFinished")}` : `⏱ ${t("tournamentDetail.matchUpcoming")}`}
                                </span>
                              </div>
                              <div className="flex-1 text-left">
                                {awayUserId ? (
                                  <Link href={`/player/${awayUserId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                    {awayName}
                                  </Link>
                                ) : (
                                  <p className="font-semibold text-foreground">{awayName}</p>
                                )}
                                {isTeamBased && awayMembers.length > 0 && (
                                  <p className="text-xs text-muted mt-1">{awayMembers.map(m => m.name).join(" • ")}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </section>
        )}

        {/* Standings Section - League only */}
        {tournament.type === "league" && (
          <section id="standings" className="mb-10 scroll-mt-8">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {t("tournamentDetail.standings")}
                </h2>
              </div>
              <StandingsTable 
                participants={participants}
                teams={teams}
                matches={matches}
                isTeamBased={isTeamBased}
                teamMembersMap={teamMembersMap}
                participantUserIdMap={participantUserIdMap}
              />
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
                  {t("tournamentDetail.bracket")}
                </h2>
              </div>
              {matches.length === 0 ? (
                <p className="text-sm text-muted">{t("tournamentDetail.noDrawYet")}</p>
              ) : (
                <BracketView 
                  matches={matches} 
                  isTeamBased={isTeamBased} 
                  nameMap={nameMap} 
                  participantUserIdMap={participantUserIdMap}
                  teamNameMap={teamNameMap} 
                  teamMembersMap={teamMembersMap}
                />
              )}
            </Card>
          </section>
        )}
      </Container>
    </div>
  );
}

// Helper components
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

function StandingsTable({
  participants,
  teams,
  matches,
  isTeamBased,
  teamMembersMap,
  participantUserIdMap,
}: {
  participants: Participant[];
  teams: Team[];
  matches: Match[];
  isTeamBased: boolean;
  teamMembersMap: Map<string, TeamMemberInfo[]>;
  participantUserIdMap: Map<string, string>;
}) {
  const { t } = useLanguage();
  const participantStandings = !isTeamBased ? computeStandings(participants, matches) : [];
  const teamStandings = isTeamBased ? computeTeamStandings(teams, matches) : [];
  const hasStandings = isTeamBased ? teamStandings.length > 0 : participantStandings.length > 0;
  
  if (!hasStandings) {
    return <p className="text-sm text-muted">{t("tournamentDetail.noStandingsDataYet")}</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-foreground bg-surface-2">
            <th className="px-3 py-3 text-right text-xs font-bold">#</th>
            <th className="px-3 py-3 text-right text-xs font-bold">{isTeamBased ? t("tournamentDetail.team") : t("tournamentDetail.player")}</th>
            <th className="px-3 py-3 text-center text-xs font-bold">{t("tournamentDetail.played")}</th>
            <th className="px-3 py-3 text-center text-xs font-bold text-success">{t("tournamentDetail.won")}</th>
            <th className="px-3 py-3 text-center text-xs font-bold">{t("tournamentDetail.draw")}</th>
            <th className="px-3 py-3 text-center text-xs font-bold text-danger">{t("tournamentDetail.lost")}</th>
            <th className="px-3 py-3 text-center text-xs font-bold">+/-</th>
            <th className="px-3 py-3 text-center text-xs font-bold">{t("tournamentDetail.points")}</th>
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
                      {members.length > 0 && <p className="text-xs text-muted">{members.map(m => m.name).join(" • ")}</p>}
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
                const userId = participantUserIdMap.get(standing.participant.id);
                return (
                  <tr key={standing.participant.id} className={`border-b border-border ${highlight}`}>
                    <td className="px-3 py-3 text-right font-bold text-foreground">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-foreground">
                      {userId ? (
                        <Link href={`/player/${userId}`} className="hover:text-primary transition-colors">
                          {standing.participant.name}
                        </Link>
                      ) : (
                        standing.participant.name
                      )}
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
              })}
        </tbody>
      </table>
    </div>
  );
}

function BracketView({
  matches,
  isTeamBased,
  nameMap,
  participantUserIdMap,
  teamNameMap,
  teamMembersMap,
}: {
  matches: Match[];
  isTeamBased: boolean;
  nameMap: Map<string, string>;
  participantUserIdMap: Map<string, string>;
  teamNameMap: Map<string, string | null>;
  teamMembersMap: Map<string, TeamMemberInfo[]>;
}) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {Object.entries(groupMatchesByRound(matches))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, roundMatches]) => (
          <div key={round}>
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">
                {roundMatches.length === 1 ? `🏆 ${t("tournamentDetail.final")}` : `${t("tournament.round")} ${round}`}
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
                
                const homeUserId = !isTeamBased && match.home_participant_id 
                  ? participantUserIdMap.get(match.home_participant_id) 
                  : null;
                const awayUserId = !isTeamBased && match.away_participant_id 
                  ? participantUserIdMap.get(match.away_participant_id) 
                  : null;

                return (
                  <div key={match.id} className="rounded-2xl border border-border bg-surface-2 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          {homeUserId ? (
                            <Link href={`/player/${homeUserId}`} className={`${isHomeWinner ? "font-bold text-foreground" : "text-secondary"} hover:text-primary transition-colors`}>
                              {homeName}
                            </Link>
                          ) : (
                            <span className={isHomeWinner ? "font-bold text-foreground" : "text-secondary"}>{homeName}</span>
                          )}
                          {isTeamBased && homeMembers.length > 0 && <p className="text-xs text-muted">{homeMembers.map(m => m.name).join(" • ")}</p>}
                        </div>
                        <span className="text-sm font-bold text-primary">{match.home_score ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {awayUserId ? (
                            <Link href={`/player/${awayUserId}`} className={`${isAwayWinner ? "font-bold text-foreground" : "text-secondary"} hover:text-primary transition-colors`}>
                              {awayName}
                            </Link>
                          ) : (
                            <span className={isAwayWinner ? "font-bold text-foreground" : "text-secondary"}>{awayName}</span>
                          )}
                          {isTeamBased && awayMembers.length > 0 && <p className="text-xs text-muted">{awayMembers.map(m => m.name).join(" • ")}</p>}
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
  );
}
