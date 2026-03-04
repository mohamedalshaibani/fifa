"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
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
  ArrowLeft,
  ArrowRight,
  Swords
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
  const isRTL = language === "ar";

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

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <Container className="py-6 sm:py-10">
      {/* Back link */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <BackArrow className="w-4 h-4" />
        <span>{t("player.backToHome")}</span>
      </Link>

      {/* Profile Header */}
      <SportCard padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted flex-shrink-0 border-4 border-primary/20">
            {player.profile.avatar_url ? (
              <Image
                src={player.profile.avatar_url}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {displayName}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{t("player.joinedOn")} {joinDate}</span>
            </div>

            {/* Quick Stats Row */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-primary" />
                <span className="font-semibold">{player.stats.matchesPlayed}</span>
                <span className="text-sm text-muted-foreground">{t("player.matches")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-success" />
                <span className="font-semibold">{player.stats.wins}</span>
                <span className="text-sm text-muted-foreground">{t("player.wins")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="font-semibold">{player.stats.winRate}%</span>
                <span className="text-sm text-muted-foreground">{t("player.winRate")}</span>
              </div>
            </div>
          </div>
        </div>
      </SportCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistics Card */}
        <SportCard padding="lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t("player.statistics")}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {player.stats.matchesPlayed}
              </div>
              <div className="text-sm text-muted-foreground">{t("player.matches")}</div>
            </div>
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {player.stats.wins}
              </div>
              <div className="text-sm text-muted-foreground">{t("player.wins")}</div>
            </div>
            <div className="bg-danger/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-danger">
                {player.stats.losses}
              </div>
              <div className="text-sm text-muted-foreground">{t("player.losses")}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {player.stats.draws}
              </div>
              <div className="text-sm text-muted-foreground">{t("player.draws")}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {player.stats.winRate}%
              </div>
              <div className="text-sm text-muted-foreground">{t("player.winRate")}</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {player.stats.goalsScored}
              </div>
              <div className="text-sm text-muted-foreground">{t("player.goalsScored")}</div>
            </div>
          </div>
        </SportCard>

        {/* Achievements Card */}
        <SportCard padding="lg">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            {t("player.achievements")}
          </h2>
          
          {player.placements.podiumFinishes > 0 ? (
            <div className="space-y-3">
              {player.placements.firstPlaceFinishes > 0 && (
                <div className="flex items-center gap-3 bg-warning/10 rounded-lg p-4">
                  <span className="text-3xl">🥇</span>
                  <div>
                    <div className="font-semibold text-foreground">
                      {t("player.firstPlace")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.placements.firstPlaceFinishes}x
                    </div>
                  </div>
                </div>
              )}
              {player.placements.secondPlaceFinishes > 0 && (
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                  <span className="text-3xl">🥈</span>
                  <div>
                    <div className="font-semibold text-foreground">
                      {t("player.secondPlace")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.placements.secondPlaceFinishes}x
                    </div>
                  </div>
                </div>
              )}
              {player.placements.thirdPlaceFinishes > 0 && (
                <div className="flex items-center gap-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg p-4">
                  <span className="text-3xl">🥉</span>
                  <div>
                    <div className="font-semibold text-foreground">
                      {t("player.thirdPlace")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.placements.thirdPlaceFinishes}x
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Medal className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">{t("player.noAchievements")}</p>
            </div>
          )}
        </SportCard>
      </div>

      {/* Tournament History */}
      <SportCard padding="lg" className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {t("player.tournamentHistory")}
        </h2>
        
        {player.tournaments.length > 0 ? (
          <div className="space-y-3">
            {player.tournaments.map((tournament) => (
              <Link
                key={tournament.tournamentId}
                href={`/t/${tournament.tournamentSlug}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">
                        {tournament.tournamentName}
                      </div>
                      {tournament.teamName && (
                        <div className="text-sm text-muted-foreground">
                          {tournament.teamName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-success">{tournament.wins}W</span>
                    <span className="text-muted-foreground">{tournament.draws}D</span>
                    <span className="text-danger">{tournament.losses}L</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">{t("player.noTournaments")}</p>
          </div>
        )}
      </SportCard>
    </Container>
  );
}
