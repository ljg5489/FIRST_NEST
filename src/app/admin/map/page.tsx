// 파일 위치: src/app/admin/map/page.tsx
// 파일 명: page.tsx

import React from 'react';
import { getAttractions, getFestivals } from '@/lib/data';
import MapClient from './MapClient';

export default async function AdminMapPage() {
  // 백엔드 데이터(관광지, 축제) 병렬 호출
  const [attractions, festivals] = await Promise.all([
    getAttractions(),
    getFestivals()
  ]);

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-10 font-sans selection:bg-[#CEFF00] selection:text-black">
      
      {/* Header */}
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Map & Routing</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Geo-Location Board
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              충남 지역 관광지와 N:M 축제 데이터의 카카오맵 마커 연동 상태를 실시간으로 테스트합니다.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center text-right">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Loaded Markers</span>
              <span className="text-lg font-bold text-[#CEFF00]">
                {(attractions?.length || 0) + (festivals?.length || 0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Client Component for Map Rendering */}
      <div className="max-w-[1400px] mx-auto px-8 mt-8">
        <MapClient attractions={attractions} festivals={festivals} />
      </div>
    </main>
  );
}