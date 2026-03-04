import React from "react";

interface BallBadgeProps {
  variant: "success";
  children: React.ReactNode;
  className?: string;
}

export default function BallBadge({
  variant,
  children,
  className = "",
}: BallBadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold text-sm h-9 px-6 py-2 transition-all w-[150px]";

  const variantStyles = {
    success: "bg-[#16a34a] text-white shadow-lg",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
