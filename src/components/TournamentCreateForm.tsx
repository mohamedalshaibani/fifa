"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createTournament } from "@/app/admin/actions";
import { User, Users, Trophy, Calendar, Shuffle } from "lucide-react";

export default function TournamentCreateForm() {
  const [showFormationMode, setShowFormationMode] = useState(false);

  const handleFormatChange = (playersPerTeam: string) => {
    setShowFormationMode(playersPerTeam === "2");
  };

  return (
    <form action={createTournament} className="space-y-3">
      {/* Name and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-[9px] font-bold text-primary uppercase tracking-[0.22em]">
            اسم البطولة
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="مثال: كأس المجلس"
            required
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="start_date" className="text-[9px] font-bold text-primary uppercase tracking-[0.22em]">
            تاريخ البدء
          </label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="text-left h-8 text-xs"
          />
        </div>
      </div>
      
      {/* Tournament Type (League/Knockout) */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-primary uppercase tracking-[0.22em]">
          نوع البطولة
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <label className="relative cursor-pointer">
            <input
              type="radio"
              name="tournament_type"
              value="league"
              required
              className="peer sr-only"
            />
            <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
              <div className="text-center">
                <div className="text-xs font-bold text-foreground">🏆 دوري</div>
                <div className="text-[9px] text-muted mt-0.5">الكل يلعب مع الكل</div>
              </div>
            </div>
          </label>
          
          <label className="relative cursor-pointer">
            <input
              type="radio"
              name="tournament_type"
              value="knockout"
              required
              className="peer sr-only"
            />
            <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
              <div className="text-center">
                <div className="text-xs font-bold text-foreground">⚡ خروج مباشر</div>
                <div className="text-[9px] text-muted mt-0.5">إقصائي</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Tournament Format (1v1/2v2) and Formation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Tournament Format */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-primary uppercase tracking-[0.22em]">
            صيغة البطولة
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <label className="relative cursor-pointer">
              <input
                type="radio"
                name="players_per_team"
                value="1"
                required
                className="peer sr-only"
                onChange={() => handleFormatChange("1")}
              />
              <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-secondary peer-checked:bg-secondary/5 hover:border-secondary/50">
                <div className="text-center">
                  <div className="text-xs font-bold text-foreground">فردي</div>
                  <div className="text-[9px] font-semibold text-secondary mt-0.5">1v1</div>
                </div>
              </div>
            </label>
            
            <label className="relative cursor-pointer">
              <input
                type="radio"
                name="players_per_team"
                value="2"
                required
                className="peer sr-only"
                onChange={() => handleFormatChange("2")}
              />
              <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-secondary peer-checked:bg-secondary/5 hover:border-secondary/50">
                <div className="text-center">
                  <div className="text-xs font-bold text-foreground">فرق</div>
                  <div className="text-[9px] font-semibold text-secondary mt-0.5">2v2</div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Team Formation Mode - Only shown for 2v2 */}
        {showFormationMode && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-primary uppercase tracking-[0.22em]">
              طريقة التشكيل
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="team_formation_mode"
                  value="preformed"
                  required={showFormationMode}
                  className="peer sr-only"
                />
                <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-accent peer-checked:bg-accent/bg hover:border-accent/60">
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground">فرق جاهزة</div>
                    <div className="text-[9px] text-muted mt-0.5">تسجل معاً</div>
                  </div>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="team_formation_mode"
                  value="random_draw"
                  required={showFormationMode}
                  className="peer sr-only"
                />
                <div className="p-2 rounded-md border-2 border-border bg-white transition-all peer-checked:border-accent peer-checked:bg-accent/bg hover:border-accent/60">
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground">قرعة</div>
                    <div className="text-[9px] text-muted mt-0.5">تسجيل فردي</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div>
        <Button type="submit" className="w-full h-8 text-xs font-semibold shadow-[0_4px_12px_rgba(0,92,255,0.25)] hover:shadow-[0_6px_16px_rgba(0,92,255,0.32)]">
          <Trophy className="w-3 h-3" />
          إنشاء
        </Button>
      </div>
    </form>
  );
}
