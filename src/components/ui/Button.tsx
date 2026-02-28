"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import SportButton from "./SportButton";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: LucideIcon | ReactNode;
  fullWidth?: boolean;
}

// Wrapper component for backward compatibility
// Maps old size prop values to SportButton sizes
export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  isLoading = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  // Map size: md -> base
  const sizeMap: Record<string, "sm" | "base" | "lg"> = {
    sm: "sm",
    md: "base",
    lg: "lg",
  };

  return (
    <SportButton
      variant={variant}
      size={sizeMap[size] || "base"}
      icon={typeof icon === "function" ? (icon as LucideIcon) : undefined}
      isLoading={isLoading}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </SportButton>
  );
}
