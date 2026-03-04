"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createTournament } from "@/app/admin/actions";
import { Trophy, Check, Users, User, Shuffle, UserCheck } from "lucide-react";

export default function TournamentCreateForm() {
  const [tournamentType, setTournamentType] = useState<string | null>(null);
  const [playersPerTeam, setPlayersPerTeam] = useState<string | null>(null);
  const [teamFormationMode, setTeamFormationMode] = useState<string | null>(null);

  const showFormationMode = playersPerTeam === "2";

  return (
    <form action={createTournament} className="space-y-4">
      {/* Row 1: Name and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-[10px] font-bold text-primary uppercase tracking-wider">
            اسم البطولة
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="مثال: كأس المجلس"
            required
            className="h-10 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="start_date" className="block text-[10px] font-bold text-primary uppercase tracking-wider">
            تاريخ البدء
          </label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="text-left h-10 text-sm"
          />
        </div>
      </div>

      {/* Row 2: Tournament Type - Compact inline */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-primary uppercase tracking-wider">
          نظام البطولة
        </label>
        <div className="flex gap-2">
          {/* League */}
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="tournament_type"
              value="league"
              required
              className="sr-only"
              checked={tournamentType === "league"}
              onChange={() => setTournamentType("league")}
            />
            <div className={`
              relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
              ${tournamentType === "league" 
                ? "bg-primary/10 text-primary border-primary shadow-[0_4px_12px_rgba(0,92,255,0.25)]" 
                : "bg-white text-foreground border-foreground/80 hover:border-foreground"
              }
            `}>
              {tournamentType === "league" && (
                <Check className="w-4 h-4 text-primary" strokeWidth={3} />
              )}
              <span>🏆</span>
              <span>دوري</span>
            </div>
          </label>

          {/* Knockout */}
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="tournament_type"
              value="knockout"
              required
              className="sr-only"
              checked={tournamentType === "knockout"}
              onChange={() => setTournamentType("knockout")}
            />
            <div className={`
              relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
              ${tournamentType === "knockout" 
                ? "bg-primary/10 text-primary border-primary shadow-[0_4px_12px_rgba(0,92,255,0.25)]" 
                : "bg-white text-foreground border-foreground/80 hover:border-foreground"
              }
            `}>
              {tournamentType === "knockout" && (
                <Check className="w-4 h-4 text-primary" strokeWidth={3} />
              )}
              <span>⚡</span>
              <span>خروج مباشر</span>
            </div>
          </label>
        </div>
      </div>

      {/* Row 3: Players per Team - Compact inline */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider">
          نوع المشاركة
        </label>
        <div className="flex gap-2">
          {/* Individual 1v1 */}
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="players_per_team"
              value="1"
              required
              className="sr-only"
              checked={playersPerTeam === "1"}
              onChange={() => {
                setPlayersPerTeam("1");
                setTeamFormationMode(null);
              }}
            />
            <div className={`
              relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
              ${playersPerTeam === "1" 
                ? "bg-secondary/10 text-secondary border-secondary shadow-[0_4px_12px_rgba(255,138,0,0.25)]" 
                : "bg-white text-foreground border-foreground/80 hover:border-foreground"
              }
            `}>
              {playersPerTeam === "1" && (
                <Check className="w-4 h-4 text-secondary" strokeWidth={3} />
              )}
              <User className="w-4 h-4" />
              <span>فردي</span>
              <span className="text-xs opacity-80">1v1</span>
            </div>
          </label>

          {/* Team 2v2 */}
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="players_per_team"
              value="2"
              required
              className="sr-only"
              checked={playersPerTeam === "2"}
              onChange={() => setPlayersPerTeam("2")}
            />
            <div className={`
              relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
              ${playersPerTeam === "2" 
                ? "bg-secondary/10 text-secondary border-secondary shadow-[0_4px_12px_rgba(255,138,0,0.25)]" 
                : "bg-white text-foreground border-foreground/80 hover:border-foreground"
              }
            `}>
              {playersPerTeam === "2" && (
                <Check className="w-4 h-4 text-secondary" strokeWidth={3} />
              )}
              <Users className="w-4 h-4" />
              <span>فرق</span>
              <span className="text-xs opacity-80">2v2</span>
            </div>
          </label>
        </div>
      </div>

      {/* Row 4: Team Formation Mode - Only shown for 2v2 */}
      {showFormationMode && (
        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <label className="block text-[10px] font-bold text-accent uppercase tracking-wider">
            طريقة تشكيل الفرق
          </label>
          <div className="flex gap-2">
            {/* Preformed */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="team_formation_mode"
                value="preformed"
                required={showFormationMode}
                className="sr-only"
                checked={teamFormationMode === "preformed"}
                onChange={() => setTeamFormationMode("preformed")}
              />
              <div className={`
                relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
                ${teamFormationMode === "preformed" 
                  ? "bg-accent/10 text-accent border-accent shadow-[0_4px_12px_rgba(0,230,118,0.25)]" 
                  : "bg-white text-foreground border-foreground/80 hover:border-foreground"
                }
              `}>
                {teamFormationMode === "preformed" && (
                  <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                )}
                <UserCheck className="w-4 h-4" />
                <span>فرق جاهزة</span>
              </div>
            </label>

            {/* Random Draw */}
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="team_formation_mode"
                value="random_draw"
                required={showFormationMode}
                className="sr-only"
                checked={teamFormationMode === "random_draw"}
                onChange={() => setTeamFormationMode("random_draw")}
              />
              <div className={`
                relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-sm transition-all duration-150
                ${teamFormationMode === "random_draw" 
                  ? "bg-accent/10 text-accent border-accent shadow-[0_4px_12px_rgba(0,230,118,0.25)]" 
                  : "bg-white text-foreground border-foreground/80 hover:border-foreground"
                }
              `}>
                {teamFormationMode === "random_draw" && (
                  <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                )}
                <Shuffle className="w-4 h-4" />
                <span>قرعة عشوائية</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full h-11 text-sm font-bold shadow-[0_4px_14px_rgba(0,92,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,92,255,0.4)] transition-all"
        >
          <Trophy className="w-4 h-4" />
          إنشاء البطولة
        </Button>
      </div>
    </form>
  );
}
