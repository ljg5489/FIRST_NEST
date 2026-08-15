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
    <div className="min-h-screen bg-[#14151A] text-[#E0E2E8] antialiased flex selection:bg-[#CEFF00] selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1C23] border-r border-[#2C2E38] p-6 flex flex-col shrink-0 hidden lg:flex">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CEFF00] to-[#9db800] flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(206,255,0,0.3)] group-hover:scale-105 transition-transform">
              FN
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-wide text-white">FIRST NEST</h1>
              <p className="text-[10px] font-bold text-[#848A9C] uppercase tracking-wider">Admin Console</p>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1">
          <div className="text-[10px] font-bold text-[#5C657D] uppercase tracking-widest mb-3 px-3">
            Core Modules
          </div>
          <ul className="space-y-1 text-sm font-bold text-[#A0A5B5]">
            <li>
              <Link href="/admin" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/travelers" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Travelers
              </Link>
            </li>
            <li>
              <Link href="/admin/conditions" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Conditions
              </Link>
            </li>
            {/* 💡 새로 추가된 프롬프트 랩 메뉴 */}
            <li>
              <Link href="/admin/prompt-test" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-[#3EAEFF] transition-colors">
                Prompt Lab <span className="ml-2 text-[9px] bg-[#3EAEFF]/10 text-[#3EAEFF] px-1.5 py-0.5 rounded border border-[#3EAEFF]/20">AI</span>
              </Link>
            </li>
          </ul>

          <div className="text-[10px] font-bold text-[#5C657D] uppercase tracking-widest mt-8 mb-3 px-3">
            Data Management
          </div>
          <ul className="space-y-1 text-sm font-bold text-[#A0A5B5]">
            <li>
              <Link href="/admin/attractions" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Attractions
              </Link>
            </li>
            <li>
              <Link href="/admin/localization" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Localization 
              </Link>
            </li>
            <li>
              <Link href="/admin/map" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                Map Board
              </Link>
            </li>
            <li>
              <Link href="/admin/api-test" className="block px-3 py-2.5 rounded-lg hover:bg-[#21232B] hover:text-white transition-colors">
                API Test
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-6 pt-6 border-t border-[#2C2E38] text-xs text-[#5C657D] font-mono">
          <div>Project: TRAVEL WITH ME</div>
          <div className="mt-1">v1.0.0-MVP</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}