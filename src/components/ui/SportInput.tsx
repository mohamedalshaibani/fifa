'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SportInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const SportInput = React.forwardRef<HTMLInputElement, SportInputProps>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 h-10 rounded-[6px]
              bg-white border border-border
              text-foreground placeholder-muted
              font-base transition-all duration-150
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
              ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : ''}
              ${icon ? 'pl-10' : ''}
              disabled:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-danger" />
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-danger font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-xs text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

SportInput.displayName = 'SportInput';

export default SportInput;
