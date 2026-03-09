"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SportCard from "@/components/ui/SportCard";
import { useLanguage } from "@/lib/i18n";
import { 
  Trophy, 
  User,
  Medal,
  TrendingUp,
  Target,
  Crown
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goalsScored: number;
  goalsConceded: number;
  tournamentsWon: number;
  podiumFinishes: number;
}

export default function LeaderboardContent() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800";
    if (rank === 2) return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700";
    if (rank === 3) return "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800";
    return "bg-white dark:bg-gray-900 border-border";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-warning" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("leaderboard.title")}
          </h1>
          <Crown className="w-8 h-8 text-warning" />
        </div>
        <p className="text-muted-foreground">
          {t("leaderboard.subtitle")}
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <SportCard padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Medal className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("leaderboard.noPlayers")}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {t("leaderboard.noPlayersDesc")}
            </p>
          </div>
        </SportCard>
      ) : (
        <>
          {/* Top 3 Podium - Desktop */}
          {leaderboard.length >= 3 && (
            <div className="hidden md:flex justify-center items-end gap-4 mb-8">
              {/* 2nd Place */}
              <Link href={`/player/${leaderboard[1].userId}`} className="flex flex-col items-center">
                <SportCard 
                  padding="lg" 
                  hoverable 
                  className={`w-48 text-center ${getRankBg(2)}`}
                >
                  <div className="mb-2">{getRankDisplay(2)}</div>
                  <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2 border-2 border-gray-300">
                    {leaderboard[1].avatarUrl ? (
                      <Image
                        src={leaderboard[1].avatarUrl}
                        alt={leaderboard[1].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-foreground truncate">
                    {leaderboard[1].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leaderboard[1].wins} {t("leaderboard.wins")}
                  </div>
                  <div className="text-xs text-success mt-1">
                    {leaderboard[1].winRate}% {t("leaderboard.winRate")}
                  </div>
                </SportCard>
                <div className="h-16 w-24 bg-gray-200 dark:bg-gray-700 rounded-t-lg mt-2" />
              </Link>

              {/* 1st Place */}
              <Link href={`/player/${leaderboard[0].userId}`} className="flex flex-col items-center">
                <SportCard 
                  padding="lg" 
                  hoverable 
                  className={`w-56 text-center ${getRankBg(1)}`}
                >
                  <div className="mb-2">{getRankDisplay(1)}</div>
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted mb-2 border-4 border-yellow-400">
                    {leaderboard[0].avatarUrl ? (
                      <Image
                        src={leaderboard[0].avatarUrl}
                        alt={leaderboard[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-lg text-foreground truncate">
                    {leaderboard[0].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leaderboard[0].wins} {t("leaderboard.wins")}
                  </div>
                  <div className="text-xs text-success mt-1">
                    {leaderboard[0].winRate}% {t("leaderboard.winRate")}
                  </div>
                  {leaderboard[0].tournamentsWon > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-warning">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs">{leaderboard[0].tournamentsWon}x {t("leaderboard.tournamentsWon")}</span>
                    </div>
                  )}
                </SportCard>
                <div className="h-24 w-28 bg-yellow-200 dark:bg-yellow-700 rounded-t-lg mt-2" />
              </Link>

              {/* 3rd Place */}
              <Link href={`/player/${leaderboard[2].userId}`} className="flex flex-col items-center">
                <SportCard 
                  padding="lg" 
                  hoverable 
                  className={`w-48 text-center ${getRankBg(3)}`}
                >
                  <div className="mb-2">{getRankDisplay(3)}</div>
                  <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2 border-2 border-orange-400">
                    {leaderboard[2].avatarUrl ? (
                      <Image
                        src={leaderboard[2].avatarUrl}
                        alt={leaderboard[2].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-foreground truncate">
                    {leaderboard[2].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {leaderboard[2].wins} {t("leaderboard.wins")}
                  </div>
                  <div className="text-xs text-success mt-1">
                    {leaderboard[2].winRate}% {t("leaderboard.winRate")}
                  </div>
                </SportCard>
                <div className="h-12 w-24 bg-orange-200 dark:bg-orange-700 rounded-t-lg mt-2" />
              </Link>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <SportCard padding="sm" className="overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[60px_1fr_80px_80px_80px_80px_100px] gap-4 p-4 bg-muted/50 border-b border-border font-semibold text-sm text-muted-foreground">
              <div>{t("leaderboard.rank")}</div>
              <div>{t("leaderboard.player")}</div>
              <div className="text-center">{t("leaderboard.wins")}</div>
              <div className="text-center">{t("leaderboard.matches")}</div>
              <div className="text-center">{t("leaderboard.winRate")}</div>
              <div className="text-center">{t("leaderboard.goals")}</div>
              <div className="text-center">
                <Trophy className="w-4 h-4 inline" />
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {leaderboard.map((entry) => (
                <Link
                  key={entry.userId}
                  href={`/player/${entry.userId}`}
                  className="block hover:bg-muted/50 transition-colors"
                >
                  {/* Desktop Row */}
                  <div className="hidden sm:grid sm:grid-cols-[60px_1fr_80px_80px_80px_80px_100px] gap-4 p-4 items-center">
                    <div className="flex justify-center">
                      {getRankDisplay(entry.rank)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {entry.avatarUrl ? (
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground truncate">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-center font-semibold text-success">
                      {entry.wins}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {entry.matchesPlayed}
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-accent" />
                        {entry.winRate}%
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <Target className="w-3 h-3 text-primary" />
                        {entry.goalsScored}
                      </span>
                    </div>
                    <div className="text-center">
                      {entry.tournamentsWon > 0 ? (
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Trophy className="w-4 h-4" />
                          {entry.tournamentsWon}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="sm:hidden p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 text-center">
                        {getRankDisplay(entry.rank)}
                      </div>
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {entry.avatarUrl ? (
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {entry.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="text-success">{entry.wins}W</span>
                          <span>{entry.matchesPlayed}M</span>
                          <span className="text-accent">{entry.winRate}%</span>
                          {entry.tournamentsWon > 0 && (
                            <span className="text-warning flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {entry.tournamentsWon}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SportCard>
        </>
      )}
    </div>
  );
}
