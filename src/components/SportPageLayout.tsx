'use client';

interface SportPageLayoutProps {
  children: React.ReactNode;
}

export default function SportPageLayout({ children }: SportPageLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
