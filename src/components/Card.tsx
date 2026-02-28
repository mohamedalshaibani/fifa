import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string; // Additional classes
  hoverable?: boolean;
  noPadding?: boolean;
}

export default function Card({ 
  children, 
  className = "", 
  hoverable = false, 
  noPadding = false 
}: CardProps) {
  // Determine base class
  // .card has hover effects by default in our CSS.
  // .card-flat does NOT have hover effects.
  const baseClass = hoverable ? "card" : "card-flat";

  return (
    <div 
      className={`
        ${baseClass}
        ${noPadding ? "" : "p-6"} 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
