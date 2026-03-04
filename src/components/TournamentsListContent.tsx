"use client";

import Link from "next/link";
import Container from "@/components/Container";
import SportBadge from "@/components/ui/SportBadge";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import { useLanguage } from "@/lib/i18n";
import { Users, Trophy, Flame, Filter, CheckCircle, Zap, Award } from "lucide-react";

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
  tournaments: Tournament[];
  isLoggedIn: boolean;
}

export function TournamentsListContent({ tournaments, isLoggedIn }: TournamentsListContentProps) {
  const { t } = useLanguage();

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { variant: "primary" | "warning" | "info" | "success"; label: string; icon: string }> = {
      running: { variant: "primary", label: `🔴 ${t("home.statusRunning")}`, icon: "🔥" },
      registration_open: { variant: "warning", label: `🟡 ${t("home.statusRegOpen")}`, icon: "⚡" },
      registration_closed: { variant: "info", label: `🟠 ${t("home.statusClosed")}`, icon: "🔒" },
      pending: { variant: "info", label: `🟤 ${t("home.statusUpcoming")}`, icon: "📅" },
      finished: { variant: "info", label: `⚪ ${t("home.statusFinished")}`, icon: "✅" }
    };
    return statusMap[status] || statusMap.pending;
  };

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

        {tournaments.length === 0 ? (
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
          /* Tournaments Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-16">
            {tournaments.map((tournament) => {
              const statusInfo = getStatusInfo(tournament.status);
              const isRegistrationOpen = tournament.status === "registration_open";
              const isRunning = tournament.status === "running";

              return (
                <Link
                  key={tournament.id}
                  href={`/t/${tournament.slug}`}
                  className="group"
                >
                  <SportCard
                    padding="base"
                    hoverable
                    variant={isRunning ? "highlighted" : "default"}
                    className={`h-full flex flex-col relative ${isRegistrationOpen ? "animate-attention-shake" : ""}`}
                  >
                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Header with Title and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-extrabold text-foreground flex-1 group-hover:text-primary transition-colors">
                          {tournament.name}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <SportBadge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </SportBadge>

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
                        {tournament.isUserRegistered ? (
                          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-500 font-bold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            {t("home.youAreRegistered")} ✅
                          </div>
                        ) : isRegistrationOpen ? (
                          <SportButton variant="primary" size="sm" className="w-full font-bold">
                            <Zap className="w-4 h-4" />
                            {t("home.registerNow")}
                          </SportButton>
                        ) : isRunning ? (
                          <SportButton variant="secondary" size="sm" className="w-full font-bold">
                            <Flame className="w-4 h-4" />
                            {t("home.watchNow")}
                          </SportButton>
                        ) : (
                          <SportButton variant="ghost" size="sm" className="w-full font-bold">
                            <Award className="w-4 h-4" />
                            {t("home.viewDetails")}
                          </SportButton>
                        )}
                      </div>
                    </div>

                    {/* Closing Soon Badge */}
                    {isRegistrationOpen && tournament.participantCount >= 12 && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-danger text-white text-xs font-extrabold shadow-lg animate-pulse">
                          🔥 {t("home.closingSoon")}
                        </div>
                      </div>
                    )}
                  </SportCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
