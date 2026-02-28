
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "بطولات فيفا",
  description: "منصة بطولات فيفا - تجربة تنافسية احترافية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} font-cairo min-h-screen antialiased bg-gradient-to-b from-[#E8DDD2] via-[#FFFFFF] to-[#D4E5F7] text-foreground`}
      >
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
