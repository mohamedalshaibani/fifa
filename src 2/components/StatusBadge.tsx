"use client";

import { cn } from "@/lib/utils";
import { Users, Clock, Zap, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface StatusBadgeProps {
  status: string | null;
  className?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const { t } = useLanguage();
  
  if (!status) return null;

  const statusConfig: Record<string, { labelKey: string; className: string; icon: React.ReactNode }> = {
    // Tournament Statuses
    registration_open: {
      labelKey: "status.registrationOpen",
      className: "bg-primary/10 text-primary border border-primary/40 shadow-[0_0_12px_rgba(0,230,118,0.25)]",
      icon: <Users className="w-3 h-3" />,
    },
    registration_closed: {
      labelKey: "status.registrationClosed",
      className: "bg-surface text-muted border border-border",
      icon: <Clock className="w-3 h-3" />,
    },
    running: {
      labelKey: "status.inProgress",
      className: "bg-primary/10 text-primary border border-primary/40 shadow-[0_0_16px_rgba(0,230,118,0.35)]",
      icon: <Zap className="w-3 h-3" />,
    },
    finished: {
      labelKey: "status.completed",
      className: "bg-surface text-muted border border-border",
      icon: <Trophy className="w-3 h-3" />,
    },
    // Match Statuses
    scheduled: {
      labelKey: "status.scheduled",
      className: "bg-surface text-muted border border-border",
      icon: <Calendar className="w-3 h-3" />,
    },
    pending: {
      labelKey: "status.pending",
      className: "bg-surface text-muted border border-border",
      icon: <Clock className="w-3 h-3" />,
    },
    completed: {
      labelKey: "status.completed",
      className: "bg-primary/10 text-primary border border-primary/40",
      icon: <CheckCircle2 className="w-3 h-3" />,
    }
  };
  
  // Default fallback if status key missing
  const config = statusConfig[status];
  const label = config ? t(config.labelKey as keyof typeof t) : status;
  const configClass = config?.className || "bg-surface text-muted border-border";
  const icon = config?.icon || <Clock className="w-3 h-3" />;

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-bold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        configClass,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
