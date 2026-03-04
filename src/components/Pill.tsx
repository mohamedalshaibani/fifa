import React from "react";

interface PillProps {
  variant: "solid-green" | "solid-blue" | "outline";
  children: React.ReactNode;
  className?: string;
}

export default function Pill({
  variant,
  children,
  className = "",
}: PillProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";

  const mobileStyles = "text-sm px-4 py-1.5 h-10";
  const desktopStyles = "md:text-base md:px-5 md:py-2 md:h-11";

  const variantStyles = {
    "solid-green":
      "bg-[#22c55e] text-white shadow-lg hover:shadow-xl hover:bg-[#16a34a]",
    "solid-blue":
      "bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white shadow-[0_8px_24px_rgba(14,165,233,0.35)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.5)]",
    outline:
      "bg-transparent border-2 border-slate-900/25 text-slate-900 hover:bg-slate-900/5",
  };

  return (
    <div
      className={`${baseStyles} ${mobileStyles} ${desktopStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
