import React from "react";

interface BallButtonProps {
  variant: "solid" | "outline" | "filled-blue" | "filled-green";
  children: React.ReactNode;
  className?: string;
}

export default function BallButton({
  variant,
  children,
  className = "",
}: BallButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-semibold text-sm h-9 px-6 py-2 transition-all w-[150px]";

  const variantStyles = {
    solid:
      "bg-gradient-to-r from-[#0284c7] to-[#0891b2] text-white shadow-[0_6px_20px_rgba(2,132,199,0.4)] hover:shadow-[0_10px_28px_rgba(2,132,199,0.55)]",
    outline:
      "bg-[rgba(6,182,212,0.12)] border-2 border-[#0891b2]/35 text-[#111827] hover:bg-[rgba(6,182,212,0.16)] hover:border-[#0891b2]/45",
    "filled-blue":
      "bg-[#0284c7] text-white shadow-[0_6px_20px_rgba(2,132,199,0.4)] hover:bg-[#0272b5] hover:shadow-[0_10px_28px_rgba(2,132,199,0.55)]",
    "filled-green":
      "bg-[#16a34a] text-white shadow-lg hover:bg-[#15803d]",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
