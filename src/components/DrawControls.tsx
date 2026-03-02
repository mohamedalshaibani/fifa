"use client";

import { useMemo, useState } from "react";
import { Shuffle, CalendarDays, CheckCircle2, RotateCcw } from "lucide-react";
import { Participant, Pairing } from "@/lib/types";
import { generateKnockoutRoundOne, generateLeagueSchedule, shuffle } from "@/lib/tournament-utils";

type PreviewPairing = {
  homeParticipantId: string;
  awayParticipantId: string | null;
};

type PreviewMatch = {
  round: number;
  homeParticipantId: string | null;
  awayParticipantId: string | null;
};

type DrawControlsProps = {
  tournamentId: string;
  tournamentType: "league" | "knockout" | null;
  participants: Participant[];
  pairings: Pairing[];
  matchesCount: number;
  onSavePairings: (formData: FormData) => void;
  onSaveSchedule: (formData: FormData) => void;
  onResetDraw: (formData: FormData) => void;
};

export default function DrawControls({
  tournamentId,
  tournamentType,
  participants,
  pairings,
  matchesCount,
  onSavePairings,
  onSaveSchedule,
  onResetDraw,
}: DrawControlsProps) {
  const [pairingsPreview, setPairingsPreview] = useState<PreviewPairing[]>([]);
  const [schedulePreview, setSchedulePreview] = useState<PreviewMatch[]>([]);

  const nameMap = useMemo(() => {
    return new Map(participants.map((p) => [p.id, p.name]));
  }, [participants]);

  const canGeneratePairings = participants.length > 1 && pairings.length === 0;
  const canGenerateSchedule = participants.length > 1 && matchesCount === 0 && Boolean(tournamentType);

  const handleGeneratePairings = () => {
    const shuffled = shuffle(participants);
    const preview: PreviewPairing[] = [];
    const queue = [...shuffled];
    while (queue.length > 1) {
      const home = queue.shift();
      const away = queue.shift();
      if (!home) break;
      preview.push({
        homeParticipantId: home.id,
        awayParticipantId: away?.id ?? null,
      });
    }
    if (queue.length === 1) {
      const home = queue.shift();
      if (home) {
        preview.push({ homeParticipantId: home.id, awayParticipantId: null });
      }
    }
    setPairingsPreview(preview);
  };

  const handleGenerateSchedule = () => {
    if (!tournamentType) return;
    let orderedParticipants = participants;

    if (pairings.length > 0) {
      const orderedIds: string[] = [];
      pairings.forEach((pair) => {
        orderedIds.push(pair.home_participant_id);
        if (pair.away_participant_id) orderedIds.push(pair.away_participant_id);
      });
      const uniqueIds = Array.from(new Set(orderedIds));
      const ordered = uniqueIds
        .map((id) => participants.find((p) => p.id === id))
        .filter(Boolean) as Participant[];
      const remaining = participants.filter((p) => !uniqueIds.includes(p.id));
      orderedParticipants = [...ordered, ...remaining];
    } else {
      orderedParticipants = shuffle(participants);
    }

    const schedule =
      tournamentType === "league"
        ? generateLeagueSchedule(orderedParticipants)
        : generateKnockoutRoundOne(orderedParticipants);

    const preview = schedule.map((match) => ({
      round: match.round,
      homeParticipantId: match.homeParticipantId,
      awayParticipantId: match.awayParticipantId,
    }));

    setSchedulePreview(preview);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGeneratePairings}
          disabled={!canGeneratePairings}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition ${
            canGeneratePairings
              ? "button-primary"
              : "button-secondary opacity-60 cursor-not-allowed"
          }`}
        >
          <Shuffle className="h-4 w-4" />
          قرعة تشكيل المواجهات
        </button>

        <button
          type="button"
          onClick={handleGenerateSchedule}
          disabled={!canGenerateSchedule}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition ${
            canGenerateSchedule
              ? "button-primary"
              : "button-secondary opacity-60 cursor-not-allowed"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          قرعة إعداد جدول المباريات
        </button>

        {(pairings.length > 0 || matchesCount > 0) && (
          <form action={onResetDraw}>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 button-secondary px-5 py-2.5 text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة ضبط القرعة
            </button>
          </form>
        )}
      </div>

      {pairingsPreview.length > 0 && (
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">معاينة المواجهات</h3>
            <form action={onSavePairings}>
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <input
                type="hidden"
                name="pairings"
                value={JSON.stringify(pairingsPreview)}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 button-primary px-4 py-2 text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4" />
                حفظ المواجهات
              </button>
            </form>
          </div>
          <ul className="space-y-2 text-sm text-secondary">
            {pairingsPreview.map((pairing, index) => (
              <li
                key={`${pairing.homeParticipantId}-${pairing.awayParticipantId}-${index}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3"
              >
                <span>{nameMap.get(pairing.homeParticipantId) ?? "-"}</span>
                <span className="text-muted">vs</span>
                <span>{pairing.awayParticipantId ? nameMap.get(pairing.awayParticipantId) : "BYE"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {schedulePreview.length > 0 && (
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">معاينة الجدول</h3>
            <form action={onSaveSchedule}>
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <input
                type="hidden"
                name="schedule"
                value={JSON.stringify(schedulePreview)}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 button-primary px-4 py-2 text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4" />
                حفظ الجدول
              </button>
            </form>
          </div>
          <ul className="space-y-2 text-sm text-secondary">
            {schedulePreview.map((match, index) => (
              <li
                key={`${match.round}-${match.homeParticipantId}-${match.awayParticipantId}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3"
              >
                <span className="text-xs text-muted">جولة {match.round}</span>
                <span>{match.homeParticipantId ? nameMap.get(match.homeParticipantId) : "-"}</span>
                <span className="text-muted">vs</span>
                <span>{match.awayParticipantId ? nameMap.get(match.awayParticipantId) : "BYE"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
