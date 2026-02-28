"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TournamentCountdownProps {
  startDate: string;
  matchesCount: number;
  completedMatches: number;
  tournamentStatus: string;
}

export default function TournamentCountdown({
  startDate,
  matchesCount,
  completedMatches,
  tournamentStatus,
}: TournamentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(startDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setHasStarted(true);
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial === null) {
      setHasStarted(true);
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === null) {
        setHasStarted(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  // Tournament finished
  if (tournamentStatus === "finished") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-gray-400/40 bg-gray-100/80 text-gray-700 px-3 py-1 text-xs font-bold">
        انتهت البطولة
      </span>
    );
  }

  // Tournament started - show match progress
  if (hasStarted || new Date(startDate) <= new Date()) {
    if (matchesCount === 0) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
          لم تبدأ المباريات
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/bg text-accent px-3 py-1 text-xs font-bold">
        {completedMatches}/{matchesCount} مباراة
      </span>
    );
  }

  // Countdown active
  if (!timeLeft) {
    return null;
  }

  // Format countdown text
  let countdownText = "";
  if (timeLeft.days > 0) {
    countdownText = `تبقى ${timeLeft.days} ${timeLeft.days === 1 ? "يوم" : "أيام"}`;
    if (timeLeft.hours > 0) {
      countdownText += ` و ${timeLeft.hours} ${timeLeft.hours === 1 ? "ساعة" : "ساعات"}`;
    }
  } else if (timeLeft.hours > 0) {
    countdownText = `تبقى ${timeLeft.hours} ${timeLeft.hours === 1 ? "ساعة" : "ساعات"}`;
    if (timeLeft.minutes > 0) {
      countdownText += ` و ${timeLeft.minutes} ${timeLeft.minutes === 1 ? "دقيقة" : "دقائق"}`;
    }
  } else if (timeLeft.minutes > 0) {
    countdownText = `تبقى ${timeLeft.minutes} ${timeLeft.minutes === 1 ? "دقيقة" : "دقائق"}`;
  } else {
    countdownText = `تبقى ${timeLeft.seconds} ${timeLeft.seconds === 1 ? "ثانية" : "ثواني"}`;
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
      <Clock className="w-3 h-3" />
      {countdownText}
    </span>
  );
}
