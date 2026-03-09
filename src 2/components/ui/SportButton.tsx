"use client";

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "outline";
  size?: "sm" | "base" | "lg";
  icon?: LucideIcon;
  children?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

/*
 * BUTTON SPECIFICATIONS (Fixed, Cross-Browser)
 * =============================================
 * 
 * Heights:
 *   sm:   36px
 *   base: 40px
 *   lg:   48px
 * 
 * Padding (horizontal):
 *   sm:   16px (px-4)
 *   base: 20px (px-5)
 *   lg:   28px (px-7)
 * 
 * Font:
 *   sm:   14px / font-bold
 *   base: 15px / font-bold
 *   lg:   16px / font-bold
 * 
 * Border Radius: 12px (all sizes)
 * 
 * Icon Size:
 *   sm:   16px
 *   base: 18px
 *   lg:   20px
 */

const SportButton = React.forwardRef<HTMLButtonElement, SportButtonProps>(
  (
    {
      variant = "primary",
      size = "base",
      icon: Icon,
      children,
      isLoading = false,
      fullWidth = false,
      className = "",
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    // Fixed size specifications
    const sizeSpec = {
      sm:   { height: 36, paddingX: 16, fontSize: 14, iconSize: 16, gap: 6 },
      base: { height: 40, paddingX: 20, fontSize: 15, iconSize: 18, gap: 8 },
      lg:   { height: 48, paddingX: 28, fontSize: 16, iconSize: 20, gap: 10 },
    };

    const spec = sizeSpec[size];

    // Variant colors
    const variantSpec = {
      primary: {
        background: "linear-gradient(135deg, #005CFF 0%, #3385FF 100%)",
        color: "#FFFFFF",
        border: "none",
        borderBottom: "2px solid #00E676",
        boxShadow: "0 4px 14px rgba(0, 92, 255, 0.35)",
        hoverBoxShadow: "0 6px 20px rgba(0, 92, 255, 0.45)",
      },
      secondary: {
        background: "#FF8A00",
        color: "#FFFFFF",
        border: "none",
        borderBottom: "none",
        boxShadow: "0 4px 14px rgba(255, 138, 0, 0.35)",
        hoverBoxShadow: "0 6px 20px rgba(255, 138, 0, 0.45)",
      },
      success: {
        background: "#00E676",
        color: "#050816",
        border: "none",
        borderBottom: "none",
        boxShadow: "0 4px 14px rgba(0, 230, 118, 0.35)",
        hoverBoxShadow: "0 6px 20px rgba(0, 230, 118, 0.45)",
      },
      danger: {
        background: "#FF3B4E",
        color: "#FFFFFF",
        border: "none",
        borderBottom: "none",
        boxShadow: "0 4px 14px rgba(255, 59, 78, 0.35)",
        hoverBoxShadow: "0 6px 20px rgba(255, 59, 78, 0.45)",
      },
      outline: {
        background: "#FFFFFF",
        color: "#005CFF",
        border: "1px solid rgba(0, 92, 255, 0.3)",
        borderBottom: "none",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        hoverBoxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      ghost: {
        background: "transparent",
        color: "#050816",
        border: "none",
        borderBottom: "none",
        boxShadow: "none",
        hoverBoxShadow: "none",
      },
    };

    // Fallback to primary if variant is invalid
    const vSpec = variantSpec[variant] || variantSpec.primary;

    // Build inline styles for complete browser control
    const buttonStyle: React.CSSProperties = {
      // Layout
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: `${spec.gap}px`,
      
      // Size
      height: `${spec.height}px`,
      paddingLeft: `${spec.paddingX}px`,
      paddingRight: `${spec.paddingX}px`,
      
      // Typography
      fontSize: `${spec.fontSize}px`,
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
      whiteSpace: "nowrap" as const,
      
      // Shape
      borderRadius: "12px",
      border: vSpec.border,
      borderBottom: vSpec.borderBottom,
      
      // Colors
      background: vSpec.background,
      color: vSpec.color,
      
      // Effects
      boxShadow: vSpec.boxShadow,
      
      // Transitions
      transition: "box-shadow 150ms ease, transform 150ms ease, background 150ms ease",
      
      // Full width
      width: fullWidth ? "100%" : "auto",
      
      // Reset
      WebkitAppearance: "none",
      MozAppearance: "none",
      appearance: "none",
      
      // Custom overrides
      ...style,
    };

    const iconStyle: React.CSSProperties = {
      width: `${spec.iconSize}px`,
      height: `${spec.iconSize}px`,
      flexShrink: 0,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={buttonStyle}
        className={className}
        onMouseEnter={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.boxShadow = vSpec.hoverBoxShadow;
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.boxShadow = vSpec.boxShadow;
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
        onMouseDown={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = "scale(0.98)";
          }
        }}
        onMouseUp={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        {...props}
      >
        {isLoading ? (
          <svg
            style={iconStyle}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : Icon ? (
          <Icon style={iconStyle} />
        ) : null}
        {children}
      </button>
    );
  }
);

SportButton.displayName = "SportButton";
export default SportButton;
