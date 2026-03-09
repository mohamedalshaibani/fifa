"use client";

import Link from "next/link";
import Container from "@/components/Container";
import SportBadge from "@/components/ui/SportBadge";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { Users, Trophy, Flame, Filter, CheckCircle, Zap, Award, Lock, BarChart3, Calendar } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  status: string;
  players_per_team: number;
  isUserRegistered: boolean;
  participantCount: number;
}

interface TournamentsListContentProps {
  activeTournaments: Tournament[];
  finishedTournaments: Tournament[];
  isLoggedIn: boolean;
}

// Reusable Tournament Card Component
interface TournamentCardProps {
  tournament: Tournament;
  t: (key: TranslationKey) => string;
}

function TournamentCard({ tournament, t }: TournamentCardProps) {
  const isRegistrationOpen = tournament.status === "registration_open";
  const isRunning = tournament.status === "running";

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { variant: "primary" | "warning" | "info" | "success" | "danger"; label: string }> = {
      running: { variant: "primary", label: `🔴 ${t("home.statusRunning")}` },
      registration_open: { variant: "warning", label: `🟡 ${t("home.statusRegOpen")}` },
      registration_closed: { variant: "info", label: `🟠 ${t("home.statusClosed")}` },
      pending: { variant: "info", label: `🟤 ${t("home.statusUpcoming")}` },
      finished: { variant: "danger", label: `🏁 ${t("home.statusFinished")}` }
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(tournament.status);

  return (
    <Link href={`/t/${tournament.slug}`} className="group">
      <SportCard
        padding="base"
        hoverable
        variant={isRunning ? "highlighted" : "default"}
        className={`h-full flex flex-col relative ${isRegistrationOpen ? "animate-attention-shake" : ""}`}
      >
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Top badges bar */}
          <div className="flex items-center justify-between gap-2">
            <SportBadge 
              variant={statusInfo.variant}
              icon={isRunning ? <Zap className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
            >
              {statusInfo.label}
            </SportBadge>
          </div>

          {/* Tournament Name */}
          <h3 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors break-words hyphens-auto leading-snug">
            {tournament.name}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Participants */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted">{t("home.participantsLabel")}</span>
                <span className="text-lg font-bold text-primary">{tournament.participantCount}</span>
              </div>
            </div>

            {/* Format */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <Trophy className="w-4 h-4 text-secondary flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted">{t("home.typeLabel")}</span>
                <span className="text-lg font-bold text-secondary">
                  {tournament.players_per_team === 1 ? "1v1" : `${tournament.players_per_team}v${tournament.players_per_team}`}
                </span>
              </div>
            </div>
          </div>

          {/* Tournament Type Badge */}
          <div className="flex items-center gap-2">
            <SportBadge variant="info" icon={tournament.type === "league" ? "🏆" : "⚡"}>
              {tournament.type === "league" ? t("tournament.league") : t("tournament.knockout")}
            </SportBadge>
          </div>

          {/* CTA Button */}
          <div className="pt-2 mt-auto">
            {tournament.status === "registration_closed" ? (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-muted/10 border border-muted/30 text-muted font-bold text-sm">
                <Lock className="w-4 h-4" />
                {t("tournament.registrationClosed")}
              </div>
            ) : tournament.isUserRegistered ? (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-500 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                {t("home.youAreRegistered")} ✅
              </div>
            ) : isRegistrationOpen ? (
              <SportButton variant="primary" size="sm" fullWidth className="font-bold">
                <Zap className="w-4 h-4" />
                {t("home.registerNow")}
              </SportButton>
            ) : isRunning ? (
              <SportButton variant="secondary" size="sm" fullWidth className="font-bold">
                <Flame className="w-4 h-4" />
                {t("home.watchNow")}
              </SportButton>
            ) : (
              <SportButton variant="ghost" size="sm" fullWidth className="font-bold">
                <Award className="w-4 h-4" />
                {t("home.viewDetails")}
              </SportButton>
            )}
          </div>
        </div>

        {/* Closing Soon Badge */}
        {isRegistrationOpen && tournament.participantCount >= 12 && (
          <div className="absolute top-2 end-2 z-20">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-danger text-white text-xs font-extrabold shadow-lg animate-pulse">
              🔥 {t("home.closingSoon")}
            </div>
          </div>
        )}
      </SportCard>
    </Link>
  );
}

export function TournamentsListContent({ activeTournaments, finishedTournaments }: TournamentsListContentProps) {
  const { t } = useLanguage();

  const hasTournaments = activeTournaments.length > 0 || finishedTournaments.length > 0;
  
  // Split active tournaments into running and upcoming
  const runningTournaments = activeTournaments.filter(t => t.status === "running");
  const upcomingTournaments = activeTournaments.filter(t => t.status !== "running");

  return (
    <Container>
      {/* Page Header */}
      <div className="py-12 md:py-16 lg:py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
            <Filter className="w-4 h-4 text-secondary" />
            <span className="text-sm font-extrabold text-secondary uppercase">{t("tournaments.allTournaments")}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-primary heading-tight">
            {t("tournaments.discoverLive")}
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t("tournaments.chooseAndCompete")}
          </p>
        </div>

        {!hasTournaments ? (
          /* Empty State */
          <div className="max-w-2xl mx-auto pb-12">
            <SportCard padding="lg" variant="elevated" className="text-center">
              <div className="space-y-4">
                <div className="text-6xl">⚽</div>
                <h3 className="text-xl font-extrabold text-foreground">
                  {t("home.noTournaments")}
                </h3>
                <p className="text-base text-muted">
                  {t("home.stayTuned")}
                </p>
              </div>
            </SportCard>
          </div>
        ) : (
          <div className="space-y-12 pb-16">
            {/* Running Tournaments Section */}
            {runningTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-accent/30">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-accent">{t("home.runningTournaments")}</h2>
                    <p className="text-sm text-muted">{t("home.runningTournamentsSubtitle")}</p>
                  </div>
                  <SportBadge variant="primary" className="text-sm font-bold">
                    {runningTournaments.length}
                  </SportBadge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {runningTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tournaments Section */}
            {upcomingTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-secondary/30">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-secondary">{t("home.upcomingTournaments")}</h2>
                    <p className="text-sm text-muted">{t("home.upcomingTournamentsSubtitle")}</p>
                  </div>
                  <SportBadge variant="warning" className="text-sm font-bold">
                    {upcomingTournaments.length}
                  </SportBadge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Finished Tournaments Section */}
            {finishedTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-muted/30">
                  <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-muted" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-muted">{t("home.finishedTournaments")}</h2>
                    <p className="text-sm text-muted">{t("home.finishedTournamentsSubtitle")}</p>
                  </div>
                  <SportBadge variant="info" className="text-sm font-bold">
                    {finishedTournaments.length}
                  </SportBadge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {finishedTournaments.map((tournament) => (
                    <Link
                      key={tournament.id}
                      href={`/t/${tournament.slug}`}
                      className="group"
                    >
                      <SportCard
                        padding="base"
                        hoverable
                        variant="default"
                        className="h-full flex flex-col"
                      >
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Finished Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <SportBadge variant="danger" icon={<CheckCircle className="w-3 h-3" />}>
                              🏁 {t("home.statusFinished")}
                            </SportBadge>
                            <SportBadge variant="info" icon={tournament.type === "league" ? "🏆" : "⚡"}>
                              {tournament.type === "league" ? t("tournament.league") : t("tournament.knockout")}
                            </SportBadge>
                          </div>

                          {/* Tournament Name */}
                          <h3 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors break-words hyphens-auto leading-snug">
                            {tournament.name}
                          </h3>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Participants */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                              <Users className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted">{t("home.participantsLabel")}</span>
                                <span className="text-lg font-bold text-primary">{tournament.participantCount}</span>
                              </div>
                            </div>

                            {/* Format */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
                              <Trophy className="w-4 h-4 text-secondary flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted">{t("home.typeLabel")}</span>
                                <span className="text-lg font-bold text-secondary">
                                  {tournament.players_per_team === 1 ? "1v1" : `${tournament.players_per_team}v${tournament.players_per_team}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-2 mt-auto">
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-sm">
                              <BarChart3 className="w-4 h-4" />
                              {t("home.viewResults")}
                            </div>
                          </div>
                        </div>
                      </SportCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
