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
    <form action={createTournament} className="space-y-5">
      {/* Step 1: Name and Date */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</div>
          <span className="text-sm font-bold text-foreground">معلومات البطولة</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold text-muted">
              اسم البطولة
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="مثال: كأس المجلس"
              required
              className="h-11 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="start_date" className="block text-xs font-semibold text-muted">
              تاريخ البدء
            </label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              className="text-left h-11 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Tournament Type (League/Knockout) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</div>
          <span className="text-sm font-bold text-foreground">نظام البطولة</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pr-8">
          {/* League Option */}
          <label className="relative cursor-pointer block">
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
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${tournamentType === "league" 
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
              }
            `}>
              {/* Selection indicator */}
              <div className={`
                absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${tournamentType === "league" 
                  ? "border-primary bg-primary" 
                  : "border-border bg-white"
                }
              `}>
                {tournamentType === "league" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-2xl">🏆</span>
                <span className={`text-base font-bold ${tournamentType === "league" ? "text-primary" : "text-foreground"}`}>
                  دوري
                </span>
                <span className="text-[11px] text-muted text-center leading-relaxed">
                  الكل يلعب مع الكل
                </span>
              </div>
            </div>
          </label>

          {/* Knockout Option */}
          <label className="relative cursor-pointer block">
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
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${tournamentType === "knockout" 
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
              }
            `}>
              {/* Selection indicator */}
              <div className={`
                absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${tournamentType === "knockout" 
                  ? "border-primary bg-primary" 
                  : "border-border bg-white"
                }
              `}>
                {tournamentType === "knockout" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-2xl">⚡</span>
                <span className={`text-base font-bold ${tournamentType === "knockout" ? "text-primary" : "text-foreground"}`}>
                  خروج مباشر
                </span>
                <span className="text-[11px] text-muted text-center leading-relaxed">
                  إقصائي - الخاسر يخرج
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Step 3: Tournament Format (1v1/2v2) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center">3</div>
          <span className="text-sm font-bold text-foreground">نوع المشاركة</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pr-8">
          {/* Individual (1v1) */}
          <label className="relative cursor-pointer block">
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
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${playersPerTeam === "1" 
                ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20" 
                : "border-border bg-white hover:border-secondary/30 hover:bg-secondary/5"
              }
            `}>
              {/* Selection indicator */}
              <div className={`
                absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${playersPerTeam === "1" 
                  ? "border-secondary bg-secondary" 
                  : "border-border bg-white"
                }
              `}>
                {playersPerTeam === "1" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col items-center gap-2 pt-1">
                <User className={`w-8 h-8 ${playersPerTeam === "1" ? "text-secondary" : "text-muted"}`} />
                <span className={`text-base font-bold ${playersPerTeam === "1" ? "text-secondary" : "text-foreground"}`}>
                  فردي
                </span>
                <span className={`text-sm font-black ${playersPerTeam === "1" ? "text-secondary" : "text-muted"}`}>
                  1 vs 1
                </span>
              </div>
            </div>
          </label>

          {/* Team (2v2) */}
          <label className="relative cursor-pointer block">
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
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${playersPerTeam === "2" 
                ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20" 
                : "border-border bg-white hover:border-secondary/30 hover:bg-secondary/5"
              }
            `}>
              {/* Selection indicator */}
              <div className={`
                absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${playersPerTeam === "2" 
                  ? "border-secondary bg-secondary" 
                  : "border-border bg-white"
                }
              `}>
                {playersPerTeam === "2" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col items-center gap-2 pt-1">
                <Users className={`w-8 h-8 ${playersPerTeam === "2" ? "text-secondary" : "text-muted"}`} />
                <span className={`text-base font-bold ${playersPerTeam === "2" ? "text-secondary" : "text-foreground"}`}>
                  فرق
                </span>
                <span className={`text-sm font-black ${playersPerTeam === "2" ? "text-secondary" : "text-muted"}`}>
                  2 vs 2
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Step 4: Team Formation Mode - Only shown for 2v2 */}
      {showFormationMode && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">4</div>
            <span className="text-sm font-bold text-foreground">طريقة تشكيل الفرق</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pr-8">
            {/* Preformed Teams */}
            <label className="relative cursor-pointer block">
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
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${teamFormationMode === "preformed" 
                  ? "border-accent bg-accent/10 shadow-lg shadow-accent/20" 
                  : "border-border bg-white hover:border-accent/30 hover:bg-accent/5"
                }
              `}>
                {/* Selection indicator */}
                <div className={`
                  absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${teamFormationMode === "preformed" 
                    ? "border-accent bg-accent" 
                    : "border-border bg-white"
                  }
                `}>
                  {teamFormationMode === "preformed" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                
                <div className="flex flex-col items-center gap-2 pt-1">
                  <UserCheck className={`w-8 h-8 ${teamFormationMode === "preformed" ? "text-accent" : "text-muted"}`} />
                  <span className={`text-base font-bold ${teamFormationMode === "preformed" ? "text-accent" : "text-foreground"}`}>
                    فرق جاهزة
                  </span>
                  <span className="text-[11px] text-muted text-center leading-relaxed">
                    الفريق يسجل معاً
                  </span>
                </div>
              </div>
            </label>

            {/* Random Draw */}
            <label className="relative cursor-pointer block">
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
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${teamFormationMode === "random_draw" 
                  ? "border-accent bg-accent/10 shadow-lg shadow-accent/20" 
                  : "border-border bg-white hover:border-accent/30 hover:bg-accent/5"
                }
              `}>
                {/* Selection indicator */}
                <div className={`
                  absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${teamFormationMode === "random_draw" 
                    ? "border-accent bg-accent" 
                    : "border-border bg-white"
                  }
                `}>
                  {teamFormationMode === "random_draw" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                
                <div className="flex flex-col items-center gap-2 pt-1">
                  <Shuffle className={`w-8 h-8 ${teamFormationMode === "random_draw" ? "text-accent" : "text-muted"}`} />
                  <span className={`text-base font-bold ${teamFormationMode === "random_draw" ? "text-accent" : "text-foreground"}`}>
                    قرعة عشوائية
                  </span>
                  <span className="text-[11px] text-muted text-center leading-relaxed">
                    تسجيل فردي ثم قرعة
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-3">
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-bold shadow-[0_4px_14px_rgba(0,92,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,92,255,0.4)] transition-all hover:scale-[1.01]"
        >
          <Trophy className="w-5 h-5" />
          إنشاء البطولة
        </Button>
      </div>
    </form>
  );
}
