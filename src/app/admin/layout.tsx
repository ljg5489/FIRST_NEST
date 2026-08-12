// 파일 위치: src/app/admin/layout.tsx
// 파일 명: layout.tsx

import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f0d] to-[#050807] text-[#e6f7ef] antialiased flex">
      <aside className="w-72 bg-[#0e1412] border-r border-[#152018] p-6 flex flex-col">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1db954] to-[#0aa246] flex items-center justify-center text-black font-bold">FN</div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">FIRST NEST</h1>
              <p className="text-xs text-[#9fbfae]">Admin Console</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2 text-sm">
            <li><Link href="/admin" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Dashboard</Link></li>
            <li><Link href="/admin/travelers" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Travelers</Link></li>
            <li><Link href="/admin/conditions" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Conditions</Link></li>
            <li><Link href="/admin/attractions" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Attractions</Link></li>
            <li><Link href="/admin/recommend" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Recommendations</Link></li>
            <li><Link href="/admin/map" className="block px-3 py-2 rounded-md hover:bg-[#112418]">Map</Link></li>
            <li><Link href="/admin/api-test" className="block px-3 py-2 rounded-md hover:bg-[#112418]">API Test</Link></li>
          </ul>
        </nav>
        <div className="mt-6 text-xs text-[#86a697]">
          <div>Project: TRAVEL WITH ME</div>
          <div className="mt-2">Spotify-ish admin theme • Internal use only</div>
        </div>
      </aside>

      <div className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Admin</h2>
            <p className="text-sm text-[#9fbfae]">관리자 전용 대시보드 — 데모/데이터 검증용</p>
          </div>
          <div className="flex items-center gap-4">
            <input placeholder="Search..." className="px-3 py-2 rounded bg-[#07110e] border border-[#133023] text-sm" />
            <div className="w-9 h-9 rounded-full bg-[#173826] flex items-center justify-center text-sm">HK</div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

