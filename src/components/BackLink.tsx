import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
 * - Icon: ArrowRight (RTL-aware, points right in RTL)
 * - Gap: gap-2 between icon and text
 */
export default function BackLink({ href, text }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-6"
    >
      <ArrowRight className="w-4 h-4" />
      <span>{text}</span>
    </Link>
  );
}
