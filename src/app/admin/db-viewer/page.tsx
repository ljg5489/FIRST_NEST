// 파일 위치: src/app/admin/db-viewer/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';

const TABLE_SCHEMAS: Record<string, { key: string; label: string; isTextArea?: boolean; isReadOnly?: boolean; type?: 'text' | 'number' | 'boolean' | 'date' }[]> = {
  places: [
    { key: 'id', label: 'ID (UUID)', isReadOnly: true },
    { key: 'tour_api_content_id', label: 'Tour API ID', isReadOnly: true },
    { key: 'content_type_id', label: 'Content Type ID', isReadOnly: true },
    { key: 'name_ko', label: '이름 (KR)', type: 'text' },
    { key: 'name_en', label: '이름 (EN)', type: 'text' },
    { key: 'address', label: '주소 (KR)', type: 'text' },
    { key: 'address_en', label: '주소 (EN)', type: 'text' },
    { key: 'district_code', label: '시군구 코드', type: 'text' },
    { key: 'region_code', label: '지역 코드', type: 'text' },
    { key: 'category_code', label: '카테고리 코드', type: 'text' },
    { key: 'latitude', label: '위도', type: 'number' },
    { key: 'longitude', label: '경도', type: 'number' },
    { key: 'phone', label: '전화번호', type: 'text' },
    { key: 'website', label: '홈페이지', type: 'text' },
    { key: 'opening_hours', label: '운영 시간', type: 'text' },
    { key: 'closed_days', label: '휴무일', type: 'text' },
    { key: 'description', label: '설명', type: 'text', isTextArea: true },
    { key: 'recommended_stay_minutes', label: '권장 체류시간(분)', type: 'number' },
    { key: 'foreigner_friendly_score', label: '친화도 점수', type: 'number' },
    { key: 'mobility_score', label: '이동성 점수', type: 'number' },
    { key: 'data_completeness_score', label: '데이터 완성도 점수', type: 'number' },
    { key: 'is_active', label: '활성화 상태', type: 'boolean' },
    { key: 'raw_data', label: 'Raw Data (JSONB)', isReadOnly: true },
    { key: 'synced_at', label: '최근 동기화 일시', isReadOnly: true },
  ],
  events: [
    { key: 'id', label: 'ID (UUID)', isReadOnly: true },
    { key: 'title', label: '축제/행사명', type: 'text' },
    { key: 'event_start_date', label: '시작일', type: 'date' },
    { key: 'event_end_date', label: '종료일', type: 'date' },
    { key: 'address', label: '기본 주소', type: 'text' },
    { key: 'address_detail', label: '상세 주소', type: 'text' },
    { key: 'latitude', label: '위도', type: 'number' },
    { key: 'longitude', label: '경도', type: 'number' },
    { key: 'phone', label: '전화번호', type: 'text' },
    { key: 'homepage', label: '홈페이지 URL', type: 'text' },
    { key: 'first_image_url', label: '대표 이미지 URL', type: 'text' },
    { key: 'first_image_thumbnail_url', label: '대표 썸네일 URL', type: 'text' },
    { key: 'overview', label: '행사 개요', type: 'text', isTextArea: true },
    { key: 'raw_data', label: 'Raw Data (JSONB)', isReadOnly: true },
  ],
  place_events: [
    { key: 'id', label: 'Mapping ID', isReadOnly: true },
    { key: 'place_id', label: 'Place ID', isReadOnly: true },
    { key: 'event_id', label: 'Event ID', isReadOnly: true },
    { key: 'start_date', label: '매핑 시작일', type: 'date' },
    { key: 'end_date', label: '매핑 종료일', type: 'date' },
    { key: 'venue', label: '개최 장소', type: 'text' },
    { key: 'fee_info', label: '이용 요금', type: 'text' },
    { key: 'booking_url', label: '예매 링크', type: 'text' },
    { key: 'distance_m', label: '거리 (m)', type: 'number', isReadOnly: true },
  ],
  place_facilities: [
    { key: 'id', label: 'Facility ID', isReadOnly: true },
    { key: 'place_id', label: 'Place ID', isReadOnly: true },
    { key: 'facility_type', label: '시설 종류', type: 'text' },
    { key: 'is_available', label: '이용가능 여부', type: 'boolean' },
    { key: 'details', label: '상세 안내', type: 'text', isTextArea: true },
  ],
  place_images: [
    { key: 'id', label: 'Image ID', isReadOnly: true },
    { key: 'place_id', label: 'Place ID', isReadOnly: true },
    { key: 'image_url', label: '이미지 URL', type: 'text' },
    { key: 'thumbnail_url', label: '썸네일 URL', type: 'text' },
    { key: 'source_type', label: '소스 타입', type: 'text' },
    { key: 'is_primary', label: '대표 이미지 여부', type: 'boolean' },
    { key: 'sort_order', label: '정렬 순서', type: 'number' },
  ],
  place_tags: [
    { key: 'id', label: 'Tag ID', isReadOnly: true },
    { key: 'place_id', label: 'Place ID', isReadOnly: true },
    { key: 'tag', label: '태그명', type: 'text' },
    { key: 'source', label: '출처', type: 'text' },
  ],
  event_images: [
    { key: 'id', label: 'Image ID', isReadOnly: true },
    { key: 'event_id', label: 'Event ID', isReadOnly: true },
    { key: 'image_url', label: '원본 이미지 URL', type: 'text' },
    { key: 'thumbnail_url', label: '썸네일 URL', type: 'text' },
    { key: 'image_name', label: '이미지 이름', type: 'text' },
    { key: 'source', label: '출처', type: 'text' },
    { key: 'is_primary', label: '대표 이미지 여부', type: 'boolean' },
    { key: 'serial_number', label: '정렬 순서', type: 'number' },
  ],
  courses: [
    { key: 'id', label: 'Course ID', isReadOnly: true },
    { key: 'title', label: '코스 이름', type: 'text' },
    { key: 'description', label: '코스 요약 설명', type: 'text', isTextArea: true },
    { key: 'total_duration_minutes', label: '총 소요시간(분)', type: 'number' },
    { key: 'is_public', label: '공개 여부', type: 'boolean' },
  ],
  course_stops: [
    { key: 'id', label: 'Stop ID', isReadOnly: true },
    { key: 'stay_minutes', label: '체류 시간(분)', type: 'number' },
    { key: 'stop_order', label: '방문 순서', type: 'number' },
    { key: 'note', label: '경유지 메모', type: 'text', isTextArea: true },
  ]
};

