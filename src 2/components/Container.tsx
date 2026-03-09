import { ReactNode } from "react";

export default function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`container-responsive py-8 ${className}`}>
      {children}
    </div>
  );
}
