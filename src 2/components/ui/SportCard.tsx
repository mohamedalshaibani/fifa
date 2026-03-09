'use client';

import React from 'react';

type Padding = 'sm' | 'base' | 'lg';
type Variant = 'default' | 'highlighted' | 'success' | 'warning' | 'danger' | 'elevated';

interface SportCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  variant?: Variant;
  hoverable?: boolean;
  children: React.ReactNode;
}

const SportCard = React.forwardRef<HTMLDivElement, SportCardProps>(
  (
    {
      padding = 'base',
      variant = 'default',
      hoverable = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      sm: 'p-3',
      base: 'p-4',
      lg: 'p-6',
    };

    const variantStyles = {
      default: 'bg-white border border-border shadow-sm',
      highlighted: 'bg-white border-2 border-primary shadow-md',
      success: 'bg-white border border-success/40 shadow-sm',
      warning: 'bg-white border border-warning/40 shadow-sm',
      danger: 'bg-white border border-danger/40 shadow-sm',
      elevated: 'bg-white border border-border shadow-lg',
    };

    const hoverStyle = hoverable
      ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/60'
      : '';

    return (
      <div
        ref={ref}
        className={`
          rounded-xl relative overflow-hidden
          ${paddingStyles[padding]}
          ${variantStyles[variant]}
          ${hoverStyle}
          ${className}
        `}
        {...props}
      >
        {/* Broadcast edge accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-90" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

SportCard.displayName = 'SportCard';

export default SportCard;
