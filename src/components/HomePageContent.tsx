"use client";

import Link from "next/link";
import Container from "@/components/Container";
import SportButton from "@/components/ui/SportButton";
import SportCard from "@/components/ui/SportCard";
import SportBadge from "@/components/ui/SportBadge";
import { useLanguage, TranslationKey } from "@/lib/i18n";
import { Tournament } from "@/lib/types";
import { Users, Trophy, Flame, Target, Award, Zap, CheckCircle, Calendar, BarChart3, Swords, TrendingUp, Minus, X as XIcon, CircleDot, Medal, Crown, Star, Lock } from "lucide-react";

interface TournamentData {
  tournament: Tournament;
  participantCount: number;
  matches: { status: string; home_score: number | null; away_score: number | null }[];
  isUserRegistered: boolean;
}

interface UserStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalsScored: number;
}

interface PlacementStats {
  tournamentsParticipated: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  thirdPlaceFinishes: number;
  finalAppearances: number;
  podiumFinishes: number;
}

// Tournament Card Component for reuse
interface TournamentCardProps {
  tournament: Tournament;
  participantCount: number;
  isUserRegistered: boolean;
  t: (key: TranslationKey) => string;
}

function TournamentCard({ tournament, participantCount, isUserRegistered, t }: TournamentCardProps) {
  const isRegistrationOpen = tournament.status === "registration_open";
  const isRunning = tournament.status === "running";

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
              variant={isRunning ? "primary" : isRegistrationOpen ? "warning" : "info"}
              icon={isRunning ? <Zap className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
            >
              {tournament.status === "running" ? `🔴 ${t("home.statusRunning")}` : 
               tournament.status === "registration_open" ? `🟡 ${t("home.statusRegOpen")}` : 
               tournament.status === "registration_closed" ? `🟠 ${t("home.statusClosed")}` : `🟤 ${t("home.statusUpcoming")}`}
            </SportBadge>
          </div>

          {/* Tournament Name */}
          <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
            {tournament.name}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Participants */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted">{t("home.participantsLabel")}</span>
                <span className="text-lg font-bold text-primary">{participantCount}</span>
              </div>
            </div>

            {/* Format */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <Trophy className="w-4 h-4 text-secondary flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted">{t("home.typeLabel")}</span>
                <span className="text-lg font-bold text-secondary">
                  {tournament.players_per_team === 1 ? "1v1" : "2v2"}
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
            ) : isUserRegistered ? (
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
        {isRegistrationOpen && participantCount >= 12 && (
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

interface HomePageContentProps {
  currentUser: { id: string; firstName?: string; email?: string } | null;
  activeTournaments: TournamentData[];
  finishedTournaments: TournamentData[];
  userStats: UserStats | null;
  placementStats: PlacementStats | null;
}

export function HomePageContent({
  currentUser,
  activeTournaments,
  finishedTournaments,
  userStats,
  placementStats,
}: HomePageContentProps) {
  const { t } = useLanguage();
  
  const hasTournaments = activeTournaments.length > 0 || finishedTournaments.length > 0;
  const hasPlayedMatches = userStats && userStats.matchesPlayed > 0;
  const hasPlacementStats = placementStats && placementStats.tournamentsParticipated > 0;

  return (
    <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24 pb-12">
      <Container className="relative z-10">
        {/* Personalized Greeting for Logged-in Users */}
        {currentUser ? (
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
              {t("home.welcomeUser")} {currentUser.firstName} 👋
            </h1>
            <p className="text-base md:text-lg text-muted max-w-2xl mx-auto font-medium">
              {t("home.readyForTournaments")} 🔥
            </p>
          </div>
        ) : (
          /* Default Hero for Non-Logged-in Users */
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight heading-tight">
              <div>{t("home.heroTitle1")}</div>
              <div className="mt-4 text-secondary">
                {t("home.heroTitle2")}
              </div>
            </h1>
            
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-medium">
              {t("home.heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/tournaments">
                <SportButton variant="primary" size="lg" className="group">
                  <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {t("home.browseTournaments")}
                </SportButton>
              </Link>
            </div>
          </div>
        )}

        {/* User Stats Section (Only for logged-in users) */}
        {currentUser && (
          <div className="mb-12">
            {hasPlayedMatches && (
              /* Section Title */
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t("home.myStats")}</h2>
                  <p className="text-sm text-muted">{t("home.statsSubtitle")}</p>
                </div>
              </div>
            )}
            {hasPlayedMatches && userStats ? (
              /* Stats Cards */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {/* Matches Played */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
                      <Swords className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-2xl font-black text-foreground">{userStats.matchesPlayed}</span>
                    <span className="text-xs text-muted font-medium">{t("home.matches")}</span>
                  </div>
                </SportCard>

                {/* Wins */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-2xl font-black text-green-500">{userStats.wins}</span>
                    <span className="text-xs text-muted font-medium">{t("home.wins")}</span>
                  </div>
                </SportCard>

                {/* Draws */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center mb-1">
                      <Minus className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-2xl font-black text-yellow-600">{userStats.draws}</span>
                    <span className="text-xs text-muted font-medium">{t("home.draws")}</span>
                  </div>
                </SportCard>

                {/* Losses */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-1">
                      <XIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-2xl font-black text-red-500">{userStats.losses}</span>
                    <span className="text-xs text-muted font-medium">{t("home.losses")}</span>
                  </div>
                </SportCard>

                {/* Win Rate */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-2xl font-black text-primary">{userStats.winRate}%</span>
                    <span className="text-xs text-muted font-medium">{t("home.winRate")}</span>
                  </div>
                </SportCard>

                {/* Goals */}
                <SportCard padding="sm" variant="default" className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center mb-1">
                      <CircleDot className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-2xl font-black text-secondary">{userStats.goalsScored}</span>
                    <span className="text-xs text-muted font-medium">{t("home.goals")}</span>
                  </div>
                </SportCard>
              </div>
            ) : currentUser ? (
              /* No Matches Yet */
              <SportCard padding="base" variant="default" className="text-center mb-8">
                <div className="py-4 space-y-3">
                  <div className="text-4xl">⚽</div>
                  <p className="text-foreground font-bold">{t("home.noMatchesYet")}</p>
                  <p className="text-sm text-muted">{t("home.participateToSeeStats")}</p>
                </div>
              </SportCard>
            ) : null}

            {/* Tournament Placement Stats Section */}
            {hasPlacementStats && placementStats && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t("home.tournamentActivity")}</h2>
                    <p className="text-sm text-muted">{t("home.activitySubtitle")}</p>
                  </div>
                </div>
                
                {/* Placement Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Total Tournaments */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-1">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-2xl font-black text-foreground">{placementStats.tournamentsParticipated}</span>
                      <span className="text-xs text-muted font-medium">{t("home.tournamentsCount")}</span>
                    </div>
                  </SportCard>

                  {/* 1st Place */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center mb-1">
                        <Crown className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-2xl font-black text-yellow-500">{placementStats.firstPlaceFinishes}</span>
                      <span className="text-xs text-muted font-medium">{t("home.firstPlace")}</span>
                    </div>
                  </SportCard>

                  {/* 2nd Place */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-400/15 flex items-center justify-center mb-1">
                        <Medal className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-2xl font-black text-slate-400">{placementStats.secondPlaceFinishes}</span>
                      <span className="text-xs text-muted font-medium">{t("home.secondPlace")}</span>
                    </div>
                  </SportCard>

                  {/* 3rd Place */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-700/15 flex items-center justify-center mb-1">
                        <Medal className="w-5 h-5 text-amber-700" />
                      </div>
                      <span className="text-2xl font-black text-amber-700">{placementStats.thirdPlaceFinishes}</span>
                      <span className="text-xs text-muted font-medium">{t("home.thirdPlace")}</span>
                    </div>
                  </SportCard>

                  {/* Final Appearances */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center mb-1">
                        <Star className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-2xl font-black text-secondary">{placementStats.finalAppearances}</span>
                      <span className="text-xs text-muted font-medium">{t("home.reachedFinals")}</span>
                    </div>
                  </SportCard>

                  {/* Podium Finishes */}
                  <SportCard padding="sm" variant="default" className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-1">
                        <Award className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-2xl font-black text-green-500">{placementStats.podiumFinishes}</span>
                      <span className="text-xs text-muted font-medium">{t("home.crownedPlatform")}</span>
                    </div>
                  </SportCard>
                </div>
              </div>
            )}

          </div>
        )}

        {/* No Tournaments at all */}
        {!hasTournaments && (
          <div className="max-w-2xl mx-auto pb-12">
            <SportCard padding="lg" variant="elevated" className="text-center">
              <div className="space-y-4">
                <div className="text-6xl">⚽</div>
                <h3 className="text-xl font-extrabold text-foreground">
                  {t("home.noTournaments")}
                </h3>
                <p className="text-base text-muted">
                  {t("home.comingSoon")}
                </p>
              </div>
            </SportCard>
          </div>
        )}

        {/* Tournaments Sections - Grouped by Status */}
        {hasTournaments && (
          <div className="space-y-12 pb-16">
            {/* Running Tournaments Section */}
            {(() => {
              const runningTournaments = activeTournaments.filter(
                ({ tournament }) => tournament.status === "running"
              );
              
              return runningTournaments.length > 0 ? (
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
                    {runningTournaments.map(({ tournament, participantCount, isUserRegistered }) => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        participantCount={participantCount}
                        isUserRegistered={isUserRegistered}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Upcoming Tournaments Section */}
            {(() => {
              const upcomingTournaments = activeTournaments.filter(
                ({ tournament }) => tournament.status !== "running"
              );
              
              return upcomingTournaments.length > 0 ? (
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
                    {upcomingTournaments.map(({ tournament, participantCount, isUserRegistered }) => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        participantCount={participantCount}
                        isUserRegistered={isUserRegistered}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

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
                  {finishedTournaments.map(({ tournament, participantCount, matches }) => {
                    const completedMatches = matches.filter((m) => m.status === "completed").length;
                    const totalGoals = matches.reduce((sum, m) => {
                      return sum + (m.home_score ?? 0) + (m.away_score ?? 0);
                    }, 0);

                    return (
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
                            <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {tournament.name}
                            </h3>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2">
                              {/* Participants */}
                              <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                <Users className="w-4 h-4 text-muted mb-1" />
                                <span className="text-sm font-bold text-foreground">{participantCount}</span>
                                <span className="text-xs text-muted">{t("home.playerLabel")}</span>
                              </div>

                              {/* Matches */}
                              <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                <Calendar className="w-4 h-4 text-muted mb-1" />
                                <span className="text-sm font-bold text-foreground">{completedMatches}</span>
                                <span className="text-xs text-muted">{t("home.matchLabel")}</span>
                              </div>

                              {/* Goals */}
                              <div className="flex flex-col items-center px-2 py-2 rounded-lg bg-surface-2 border border-border">
                                <Target className="w-4 h-4 text-muted mb-1" />
                                <span className="text-sm font-bold text-foreground">{totalGoals}</span>
                                <span className="text-xs text-muted">{t("home.goalLabel")}</span>
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View All Link */}
        {hasTournaments && (
          <div className="text-center pb-12">
            <Link href="/tournaments">
              <SportButton variant="secondary" size="lg" className="font-bold">
                <Trophy className="w-5 h-5" />
                {t("home.browseAllTournaments")}
              </SportButton>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
