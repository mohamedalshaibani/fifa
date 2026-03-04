"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface BackLinkProps {
  /** The URL to navigate back to */
  href: string;
  /** The text to display */
  text: string;
}

/**
 * Unified back link component for consistent navigation across all pages.
 * 
 * Standard spacing:
 * - Use within a container with consistent padding (py-6 or py-8)
 * - The component itself has mb-6 for spacing to next element
 * 
 * Styling:
 * - Font: text-sm font-semibold
 * - Color: text-primary with hover effect
 * - Icon: ArrowRight for RTL (Arabic), ArrowLeft for LTR (English)
 * - Gap: gap-2 between icon and text
 */
export default function BackLink({ href, text }: BackLinkProps) {
  const { isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-6"
    >
      <ArrowIcon className="w-4 h-4" />
      <span>{text}</span>
    </Link>
  );
}
