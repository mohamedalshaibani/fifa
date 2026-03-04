"use client";

import Image from "next/image";
import { Trophy, Medal } from "lucide-react";
import Container from "@/components/Container";
import BackLink from "@/components/BackLink";
import StatusBadge from "@/components/StatusBadge";
import { encodeSlug } from "@/lib/slug";
import { Tournament } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface ChampionContentProps {
  tournament: Tournament;
  championName: string;
  championMembers: string[];
  isTeamBased: boolean;
}

export function ChampionContent({
  tournament,
  championName,
  championMembers,
  isTeamBased,
}: ChampionContentProps) {
  const { t } = useLanguage();

  const playersPerTeam = tournament.players_per_team ?? 1;

  return (
    <div className="min-h-screen bg-background">
      <Container>
        {/* Broadcast TV Champion Celebration */}
        <div className="relative min-h-[80vh] overflow-hidden bg-white/70 backdrop-blur-md border border-border shadow-[0_8px_30px_rgba(5,8,22,0.08)]">
          {/* Stadium Background */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/assets/fc/backgrounds/stadium-lights.svg"
              alt="Stadium celebration"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-transparent"></div>
          </div>
          
          {/* Light Beams */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent transform -skew-x-12 animate-beam-sweep"></div>
            <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent transform skew-x-12 animate-beam-sweep" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent animate-beam-sweep" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6">
            {/* Champion Badge */}
            <div className="live-indicator mb-8">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              {t("championPage.champion").toUpperCase()}
            </div>
            
            {/* Trophy Display */}
            <div className="relative mb-12">
              <div className="w-48 h-48 rounded-full bg-gradient-to-b from-primary/20 to-transparent backdrop-blur-sm flex items-center justify-center border-4 border-primary/30 shadow-2xl animate-float">
                <Trophy className="w-32 h-32 text-primary drop-shadow-2xl" />
              </div>
              
              {/* Floating Celebration Elements */}
              <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{animationDelay: '0.3s'}}>🏆</div>
              <div className="absolute -bottom-4 -left-4 text-5xl animate-bounce" style={{animationDelay: '0.6s'}}>👑</div>
              <div className="absolute -top-2 left-1/3 text-4xl animate-float" style={{animationDelay: '0.9s'}}>✨</div>
              <div className="absolute -right-2 top-1/2 text-3xl animate-float" style={{animationDelay: '1.2s'}}>⭐</div>
            </div>

            {/* Champion Announcement */}
            <div className="mb-10">
              <div className="text-accent font-black text-xl uppercase tracking-widest mb-4 animate-pulse">
                {t("championPage.title").toUpperCase()}
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-foreground mb-6 leading-none heading-tight animate-slide-in-up">
                {championName}
              </h1>
              
              {/* Team Members Display */}
              {isTeamBased && championMembers.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in">
                  {championMembers.map((member, idx) => (
                    <div key={idx} className="scoreboard inline-flex items-center gap-2 px-6 py-3">
                      <Medal className="h-5 w-5 text-primary" />
                      <span className="font-black text-foreground text-lg">{member}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournament Info Strip */}
            <div className="scoreboard max-w-3xl w-full">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2 heading-tight">{tournament.name}</h2>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status={tournament.status} />
                    <span className="bg-primary/15 text-primary px-4 py-1 rounded-full text-sm font-bold border border-primary/30">
                      {tournament.type === "league" ? t("championPage.league").toUpperCase() : t("championPage.knockout").toUpperCase()}
                    </span>
                    <span className="bg-surface-2 text-muted px-4 py-1 rounded-full text-sm font-bold">
                      {playersPerTeam === 2 ? t("championPage.teams").toUpperCase() : t("championPage.individual").toUpperCase()}
                    </span>
                  </div>
                </div>
                <Trophy className="w-16 h-16 text-primary opacity-40" />
              </div>
            </div>

            {/* Celebration Message */}
            <p className="text-xl text-muted mt-8 max-w-2xl leading-relaxed animate-fade-in">
              {t("championPage.congratulations")} 🎉
            </p>
          </div>
        </div>

        {/* Navigation Back */}
        <div className="text-center mt-8">
          <BackLink fallbackHref={`/t/${encodeSlug(tournament.slug)}`} />
        </div>
      </Container>
    </div>
  );
}
