"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import BackLink from "@/components/BackLink";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import { useLanguage } from "@/lib/i18n";
import { 
  User, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  Medal,
  Swords,
  Flame,
  Star,
  ChevronRight
} from "lucide-react";

interface PlayerData {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    created_at: string;
  };
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    goalsScored: number;
    goalsConceded: number;
    yellowCards: number;
    redCards: number;
  };
  placements: {
    tournamentsParticipated: number;
    firstPlaceFinishes: number;
    secondPlaceFinishes: number;
    thirdPlaceFinishes: number;
    podiumFinishes: number;
  };
  tournaments: Array<{
    tournamentId: string;
    tournamentName: string;
    tournamentSlug: string;
    status: string;
    teamName: string | null;
    wins: number;
    draws: number;
    losses: number;
  }>;
}

export default function PlayerProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<PlayerData | null>(null);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/player/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setPlayer(data);
        }
      } catch (error) {
        console.error("Failed to fetch player:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">
            {t("common.loading")}
          </div>
        </div>
      </Container>
    );
  }

  if (!player) {
    return (
      <Container className="py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <User className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t("player.notFound")}</h1>
          <p className="text-muted-foreground">{t("player.notFoundDesc")}</p>
          <Link href="/">
            <SportButton variant="primary">
              {t("player.backToHome")}
            </SportButton>
          </Link>
        </div>
      </Container>
    );
  }

  const displayName = `${player.profile.first_name || ""} ${player.profile.last_name || ""}`.trim() || t("common.unknown");
  const joinDate = new Date(player.profile.created_at).toLocaleDateString(
    language === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const dir = language === "ar" ? "rtl" : "ltr";
  const goalDifference = player.stats.goalsScored - player.stats.goalsConceded;

  return (
    <Container className="py-6 sm:py-10">
      <div dir={dir}>
      {/* Back button */}
      <BackLink fallbackHref="/" />

      {/* Hero Profile Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
        </div>
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with Ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-md scale-110" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                {player.profile.avatar_url ? (
                  <Image
                    src={player.profile.avatar_url}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <User className="w-14 h-14 sm:w-18 sm:h-18 text-white/70" />
                  </div>
                )}
              </div>
              {/* Win Rate Badge */}
              {player.stats.winRate >= 50 && (
                <div className="absolute -bottom-1 -right-1 bg-warning text-warning-foreground rounded-full px-2.5 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {player.stats.winRate}%
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center sm:text-start text-white">
              <h1 className="text-2xl sm:text-4xl font-bold drop-shadow-lg">
                {displayName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{t("player.joinedOn")} {joinDate}</span>
              </div>

              {/* Hero Stats Row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-5">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black">{player.stats.matchesPlayed}</div>
                  <div className="text-xs uppercase tracking-wider text-white/70">{t("player.matches")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-green-300">{player.stats.wins}</div>
                  <div className="text-xs uppercase tracking-wider text-white/70">{t("player.wins")}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black">{player.placements.podiumFinishes}</div>
                  <div className="text-xs uppercase tracking-wider text-white/70">🏆 {t("player.achievements")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Stats Card */}
        <SportCard padding="lg" className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t("player.statistics")}
          </h2>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-muted/70 transition-colors">
              <Swords className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {player.stats.matchesPlayed}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("player.matches")}</div>
            </div>
            <div className="bg-success/10 rounded-xl p-4 text-center hover:bg-success/15 transition-colors">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl sm:text-3xl font-bold text-success">
                {player.stats.wins}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("player.wins")}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-muted/70 transition-colors">
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-muted-foreground text-lg">⚖️</div>
              <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                {player.stats.draws}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("player.draws")}</div>
            </div>
            <div className="bg-danger/10 rounded-xl p-4 text-center hover:bg-danger/15 transition-colors">
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-danger text-lg">✕</div>
              <div className="text-2xl sm:text-3xl font-bold text-danger">
                {player.stats.losses}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t("player.losses")}</div>
            </div>
          </div>

          {/* Goals & Performance Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{player.stats.goalsScored}</div>
              <div className="text-xs text-muted-foreground">{t("player.goalsScored")}</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{player.stats.goalsConceded}</div>
              <div className="text-xs text-muted-foreground">{t("player.goalsConceded")}</div>
            </div>
            <div className={`rounded-xl p-4 text-center ${goalDifference >= 0 ? "bg-success/10" : "bg-danger/10"}`}>
              <div className={`text-2xl font-bold ${goalDifference >= 0 ? "text-success" : "text-danger"}`}>
                {goalDifference >= 0 ? "+" : ""}{goalDifference}
              </div>
              <div className="text-xs text-muted-foreground">{t("player.goalDifference")}</div>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                {player.stats.winRate}%
                {player.stats.winRate >= 60 && <Star className="w-4 h-4 text-warning fill-warning" />}
              </div>
              <div className="text-xs text-muted-foreground">{t("player.winRate")}</div>
            </div>
          </div>

          {/* Cards Record - Always Show */}
          <div className="mt-5 pt-5 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              {t("player.cardsRecord")}
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-yellow-500/10 rounded-xl px-5 py-3 flex-1">
                <span className="text-2xl">🟨</span>
                <div>
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {player.stats.yellowCards}
                  </div>
                  <div className="text-xs text-muted-foreground">{t("player.yellowCards")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-500/10 rounded-xl px-5 py-3 flex-1">
                <span className="text-2xl">🟥</span>
                <div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {player.stats.redCards}
                  </div>
                  <div className="text-xs text-muted-foreground">{t("player.redCards")}</div>
                </div>
              </div>
            </div>
          </div>
        </SportCard>

        {/* Achievements Card */}
        <SportCard padding="lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            {t("player.achievements")}
          </h2>
          
          {/* Total Tournaments */}
          <div className="bg-primary/5 rounded-xl p-4 mb-4 text-center">
            <div className="text-3xl font-black text-primary">
              {player.placements.tournamentsParticipated}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("player.totalTournaments")}
            </div>
          </div>
          
          {/* Medals Display */}
          <div className="space-y-2">
            <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              player.placements.firstPlaceFinishes > 0 
                ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/10" 
                : "bg-muted/30 opacity-50"
            }`}>
              <span className="text-3xl">🥇</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{t("player.firstPlace")}</div>
              </div>
              <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                {player.placements.firstPlaceFinishes}
              </div>
            </div>
            
            <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              player.placements.secondPlaceFinishes > 0 
                ? "bg-gradient-to-r from-gray-300/20 to-gray-400/10 dark:from-gray-500/20 dark:to-gray-600/10" 
                : "bg-muted/30 opacity-50"
            }`}>
              <span className="text-3xl">🥈</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{t("player.secondPlace")}</div>
              </div>
              <div className="text-2xl font-black text-gray-500 dark:text-gray-300">
                {player.placements.secondPlaceFinishes}
              </div>
            </div>
            
            <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              player.placements.thirdPlaceFinishes > 0 
                ? "bg-gradient-to-r from-orange-400/20 to-orange-600/10" 
                : "bg-muted/30 opacity-50"
            }`}>
              <span className="text-3xl">🥉</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{t("player.thirdPlace")}</div>
              </div>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                {player.placements.thirdPlaceFinishes}
              </div>
            </div>
          </div>
          
          {player.placements.podiumFinishes === 0 && (
            <div className="mt-4 text-center py-4 text-muted-foreground text-sm">
              <Medal className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {t("player.noAchievements")}
            </div>
          )}
        </SportCard>
      </div>

      {/* Tournament History */}
      <SportCard padding="lg" className="mt-6">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {t("player.tournamentHistory")}
        </h2>
        
        {player.tournaments.length > 0 ? (
          <div className="space-y-3">
            {player.tournaments.map((tournament) => {
              const totalMatches = tournament.wins + tournament.draws + tournament.losses;
              const winRateInTournament = totalMatches > 0 
                ? Math.round((tournament.wins / totalMatches) * 100) 
                : 0;
              
              return (
                <Link
                  key={tournament.tournamentId}
                  href={`/t/${tournament.tournamentSlug}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-all group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tournament.status === "finished" 
                          ? "bg-muted" 
                          : tournament.status === "running"
                          ? "bg-success/10"
                          : "bg-primary/10"
                      }`}>
                        <Trophy className={`w-6 h-6 ${
                          tournament.status === "finished" 
                            ? "text-muted-foreground" 
                            : tournament.status === "running"
                            ? "text-success"
                            : "text-primary"
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground truncate">
                          {tournament.tournamentName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {tournament.teamName && (
                            <span className="text-muted-foreground truncate max-w-[150px]">
                              {tournament.teamName}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            tournament.status === "finished" 
                              ? "bg-muted text-muted-foreground" 
                              : tournament.status === "running"
                              ? "bg-success/10 text-success"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {tournament.status === "finished" 
                              ? t("tournament.finished")
                              : tournament.status === "running"
                              ? t("tournament.running")
                              : t("tournament.pending")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Mini Stats */}
                      <div className="hidden sm:flex items-center gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-success">{tournament.wins}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">W</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-muted-foreground">{tournament.draws}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">D</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-danger">{tournament.losses}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">L</div>
                        </div>
                        {totalMatches > 0 && (
                          <div className={`text-center px-2 py-1 rounded-lg ${
                            winRateInTournament >= 50 ? "bg-success/10" : "bg-muted"
                          }`}>
                            <div className={`font-bold text-sm ${
                              winRateInTournament >= 50 ? "text-success" : "text-muted-foreground"
                            }`}>{winRateInTournament}%</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Stats */}
                      <div className="flex sm:hidden items-center gap-2 text-xs">
                        <span className="text-success font-semibold">{tournament.wins}W</span>
                        <span className="text-muted-foreground">{tournament.draws}D</span>
                        <span className="text-danger font-semibold">{tournament.losses}L</span>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors rtl:rotate-180" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">{t("player.noTournaments")}</p>
          </div>
        )}
      </SportCard>
      </div>
    </Container>
  );
}
