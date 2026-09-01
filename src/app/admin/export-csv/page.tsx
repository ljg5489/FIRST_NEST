// 파일 위치: src/app/admin/export-csv/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState } from 'react';

// 💡 프로젝트에서 사용 중인 전체 테이블 목록
const EXPORTABLE_TABLES = [
  'places',
  'user_consents',
  'place_tags',
  'place_facilities',
  'place_images',
  'event_images',
  'courses',
  'course_stops',
  'data_sync_logs',
  'course_legs',
  'events',
  'place_prices'
];

export default function ExportCsvPage() {
  const [downloadingTable, setDownloadingTable] = useState<string | null>(null);

  const handleDownload = async (table: string) => {
    setDownloadingTable(table);
    
    try {
      // 다운로드를 위해 window.location.href 사용
      window.location.href = `/api/admin/export-csv?table=${table}`;
      
      // 1초 후 로딩 상태 해제 (단순 UI 피드백용)
      setTimeout(() => {
        setDownloadingTable(null);
      }, 1000);
    } catch (error) {
      console.error(error);
      alert('다운로드 중 오류가 발생했습니다.');
      setDownloadingTable(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
            <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Database Backup & Export</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            CSV Exporter
          </h1>
          <p className="text-[#848A9C] text-sm font-medium">
            DB에 적재된 최신 데이터를 테이블 단위로 즉시 추출하여 CSV 파일로 다운로드합니다. (Excel 한글 깨짐 방지 적용)
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {EXPORTABLE_TABLES.map((table) => {
            const isDownloading = downloadingTable === table;
            return (
              <div 
                key={table}
                className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6 shadow-lg hover:border-[#CEFF00]/50 transition-all group flex flex-col justify-between h-40"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase group-hover:text-[#CEFF00] transition-colors">
                    {table}
                  </h3>
                  <p className="text-xs text-[#5C657D] font-mono">
                    Supabase Table
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(table)}
                  disabled={isDownloading}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isDownloading 
                      ? 'bg-[#2C2E38] text-[#848A9C] cursor-not-allowed' 
                      : 'bg-[#21232B] text-white border border-[#2C2E38] hover:bg-[#CEFF00] hover:text-black hover:border-transparent shadow-[0_4px_15px_rgba(206,255,0,0)] hover:shadow-[0_4px_15px_rgba(206,255,0,0.15)]'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[#848A9C]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      추출 중...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" x2="12" y1="15" y2="3"></line>
                      </svg>
                      CSV 다운로드
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}