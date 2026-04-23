"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/assignment", label: "Assignments" },
  { href: "/lesson", label: "Lessons" },
  { href: "/differentiate", label: "Differentiate" },
  { href: "/prompts", label: "Prompts" },
  { href: "/policy", label: "Policy" },
  { href: "/semester", label: "Semester" },
  { href: "/about", label: "Why" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="flex items-center gap-1 rounded-full bg-chrome-soft px-1.5 py-1.5"
    >
      {ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active
                ? "bg-chrome-ink text-chrome font-medium"
                : "text-chrome-muted hover:text-chrome-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
