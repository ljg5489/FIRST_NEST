// 파일 위치: src/app/admin/attractions/page.tsx
// 파일 명: page.tsx

import React from 'react';
import { getAttractions, getFestivals } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminAttractionsPage() {
  // 백엔드 함수 병렬 호출 (Server Component)
  const [attractions, festivals] = await Promise.all([
    getAttractions(),
    getFestivals()
  ]);

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      
      {/* Header */}
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Database · Places & Events</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Attractions Hub
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              TourAPI에서 동기화된 충남 지역 관광지 및 다대다(N:M) 축제 DB를 검증합니다.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center text-right">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Total Places</span>
              <span className="text-lg font-bold text-white">{attractions.length}</span>
            </div>
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center text-right">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Active Events</span>
              <span className="text-lg font-bold text-[#CEFF00]">{festivals.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 space-y-8">
        
        {/* ==========================================
            Section 1: Places (관광지 목록) 
        ========================================== */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Synced Places</h2>
            <button className="bg-[#21232B] border border-[#2C2E38] text-[#A0A5B5] px-4 py-1.5 rounded-lg text-xs font-bold hover:text-white transition-colors">
              View All
            </button>
          </div>

          <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-[#21232B] border-b border-[#2C2E38] text-[#848A9C] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">ID / Name</th>
                    <th className="px-6 py-4 font-bold">Address</th>
                    <th className="px-6 py-4 font-bold">Coordinates</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E38]">
                  {attractions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#848A9C]">
                        등록된 관광지 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    attractions.map((place: any) => (
                      <tr key={place.id} className="hover:bg-[#21232B] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{place.name_ko}</div>
                          <div className="text-[10px] text-[#5C657D] font-mono">{place.id.split('-')[0]}...</div>
                        </td>
                        <td className="px-6 py-4 text-[#A0A5B5] truncate max-w-[200px]">
                          {place.address}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-[#848A9C]">
                          {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#A0A5B5] text-[10px] font-bold uppercase">
                            <span className="w-1 h-1 rounded-full bg-[#A0A5B5]"></span>
                            Synced
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ==========================================
            Section 2: Events (N:M 매핑된 축제 목록) 
        ========================================== */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Active Festivals
              <span className="text-[10px] bg-[#CEFF00]/10 text-[#CEFF00] px-2 py-0.5 rounded border border-[#CEFF00]/20">Live</span>
            </h2>
          </div>

          <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm relative">
                <thead className="bg-[#21232B] border-b border-[#2C2E38] text-[#848A9C] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Event Title</th>
                    <th className="px-6 py-4 font-bold">Duration</th>
                    <th className="px-6 py-4 font-bold">Location</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E38]">
                  {festivals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#848A9C]">
                        현재 진행 중이거나 예정된 축제가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    festivals.map((event: any) => (
                      <tr key={event.id} className="hover:bg-[#21232B] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{event.title}</div>
                          <div className="text-[10px] text-[#5C657D] font-mono">{event.id.split('-')[0]}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#E0E2E8] font-medium text-xs mb-0.5">
                            {event.event_start_date} ~ {event.event_end_date}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#A0A5B5] truncate max-w-[200px]">
                          {event.address || '주소 정보 없음'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#CEFF00]/10 border border-[#CEFF00]/20 text-[#CEFF00] text-[10px] font-bold uppercase shadow-[0_0_10px_rgba(206,255,0,0.1)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CEFF00] animate-pulse"></span>
                            On-going
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
