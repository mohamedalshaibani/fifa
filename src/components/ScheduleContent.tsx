"use client";

import Link from "next/link";
import { CalendarDays, Users, BarChart3, GitBranch } from "lucide-react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { groupMatchesByRound } from "@/lib/tournament-utils";
import { encodeSlug } from "@/lib/slug";
import { Match, Tournament } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface ScheduleContentProps {
  tournament: Tournament;
  matches: Match[];
  nameMap: Map<string, string>;
  teamNameMap: Map<string, string | null>;
  teamMembersMap: Map<string, string[]>;
  isTeamBased: boolean;
}

export function ScheduleContent({
  tournament,
  matches,
  nameMap,
  teamNameMap,
  teamMembersMap,
  isTeamBased,
}: ScheduleContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <PageHeader
          title={t("schedule.title")}
          icon={<CalendarDays className="h-6 w-6 text-primary" />}
          backHref={`/t/${encodeSlug(tournament.slug)}`}
          badge={<StatusBadge status={tournament.status} />}
        />

        <Card>
          {matches.length === 0 ? (
            <p className="text-sm text-muted">{t("schedule.noMatchesYet")}</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupMatchesByRound(matches))
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundMatches]) => (
                  <div key={round}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                        {t("schedule.round")} {round}
                      </h2>
                      <span className="text-xs text-muted">
                        {roundMatches.length} {t("schedule.match")}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {roundMatches.map((match) => {
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
                            {/* Mobile Layout (stacked) */}
                            <div className="flex flex-col sm:hidden">
                              {/* Home Team - Mobile */}
                              <div className="p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-md flex-shrink-0">
                                  <span className="text-sm font-black text-primary">{homeName.charAt(0)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-base text-foreground break-words leading-snug">{homeName}</h3>
                                  {isTeamBased && homeMembers.length > 0 && (
                                    <p className="text-xs text-secondary mt-0.5 break-words">{homeMembers.join(' • ')}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Score - Mobile (centered) */}
                              <div className="py-3 px-4 bg-surface/90 border-y-2 border-border/60 flex items-center justify-center gap-4">
                                {match.home_score !== null && match.away_score !== null ? (
                                  <div className="text-3xl font-black text-primary font-mono tracking-wider">
                                    {match.home_score} : {match.away_score}
                                  </div>
                                ) : (
                                  <div className="text-xl font-black text-muted">VS</div>
                                )}
                                <StatusBadge status={match.status} size="sm" />
                              </div>
                              
                              {/* Away Team - Mobile */}
                              <div className="p-3 bg-gradient-to-r from-accent/5 to-transparent flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-accent">{awayName.charAt(0)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-base text-foreground break-words leading-snug">{awayName}</h3>
                                  {isTeamBased && awayMembers.length > 0 && (
                                    <p className="text-xs text-muted mt-0.5 break-words">{awayMembers.join(' • ')}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Desktop Layout (horizontal) */}
                            <div className="hidden sm:flex relative items-stretch">
                              {/* Home Team */}
                              <div className="flex-1 p-4 md:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-right flex flex-col justify-center group-hover:from-primary/15 transition-all duration-300 min-w-0">
                                <div className="flex items-center justify-end gap-2 md:gap-3 mb-1 md:mb-2">
                                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-xs md:text-sm font-black text-primary">{homeName.charAt(0)}</span>
                                  </div>
                                </div>
                                <h3 className="font-black text-base md:text-xl text-foreground break-words hyphens-auto leading-tight">{homeName}</h3>
                                {isTeamBased && homeMembers.length > 0 && (
                                  <p className="text-xs md:text-sm text-secondary mt-1 md:mt-2 leading-relaxed font-medium break-words">{homeMembers.join(' • ')}</p>
                                )}
                              </div>
                              
                              {/* Scoreboard */}
                              <div className="w-24 md:min-w-[140px] lg:min-w-[160px] bg-surface/90 backdrop-blur-md border-x-2 border-border/60 flex flex-col justify-center items-center p-3 md:p-6 relative flex-shrink-0">
                                {match.home_score !== null && match.away_score !== null && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse"></div>
                                )}
                                <div className="relative z-10 text-center">
                                  {match.home_score !== null && match.away_score !== null ? (
                                    <div className="text-2xl md:text-4xl lg:text-5xl font-black text-primary font-mono tracking-wider mb-1 md:mb-2">
                                      {match.home_score} : {match.away_score}
                                    </div>
                                  ) : (
                                    <div className="text-lg md:text-2xl font-black text-muted mb-1 md:mb-2">VS</div>
                                  )}
                                  <StatusBadge status={match.status} size="sm" />
                                </div>
                              </div>
                              
                              {/* Away Team */}
                              <div className="flex-1 p-4 md:p-6 bg-gradient-to-l from-accent/5 to-transparent text-left flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs md:text-sm font-bold text-accent">{awayName.charAt(0)}</span>
                                  </div>
                                </div>
                                <h3 className="font-black text-base md:text-lg text-foreground break-words hyphens-auto leading-tight">{awayName}</h3>
                                {isTeamBased && awayMembers.length > 0 && (
                                  <p className="text-xs text-muted mt-1 leading-tight break-words">{awayMembers.join(' • ')}</p>
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
            {t("schedule.participants")}
          </Link>
          {tournament.type === "league" && (
            <Link
              href={`/t/${encodeSlug(tournament.slug)}/standings`}
              className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              {t("schedule.standings")}
            </Link>
          )}
          {tournament.type === "knockout" && (
            <Link
              href={`/t/${encodeSlug(tournament.slug)}/bracket`}
              className="button-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4 text-primary" />
              {t("schedule.bracket")}
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
