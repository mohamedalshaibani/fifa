'use client';

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface SportBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const SportBadge = React.forwardRef<HTMLDivElement, SportBadgeProps>(
  ({ variant = 'primary', icon, children, className = '', ...props }, ref) => {
    const variantStyles = {
      success: 'bg-accent/bg text-accent border border-accent/60',
      warning: 'bg-warning/10 text-warning border border-warning/40',
      danger: 'bg-danger/10 text-danger border border-danger/40',
      info: 'bg-primary/5 text-primary border border-primary/30',
      primary: 'bg-primary/10 text-primary border border-primary/40',
    };

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center gap-2
          px-3 py-1.5
          text-[11px] font-black uppercase tracking-[0.18em]
          rounded-full
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {icon}
        {children}
      </div>
    );
  }
);

SportBadge.displayName = 'SportBadge';

export default SportBadge;
