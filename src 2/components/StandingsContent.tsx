"use client";

import Link from "next/link";
import { CalendarDays, Users, BarChart3 } from "lucide-react";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { computeStandings, computeTeamStandings } from "@/lib/tournament-utils";
import { encodeSlug } from "@/lib/slug";
import { Match, Tournament, Team, Participant } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface StandingsContentProps {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  teams: Team[];
  teamMembersMap: Map<string, string[]>;
  isTeamBased: boolean;
}

export function StandingsContent({
  tournament,
  participants,
  matches,
  teams,
  teamMembersMap,
  isTeamBased,
}: StandingsContentProps) {
  const { t } = useLanguage();

  const participantStandings = isTeamBased ? [] : computeStandings(participants, matches);
  const teamStandings = isTeamBased ? computeTeamStandings(teams, matches) : [];

  const pageTitle = `${tournament.name} - ${isTeamBased ? t("standingsPage.teamsStandings") : t("standingsPage.playersStandings")}`;

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <PageHeader
          title={pageTitle}
          icon={<BarChart3 className="h-6 w-6 text-primary" />}
          backHref={`/t/${encodeSlug(tournament.slug)}`}
          badge={<StatusBadge status={tournament.status} />}
          liveIndicator="STANDINGS"
          scoreboard
        />

        {/* Broadcast TV Standings Table */}
        <div className="scoreboard p-0 overflow-hidden">
          {(isTeamBased ? teamStandings.length : participantStandings.length) === 0 ? (
            <p className="text-muted p-8 text-center text-lg">{t("standingsPage.noDataYet")}</p>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-primary/10 text-foreground p-4 border-b border-primary/20">
                <h2 className="text-xl font-black flex items-center gap-2">
                  🏆 {t("standingsPage.leagueTable").toUpperCase()}
                </h2>
              </div>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/70 border-b border-slate-200">
                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-primary">#</th>
                    <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-wider text-primary">
                      {isTeamBased ? t("standingsPage.team").toUpperCase() : t("standingsPage.player").toUpperCase()}
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">P</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">W</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">D</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">L</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GF</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GA</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">GD</th>
                    <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-primary">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {isTeamBased ? (
                    teamStandings.map((standing, index) => {
                      const isChampion = index === 0;
                      const isPodium = index < 3;
                      const positionClass = isChampion 
                        ? "bg-gold/10 border-l-4 border-gold animate-scoreboard-glow" 
                        : index === 1 
                        ? "bg-silver/10 border-l-4 border-silver" 
                        : index === 2 
                        ? "bg-bronze/10 border-l-4 border-bronze" 
                        : "bg-white/60 hover:bg-white/70";
                      
                      const members = teamMembersMap.get(standing.team.id) || [];
                      
                      return (
                        <tr
                          key={standing.team.id}
                          className={`border-b border-slate-200 transition-all duration-300 ${positionClass}`}
                        >
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-xl ${isChampion ? 'animate-float' : ''}`}>
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                              </span>
                              <span className={`font-black text-lg ${isPodium ? 'text-primary' : 'text-foreground'}`}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center gap-3 justify-end">
                              <div>
                                <p className={`font-black text-lg ${isChampion ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                                  {standing.team.name}
                                </p>
                                {members.length > 0 && (
                                  <p className="text-xs text-muted mt-0.5 leading-tight">{members.join(' • ')}</p>
                                )}
                              </div>
                              <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">{(standing.team.name || "T").charAt(0)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-foreground text-lg">{standing.played}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-primary text-lg">{standing.wins}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-muted text-lg">{standing.draws}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-muted text-lg">{standing.losses}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-foreground text-lg">{standing.goalsFor}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-muted text-lg">{standing.goalsAgainst}</span>
                          </td>
                          <td className={`px-4 py-4 text-center font-black text-lg ${
                            standing.goalDiff > 0 ? 'text-primary' : standing.goalDiff < 0 ? 'text-muted' : 'text-muted'
                          }`}>
                            {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-black text-xl border-2 ${
                              isChampion 
                                ? 'bg-primary/15 text-foreground border-primary/30 shadow-lg animate-pulse' 
                                : 'bg-white/70 text-primary border-primary/30'
                            }`}>
                              {standing.points}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    participantStandings.map((standing, index) => {
                      const isChampion = index === 0;
                      const isPodium = index < 3;
                      const positionClass = isChampion 
                        ? "bg-gold/10 border-l-4 border-gold animate-scoreboard-glow" 
                        : index === 1 
                        ? "bg-silver/10 border-l-4 border-silver" 
                        : index === 2 
                        ? "bg-bronze/10 border-l-4 border-bronze" 
                        : "bg-white/60 hover:bg-white/70";
                      
                      return (
                        <tr
                          key={standing.participant.id}
                          className={`border-b border-slate-200 transition-all duration-300 ${positionClass}`}
                        >
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-xl ${isChampion ? 'animate-float' : ''}`}>
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
                              </span>
                              <span className={`font-black text-lg ${isPodium ? 'text-primary' : 'text-foreground'}`}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-black text-lg ${isChampion ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                              {standing.participant.name}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-foreground text-lg">{standing.played}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-primary text-lg">{standing.wins}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-muted text-lg">{standing.draws}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-black text-muted text-lg">{standing.losses}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-foreground text-lg">{standing.goalsFor}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-muted text-lg">{standing.goalsAgainst}</span>
                          </td>
                          <td className={`px-4 py-4 text-center font-black text-lg ${
                            standing.goalDiff > 0 ? 'text-primary' : standing.goalDiff < 0 ? 'text-muted' : 'text-muted'
                          }`}>
                            {standing.goalDiff >= 0 ? "+" : ""}{standing.goalDiff}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-black text-xl border-2 ${
                              isChampion 
                                ? 'bg-primary/15 text-foreground border-primary/30 shadow-lg animate-pulse' 
                                : 'bg-white/70 text-primary border-primary/30'
                            }`}>
                              {standing.points}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/t/${encodeSlug(tournament.slug)}/participants`}
            className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Users className="h-4 w-4 text-primary" />
            {t("participantsPage.title")}
          </Link>
          <Link
            href={`/t/${encodeSlug(tournament.slug)}/schedule`}
            className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            {t("participantsPage.schedule")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
