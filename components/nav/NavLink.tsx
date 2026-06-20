"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={
        isActive
          ? "font-semibold text-indigo-600"
          : "text-gray-500 hover:text-gray-800"
      }
    >
      {label}
    </Link>
  );
}
