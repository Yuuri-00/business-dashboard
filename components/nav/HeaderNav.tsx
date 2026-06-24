"use client";

import { useState } from "react";
import { NavLink } from "./NavLink";

interface HeaderNavProps {
  navItems: { href: string; label: string }[];
  logoutSlot: React.ReactNode;
}

export function HeaderNav({ navItems, logoutSlot }: HeaderNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center text-sm">
        <span className="font-bold text-gray-800 mr-4">🗂️ 副業管理ツール</span>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="hidden md:flex ml-auto items-center">{logoutSlot}</div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden ml-auto text-gray-500 hover:text-gray-800 text-xl leading-none"
          aria-label="メニュー"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav
          className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm"
          onClick={() => setOpen(false)}
        >
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
          {logoutSlot}
        </nav>
      )}
    </header>
  );
}
