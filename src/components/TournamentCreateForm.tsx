"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createTournament } from "@/app/admin/actions";
import { Trophy } from "lucide-react";

export default function TournamentCreateForm() {
  const [showFormationMode, setShowFormationMode] = useState(false);

  const handleFormatChange = (playersPerTeam: string) => {
    setShowFormationMode(playersPerTeam === "2");
  };

  return (
    <form action={createTournament} className="space-y-4">
      {/* Name and Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
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

        <div className="space-y-1.5">
          <label htmlFor="start_date" className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
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
      
      {/* Tournament Type (League/Knockout) */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
          نوع البطولة
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative cursor-pointer group">
            <input
              type="radio"
              name="tournament_type"
              value="league"
              required
              className="peer sr-only"
            />
            <div className="p-3 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-sm peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-[0_0_0_1px_rgba(0,92,255,0.2),0_4px_12px_rgba(0,92,255,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-bold text-foreground peer-checked:text-primary">دوري</span>
                <span className="text-[10px] text-muted leading-tight">الكل يلعب مع الكل</span>
              </div>
            </div>
            {/* Selection checkmark */}
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-border bg-white transition-all duration-200 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
              <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </label>
          
          <label className="relative cursor-pointer group">
            <input
              type="radio"
              name="tournament_type"
              value="knockout"
              required
              className="peer sr-only"
            />
            <div className="p-3 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-sm peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-[0_0_0_1px_rgba(0,92,255,0.2),0_4px_12px_rgba(0,92,255,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">⚡</span>
                <span className="text-sm font-bold text-foreground peer-checked:text-primary">خروج مباشر</span>
                <span className="text-[10px] text-muted leading-tight">إقصائي</span>
              </div>
            </div>
            {/* Selection checkmark */}
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-border bg-white transition-all duration-200 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
              <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </label>
        </div>
      </div>

      {/* Tournament Format (1v1/2v2) and Formation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tournament Format */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
            صيغة البطولة
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="relative cursor-pointer group">
              <input
                type="radio"
                name="players_per_team"
                value="1"
                required
                className="peer sr-only"
                onChange={() => handleFormatChange("1")}
              />
              <div className="p-2.5 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-secondary/40 group-hover:bg-secondary/5 group-hover:shadow-sm peer-checked:border-secondary peer-checked:bg-secondary/10 peer-checked:shadow-[0_0_0_1px_rgba(255,138,0,0.2),0_4px_12px_rgba(255,138,0,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/50 peer-focus-visible:ring-offset-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold text-foreground">فردي</span>
                  <span className="text-xs font-bold text-secondary">1v1</span>
                </div>
              </div>
            </label>
            
            <label className="relative cursor-pointer group">
              <input
                type="radio"
                name="players_per_team"
                value="2"
                required
                className="peer sr-only"
                onChange={() => handleFormatChange("2")}
              />
              <div className="p-2.5 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-secondary/40 group-hover:bg-secondary/5 group-hover:shadow-sm peer-checked:border-secondary peer-checked:bg-secondary/10 peer-checked:shadow-[0_0_0_1px_rgba(255,138,0,0.2),0_4px_12px_rgba(255,138,0,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-secondary/50 peer-focus-visible:ring-offset-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-bold text-foreground">فرق</span>
                  <span className="text-xs font-bold text-secondary">2v2</span>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Team Formation Mode - Only shown for 2v2 */}
        {showFormationMode && (
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
              طريقة التشكيل
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="team_formation_mode"
                  value="preformed"
                  required={showFormationMode}
                  className="peer sr-only"
                />
                <div className="p-2.5 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-accent/40 group-hover:bg-accent/5 group-hover:shadow-sm peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:shadow-[0_0_0_1px_rgba(0,230,118,0.2),0_4px_12px_rgba(0,230,118,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold text-foreground">فرق جاهزة</span>
                    <span className="text-[10px] text-muted">تسجل معاً</span>
                  </div>
                </div>
              </label>
              
              <label className="relative cursor-pointer group">
                <input
                  type="radio"
                  name="team_formation_mode"
                  value="random_draw"
                  required={showFormationMode}
                  className="peer sr-only"
                />
                <div className="p-2.5 rounded-lg border-2 bg-white border-border transition-all duration-200 ease-out group-hover:border-accent/40 group-hover:bg-accent/5 group-hover:shadow-sm peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:shadow-[0_0_0_1px_rgba(0,230,118,0.2),0_4px_12px_rgba(0,230,118,0.15)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold text-foreground">قرعة</span>
                    <span className="text-[10px] text-muted">تسجيل فردي</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full h-10 text-sm font-bold shadow-[0_4px_14px_rgba(0,92,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,92,255,0.4)] transition-shadow"
        >
          <Trophy className="w-4 h-4" />
          إنشاء البطولة
        </Button>
      </div>
    </form>
  );
}
