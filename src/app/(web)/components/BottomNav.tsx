"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/recommend", label: "조건", icon: "＋" },
  { href: "/results", label: "결과", icon: "✓" },
  { href: "/explore", label: "탐색", icon: "⌕" },
  { href: "/map", label: "지도", icon: "⌖" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="모바일 주요 화면" className="mobile-tabbar">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`grid min-h-12 place-items-center rounded-md text-xs font-black transition ${
            pathname === item.href ? "bg-[#174d3c] text-white" : "text-[#3d4941]"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
