"use client";

import { ReactNode } from "react";

type StatsCardProps = {
  icon: ReactNode;
  title: string;
  stat: string | number;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  children?: ReactNode;
};

export default function StatsCard({
  icon,
  title,
  stat,
  subtitle,
  action,
  children,
}: StatsCardProps) {
  return (
    <div className="card p-6 border border-border/70 shadow-md bg-white/90 backdrop-blur-md animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/40 shadow-sm">
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted uppercase">
              {title}
            </p>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl sm:text-4xl font-black text-foreground leading-none">{stat}</p>
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}

      {action && (
        <button
          onClick={action.onClick}
          className={`mt-5 w-full px-5 py-2.5 text-sm font-semibold ${
            action.variant === "secondary"
              ? "button-secondary"
              : "button-primary"
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
