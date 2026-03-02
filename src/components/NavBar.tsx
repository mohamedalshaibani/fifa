import Link from "next/link";
import Button from "@/components/ui/Button";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/participants", label: "المشاركون" },
  { href: "/schedule", label: "الجدول" },
  { href: "/standings", label: "الترتيب" },
  { href: "/bracket", label: "الشجرة" },
  { href: "/champion", label: "البطل" },
];

export default function NavBar({ hideJoin }: { hideJoin?: boolean }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm pb-4 border-b border-border/50 mb-6 w-full overflow-x-auto no-scrollbar">
      {links
        .filter((link) => (hideJoin ? link.href !== "/join" : true))
        .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0"
          >
            <Button variant="secondary" size="sm">
              {link.label}
            </Button>
          </Link>
        ))}
    </nav>
  );
}
