
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import Providers from "./providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "بطولات فيفا | FIFA Tournaments",
  description: "منصة بطولات فيفا - تجربة تنافسية احترافية | FIFA Tournaments Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Default to Arabic RTL, client-side JS will update based on user preference
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-cairo min-h-screen antialiased bg-gradient-to-b from-[#E8DDD2] via-[#FFFFFF] to-[#D4E5F7] text-foreground`}
      >
        <Providers>
          <GlobalHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
