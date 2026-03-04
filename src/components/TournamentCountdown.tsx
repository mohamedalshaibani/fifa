"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
  const { t, language } = useLanguage();
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
        {t("countdown.tournamentEnded")}
      </span>
    );
  }

  // Tournament started - show match progress
  if (hasStarted || new Date(startDate) <= new Date()) {
    if (matchesCount === 0) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
          {t("countdown.matchesNotStarted")}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 text-accent px-3 py-1 text-xs font-bold">
        {completedMatches}/{matchesCount} {t("countdown.match")}
      </span>
    );
  }

  // Countdown active
  if (!timeLeft) {
    return null;
  }

  // Format countdown text based on language
  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = timeLeft;
    
    if (language === "ar") {
      // Arabic format: "تبقى X أيام و Y ساعات"
      if (days > 0) {
        let text = `${t("countdown.remaining")} ${days} ${days === 1 ? t("countdown.day") : t("countdown.days")}`;
        if (hours > 0) {
          text += ` ${t("countdown.and")} ${hours} ${hours === 1 ? t("countdown.hour") : t("countdown.hours")}`;
        }
        return text;
      } else if (hours > 0) {
        let text = `${t("countdown.remaining")} ${hours} ${hours === 1 ? t("countdown.hour") : t("countdown.hours")}`;
        if (minutes > 0) {
          text += ` ${t("countdown.and")} ${minutes} ${minutes === 1 ? t("countdown.minute") : t("countdown.minutes")}`;
        }
        return text;
      } else if (minutes > 0) {
        return `${t("countdown.remaining")} ${minutes} ${minutes === 1 ? t("countdown.minute") : t("countdown.minutes")}`;
      } else {
        return `${t("countdown.remaining")} ${seconds} ${seconds === 1 ? t("countdown.second") : t("countdown.seconds")}`;
      }
    } else {
      // English format: "X days, Y hours remaining"
      if (days > 0) {
        let text = `${days} ${days === 1 ? t("countdown.day") : t("countdown.days")}`;
        if (hours > 0) {
          text += `, ${hours} ${hours === 1 ? t("countdown.hour") : t("countdown.hours")}`;
        }
        return `${text} ${t("countdown.remaining")}`;
      } else if (hours > 0) {
        let text = `${hours} ${hours === 1 ? t("countdown.hour") : t("countdown.hours")}`;
        if (minutes > 0) {
          text += `, ${minutes} ${minutes === 1 ? t("countdown.minute") : t("countdown.minutes")}`;
        }
        return `${text} ${t("countdown.remaining")}`;
      } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? t("countdown.minute") : t("countdown.minutes")} ${t("countdown.remaining")}`;
      } else {
        return `${seconds} ${seconds === 1 ? t("countdown.second") : t("countdown.seconds")} ${t("countdown.remaining")}`;
      }
    }
  };

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
      <Clock className="w-3 h-3" />
      {formatCountdown()}
    </span>
  );
}
