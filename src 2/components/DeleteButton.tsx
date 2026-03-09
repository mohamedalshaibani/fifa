'use client';

import { FormEvent, ReactNode } from 'react';

interface DeleteButtonProps {
  confirmMessage: string;
  className?: string;
  children: ReactNode;
}

export function DeleteButton({ confirmMessage, className, children }: DeleteButtonProps) {
  const handleClick = (e: FormEvent<HTMLButtonElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
