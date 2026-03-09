"use client";

import Link from "next/link";
import SportButton from "@/components/ui/SportButton";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface HeaderButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: LucideIcon;
  children: ReactNode;
  fullWidth?: boolean;
}

// Header buttons are always size="sm" (36px height)
export default function HeaderButton({
  href,
  onClick,
  variant = "outline",
  icon: Icon,
  children,
  fullWidth = false,
}: HeaderButtonProps) {
  const button = (
    <SportButton 
      variant={variant} 
      size="sm" 
      icon={Icon} 
      fullWidth={fullWidth}
      onClick={href ? undefined : onClick}
    >
      {children}
    </SportButton>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} style={{ display: "inline-flex" }}>
        {button}
      </Link>
    );
  }

  return button;
}
