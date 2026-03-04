"use client";

import { Users, Zap, Target, Trophy, BarChart3, Settings } from "lucide-react";
import TournamentHero from "@/components/TournamentHero";
import StatsCard from "@/components/StatsCard";
import { Match, Participant, Tournament } from "@/lib/types";

interface DashboardClientProps {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
  canManageParticipants: boolean;
  showTypeChoice: boolean;
  canStart: boolean;
}

export default function DashboardClient({
  tournament,
  participants,
  matches,
  canManageParticipants,
  showTypeChoice,
}: DashboardClientProps) {
  const matchesCompleted = matches.filter((match) => match.status === "completed").length;

  const handleScrollToSection = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <TournamentHero tournament={tournament} />

      {/* STATS DASHBOARD GRID */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PARTICIPANTS CARD */}
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          title="المشاركون"
          stat={participants.length}
          subtitle={`${participants.length} ${participants.length === 1 ? "مشارك" : "مشارك"}`}
          action={
            canManageParticipants
              ? {
                  label: "إدارة المشاركين",
                  onClick: () => handleScrollToSection("participants-section"),
                }
              : undefined
          }
        >
          {participants.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {participants.slice(0, 5).map((participant) => (
                <div
                  key={participant.id}
                  className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-primary"
                  title={participant.name}
                >
                  {participant.name.charAt(0)}
                </div>
              ))}
              {participants.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-muted">
                  +{participants.length - 5}
                </div>
              )}
            </div>
          )}
        </StatsCard>

        {/* DRAW/MATCHES CARD */}
        <StatsCard
          icon={<Zap className="h-6 w-6" />}
          title="القرعة"
          stat={matches.length > 0 ? matches.length : "0"}
          subtitle={
            matches.length > 0 ? `${matches.length} مباراة` : "لم يتم التوليد بعد"
          }
          action={
            !matches.length && showTypeChoice
              ? {
                  label: "توليد الآن",
                  onClick: () => handleScrollToSection("draw-section"),
                }
              : undefined
          }
        />

        {/* RESULTS CARD */}
        <StatsCard
          icon={<Target className="h-6 w-6" />}
          title="النتائج"
          stat={`${matchesCompleted}/${matches.length}`}
          subtitle={`${matches.length === 0 ? 0 : Math.round((matchesCompleted / matches.length) * 100)}% مكتمل`}
        >
          {matches.length > 0 && (
            <div className="w-full bg-surface-2 border border-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{
                  width: `${matches.length === 0 ? 0 : (matchesCompleted / matches.length) * 100}%`,
                }}
              />
            </div>
          )}
        </StatsCard>

        {/* TOURNAMENT TYPE CARD */}
        {showTypeChoice && (
          <StatsCard
            icon={<Settings className="h-6 w-6" />}
            title="نوع البطولة"
            stat="اختر"
            subtitle="لم يتم الاختيار بعد"
            action={{
              label: "اختر النوع",
              onClick: () => handleScrollToSection("type-section"),
            }}
          />
        )}

        {/* STANDINGS/BRACKET PREVIEW CARD */}
        {tournament.type && matches.length > 0 && (
          <StatsCard
            icon={
              tournament.type === "league" ? (
                <BarChart3 className="h-6 w-6" />
              ) : (
                <Zap className="h-6 w-6" />
              )
            }
            title={tournament.type === "league" ? "الترتيب" : "الشجرة"}
            stat={tournament.type === "league" ? "دوري" : "خروج"}
            subtitle={`${Math.max(...matches.map((match) => match.round))} جولات`}
            action={{
              label: "عرض التفاصيل",
              onClick: () => handleScrollToSection("matches-section"),
              variant: "secondary",
            }}
          />
        )}

        {/* CHAMPION CARD */}
        {tournament.status === "finished" && (
          <StatsCard
            icon={<Trophy className="h-6 w-6" />}
            title="البطل"
            stat="🏆"
            subtitle="البطولة انتهت"
          >
            <p className="text-lg font-bold text-warning text-center">
              تهانينا!
            </p>
          </StatsCard>
        )}
      </div>
    </>
  );
}