export default function DatabaseViewerPage() {
  const [selectedTable, setSelectedTable] = useState<keyof typeof TABLE_SCHEMAS>('places');
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeColumns = TABLE_SCHEMAS[selectedTable];

  const fetchTableData = useCallback(async (targetTable: string) => {
    setIsLoading(true);
    setError(null);
    setTableData([]);
    setTotalCount(0);
    
    try {
      const response = await fetch('/api/admin/db-viewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: targetTable })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '데이터 조회 실패');
      }
      
      setTableData(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err: any) {
      setError(`조회 중 에러 발생: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable, fetchTableData]);

  const renderCellContent = (value: any) => {
    if (value === null || value === undefined) return <span className="text-[#5C657D] italic">null</span>;
    if (typeof value === 'boolean') return <span className={value ? 'text-[#CEFF00]' : 'text-[#FF4C4C]'}>{value.toString()}</span>;
    if (typeof value === 'object') return <span className="text-[#3EAEFF] text-xs">JSON Object</span>;
    
    const strValue = String(value);
    return strValue.length > 50 ? `${strValue.substring(0, 50)}...` : strValue;
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#3EAEFF] animate-pulse shadow-[0_0_8px_#3EAEFF]"></span>
            <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Database Inspector</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Table Viewer
          </h1>
          <p className="text-[#848A9C] text-sm font-medium">
            데이터베이스 내 모든 테이블의 적재 상태와 실제 자료를 조회합니다. (최근 100건 표시)
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 space-y-6">
        
        {/* 테이블 선택 패널 */}
        <div className="flex flex-wrap gap-2 bg-[#1A1C23] p-2 rounded-xl border border-[#2C2E38] w-fit">
          {Object.keys(TABLE_SCHEMAS).map((table) => (
            <button
              key={table}
              onClick={() => setSelectedTable(table)}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                selectedTable === table 
                  ? 'bg-[#21232B] text-[#3EAEFF] border border-[#3EAEFF]/50 shadow-[0_0_15px_rgba(62,174,255,0.1)]' 
                  : 'bg-transparent text-[#848A9C] border border-transparent hover:text-white hover:bg-[#21232B]'
              }`}
            >
              {table.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-[#FF4C4C]/10 border border-[#FF4C4C]/30 text-[#FF4C4C] px-6 py-4 rounded-xl text-sm font-bold">
            에러 발생: {error}
          </div>
        )}

        {/* 요약 리포트 */}
        <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
          <h3 className="text-[#848A9C] text-[11px] font-bold uppercase tracking-wider mb-2">Total Records</h3>
          <div className="text-4xl font-black text-white">
            {isLoading ? '...' : totalCount.toLocaleString()}
            <span className="text-lg text-[#5C657D] font-normal ml-2">건</span>
          </div>
        </div>

        {/* 데이터 그리드 뷰 */}
        <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2C2E38]">
            <h3 className="text-white font-bold mb-1">Data Explorer</h3>
            <p className="text-xs text-[#848A9C]">각 컬럼에 저장된 실제 자료형과 값을 확인합니다.</p>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#21232B] text-[#848A9C] sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-4 py-3 font-bold">No.</th>
                  {activeColumns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-bold">
                      <div className="flex flex-col">
                        <span className="text-white text-xs">{col.label}</span>
                        <span className="text-[10px] font-mono font-normal opacity-70">{col.key}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2E38]">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeColumns.length + 1} className="px-6 py-12 text-center text-[#848A9C]">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={activeColumns.length + 1} className="px-6 py-12 text-center text-[#848A9C]">
                      데이터가 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#21232B]/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-[#5C657D]">
                        {idx + 1}
                      </td>
                      {activeColumns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-[#A0A5B5]">
                          {renderCellContent(row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}