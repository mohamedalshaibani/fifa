import { cn } from "@/lib/utils";
import { Users, Clock, Zap, Trophy, Calendar, CheckCircle2 } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  // Tournament Statuses
  registration_open: {
    label: "التسجيل مفتوح",
    className: "bg-primary/10 text-primary border border-primary/40 shadow-[0_0_12px_rgba(0,230,118,0.25)]",
    icon: <Users className="w-3 h-3" />,
  },
  registration_closed: {
    label: "التسجيل مغلق",
    className: "bg-surface text-muted border border-border",
    icon: <Clock className="w-3 h-3" />,
  },
  running: {
    label: "جارية الآن",
    className: "bg-primary/10 text-primary border border-primary/40 shadow-[0_0_16px_rgba(0,230,118,0.35)]",
    icon: <Zap className="w-3 h-3" />,
  },
  finished: {
    label: "منتهية",
    className: "bg-surface text-muted border border-border",
    icon: <Trophy className="w-3 h-3" />,
  },
  // Match Statuses
  scheduled: {
    label: "مجدولة",
    className: "bg-surface text-muted border border-border",
    icon: <Calendar className="w-3 h-3" />,
  },
  pending: {
    label: "قيد الانتظار",
    className: "bg-surface text-muted border border-border",
    icon: <Clock className="w-3 h-3" />,
  },
  completed: {
    label: "منتهية",
    className: "bg-primary/10 text-primary border border-primary/40",
    icon: <CheckCircle2 className="w-3 h-3" />,
  }
};

interface StatusBadgeProps {
  status: string | null;
  className?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  if (!status) return null;
  
  // Default fallback if status key missing
  const config = statusConfig[status] || { 
    label: status, 
    className: "bg-surface text-muted border-border",
    icon: <Clock className="w-3 h-3" />
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-bold transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
