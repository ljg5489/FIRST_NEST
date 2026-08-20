// 파일 위치: src/app/admin/api-test/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState } from 'react';

const CONTENT_TYPE_MAP: Record<string, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/공연/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

export default function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanType, setScanType] = useState<'spots' | 'codes' | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async (type: 'spots' | 'codes') => {
    setIsLoading(true);
    setScanType(type);
    setError(null);
    setPreviewData(null);
    
    try {
      const res = await fetch(`/api/tourism/preview?type=${type}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || '데이터를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#3EAEFF] animate-pulse shadow-[0_0_8px_#3EAEFF]"></span>
            <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Safe Test Environment</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            TourAPI Data Preview
          </h1>
          <p className="text-[#848A9C] text-sm font-medium">
            DB에 덮어씌우기(Overwrite) 전에, API에서 어떤 데이터가 총 몇 개 들어오는지 안전하게 확인합니다.
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 space-y-6">
        
        <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-lg mb-1">API 데이터 스캔 (Dry Run)</h2>
              <p className="text-sm text-[#848A9C]">실제 데이터베이스에는 아무런 영향을 주지 않습니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePreview('spots')}
                disabled={isLoading}
                className="bg-[#3EAEFF] hover:bg-[#2B8AC7] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(62,174,255,0.2)] disabled:opacity-50"
              >
                {isLoading && scanType === 'spots' ? '스캔 중...' : '데이터 스캔 시작'}
              </button>
              <button
                onClick={() => handlePreview('codes')}
                disabled={isLoading}
                className="bg-[#CEFF00] hover:bg-[#A3CC00] text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(206,255,0,0.2)] disabled:opacity-50"
              >
                {isLoading && scanType === 'codes' ? '확인 중...' : '분류체계 확인'}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 text-[#FF4C4C] px-6 py-4 rounded-xl text-sm font-bold">
            에러 발생: {error}
          </div>
        )}

        {previewData && previewData.type === 'spots' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
              <h3 className="text-[#848A9C] text-[11px] font-bold uppercase tracking-wider mb-4">Total Fetched</h3>
              <div className="text-5xl font-black text-white mb-2">
                {previewData.totalCount?.toLocaleString()}
                <span className="text-lg text-[#5C657D] font-normal ml-2">건</span>
              </div>
              <p className="text-sm text-[#CEFF00]">성공적으로 메모리에 불러왔습니다.</p>
            </div>

            <div className="md:col-span-2 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
              <h3 className="text-[#848A9C] text-[11px] font-bold uppercase tracking-wider mb-4">Data Breakdown by Type</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(previewData.typeSummary || {}).map(([typeId, count]) => (
                  <div key={typeId} className="bg-[#14151A] p-4 rounded-xl border border-[#2C2E38]">
                    <div className="text-[#A0A5B5] text-xs font-bold mb-1">
                      {CONTENT_TYPE_MAP[typeId] || `알수없음(${typeId})`}
                    </div>
                    <div className="text-2xl font-bold text-white">{Number(count).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#2C2E38]">
                <h3 className="text-white font-bold mb-1">샘플 데이터 검증 (Sample Inspector)</h3>
                <p className="text-xs text-[#848A9C]">cat3와 lclsSystm3 값이 원본에서 어떻게 넘어오는지 확인합니다.</p>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#21232B] text-[#848A9C]">
                    <tr>
                      <th className="px-6 py-3 font-bold">타입</th>
                      <th className="px-6 py-3 font-bold">관광지명 (Title)</th>
                      <th className="px-6 py-3 font-bold text-[#FF4C4C]">cat3 값</th>
                      <th className="px-6 py-3 font-bold text-[#CEFF00]">lclsSystm3 값</th>
                      <th className="px-6 py-3 font-bold">주소</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2E38]">
                    {previewData.samples?.map((sample: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#21232B]/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-[#A0A5B5]">
                          {CONTENT_TYPE_MAP[sample.contenttypeid] || sample.contenttypeid}
                        </td>
                        <td className="px-6 py-4 text-white font-bold">{sample.title}</td>
                        <td className="px-6 py-4 font-mono text-[#FF4C4C]">{sample.cat3}</td>
                        <td className="px-6 py-4 font-mono text-[#CEFF00]">{sample.lclsSystm3}</td>
                        <td className="px-6 py-4 text-[#848A9C] truncate max-w-[200px]">{sample.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="md:col-span-3 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#2C2E38]">
                <h3 className="text-white font-bold mb-1">Raw JSON Inspector (Spots)</h3>
                <p className="text-xs text-[#848A9C]">지역 기반 데이터 원본 항목(상위 50개)을 확인합니다.</p>
              </div>
              <div className="p-6 bg-[#14151A] overflow-x-auto h-96">
                 <pre className="text-[11px] text-[#A0A5B5] font-mono whitespace-pre-wrap break-all custom-scrollbar">
                    {JSON.stringify(previewData.samples, null, 2)}
                 </pre>
              </div>
            </div>
          </div>
        )}

        {previewData && previewData.type === 'codes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#2C2E38] flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold mb-1">Grouped System Codes (계층형 트리)</h3>
                  <p className="text-xs text-[#848A9C]">JSON 데이터를 파싱하여 대/중/소분류로 묶은 구조입니다.</p>
                </div>
              </div>
              <div className="p-6 bg-[#14151A] overflow-x-auto h-[600px]">
                 <pre className="text-[11px] text-[#3EAEFF] font-mono whitespace-pre-wrap break-all custom-scrollbar">
                    {JSON.stringify(previewData.groupedSystemCodes, null, 2)}
                 </pre>
              </div>
            </div>

            <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#2C2E38] flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold mb-1">System Codes Inspector (원본)</h3>
                  <p className="text-xs text-[#848A9C]">조회된 공공데이터포털 분류 체계 코드 원본입니다.</p>
                </div>
                <div className="text-[#848A9C] text-sm font-bold">
                  총 {previewData.systemCodesCount?.toLocaleString() || 0}건
                </div>
              </div>
              <div className="p-6 bg-[#14151A] overflow-x-auto h-[600px]">
                 <pre className="text-[11px] text-[#CEFF00] font-mono whitespace-pre-wrap break-all custom-scrollbar">
                    {JSON.stringify(previewData.systemCodes, null, 2)}
                 </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}