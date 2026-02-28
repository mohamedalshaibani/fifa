"use client";

import Image from "next/image";
import { Trophy, Users, CheckCircle2 } from "lucide-react";
import { Tournament } from "@/lib/types";

type TournamentHeroProps = {
  tournament: Tournament;
  onActionClick?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "registration_open":
      return "التسجيل مفتوح";
    case "registration_closed":
      return "التسجيل مغلق";
    case "running":
      return "البطولة جارية";
    case "finished":
      return "انتهت";
    default:
      return "قيد الانتظار";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "registration_open":
      return "bg-accent/bg text-accent border border-accent/40";
    case "running":
      return "bg-accent/bg text-accent border border-accent/60 shadow-[0_0_18px_rgba(0,230,118,0.45)]";
    case "finished":
      return "bg-surface-2 text-muted border border-border";
    default:
      return "bg-surface-2 text-muted border border-border";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "registration_open":
      return <Users className="w-4 h-4" />;
    case "running":
      return <Trophy className="w-4 h-4" />;
    case "finished":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Trophy className="w-4 h-4" />;
  }
};

export default function TournamentHero({
  tournament,
  onActionClick,
  actionLabel,
  actionDisabled,
}: TournamentHeroProps) {
  const statusLabel = getStatusLabel(tournament.status);
  const statusBadgeClass = getStatusColor(tournament.status);
  const StatusIcon = getStatusIcon(tournament.status);
  const createdDate = new Date(tournament.created_at).toLocaleDateString("ar-SA");

  return (
    <section className="relative overflow-hidden bg-background border-b-4 border-primary">
      {/* Stadium Background as subtle overlay */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/assets/fc/backgrounds/stadium-lights.svg"
          alt="Stadium background"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Broadcast Header */}
          <div className="broadcast-header rounded-2xl mb-8 justify-between">
            <div className="flex items-center gap-3">
              <span className="live-indicator mr-2">LIVE</span>
              <span className="text-xs font-bold tracking-[0.25em] text-muted uppercase">
                {tournament.type === "league" ? "LEAGUE TOURNAMENT" : "KNOCKOUT TOURNAMENT"}
              </span>
            </div>
            <div className="text-xs font-semibold text-muted">
              {createdDate}
            </div>
          </div>

          {/* Main Tournament Info */}
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left: Tournament Details */}
            <div className="lg:col-span-2 text-right">
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight heading-tight">
                {tournament.name}
              </h1>

              <div className="flex items-center gap-4 mb-6 justify-end">
                <div className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-2 ${statusBadgeClass}`}>
                  {StatusIcon}
                  {statusLabel}
                </div>

                <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-black tracking-[0.25em] uppercase">
                  {tournament.players_per_team === 2 ? "TEAMS" : "INDIVIDUAL"}
                </div>
              </div>

              <p className="text-base md:text-lg text-muted mb-8 leading-relaxed max-w-2xl ml-auto">
                {tournament.type === "league" 
                  ? "بطولة دوري - كل فريق يلعب ضد الجميع"
                  : "بطولة خروج المغلوب - مباراة واحدة تحدد المصير"
                }
              </p>

              {onActionClick && actionLabel && (
                <button
                  onClick={onActionClick}
                  disabled={actionDisabled}
                  className="btn btn-primary text-sm md:text-base px-8 py-4 mt-2"
                >
                  <Trophy className="w-5 h-5" />
                  {actionLabel}
                </button>
              )}
            </div>

            {/* Right: Visual Element */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative scoreboard animate-scoreboard-glow">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl flex items-center justify-center border-2 border-primary/40 bg-gradient-to-b from-primary/5 via-background to-accent/bg">
                  <Trophy className="w-20 h-20 md:w-24 md:h-24 text-primary animate-float" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Ticker */}
      <div className="ticker-strip">
        <div className="relative h-10 flex items-center">
          <div className="absolute right-0 bg-primary text-primary-foreground px-3 py-1 font-black text-[0.65rem] sm:text-xs z-10 tracking-[0.25em] uppercase">
            STATS
          </div>
          <div className="ticker-content flex items-center gap-6 animate-ticker-scroll text-[0.65rem] sm:text-xs font-bold ml-20 text-muted">
            <span>• {tournament.type === "league" ? "دوري" : "خروج مباشر"}</span>
            <span>• {tournament.players_per_team === 2 ? "فرق" : "فردي"}</span>
            <span>• {statusLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
