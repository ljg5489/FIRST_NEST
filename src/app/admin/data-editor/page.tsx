'use client';

import React, { useState, useEffect, useCallback } from 'react';

// 💡 하경님 DB의 실제 자료형(type)을 정확히 명시하여 Type Mismatch 에러 방지!
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
    { key: 'is_active', label: '활성화 상태 (true/false)', type: 'boolean' },
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
    { key: 'start_date', label: '매핑 시작일', type: 'date' },
    { key: 'end_date', label: '매핑 종료일', type: 'date' },
    { key: 'venue', label: '개최 장소 (Venue)', type: 'text' },
    { key: 'fee_info', label: '이용 요금 (Fee)', type: 'text' },
    { key: 'booking_url', label: '예매 링크 (Booking)', type: 'text' },
    { key: 'distance_m', label: '거리 (m)', type: 'number', isReadOnly: true },
  ],
  place_facilities: [
    { key: 'id', label: 'Facility ID', isReadOnly: true },
    { key: 'facility_type', label: '시설 종류 (Type)', type: 'text' },
    { key: 'is_available', label: '이용가능 여부', type: 'boolean' },
    { key: 'details', label: '상세 안내', type: 'text', isTextArea: true },
  ],
  place_images: [
    { key: 'id', label: 'Image ID', isReadOnly: true },
    { key: 'image_url', label: '이미지 URL', type: 'text' },
    { key: 'thumbnail_url', label: '썸네일 URL', type: 'text' },
    { key: 'source_type', label: '소스 타입', type: 'text' },
    { key: 'is_primary', label: '대표 이미지 여부', type: 'boolean' },
    { key: 'sort_order', label: '정렬 순서', type: 'number' },
  ],
  place_tags: [
    { key: 'id', label: 'Tag ID', isReadOnly: true },
    { key: 'tag', label: '태그명', type: 'text' },
  ],
  event_images: [
    { key: 'id', label: 'Image ID', isReadOnly: true },
    { key: 'image_url', label: '원본 이미지 URL', type: 'text' },
    { key: 'thumbnail_url', label: '썸네일 URL', type: 'text' },
    { key: 'image_name', label: '이미지 이름', type: 'text' },
    { key: 'source', label: '출처', type: 'text' },
    { key: 'is_primary', label: '대표 이미지 여부', type: 'boolean' },
    { key: 'serial_number', label: '정렬 순서 (Serial)', type: 'number' },
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

export default function AdminDataEditorPage() {
  const [selectedTable, setSelectedTable] = useState<keyof typeof TABLE_SCHEMAS>('places');
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTableEmpty, setIsTableEmpty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeColumns = TABLE_SCHEMAS[selectedTable];

  const fetchNextMissingData = useCallback(async (targetTable: string) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setCurrentRecord(null);
    setIsTableEmpty(false);
    setFormData({});
    
    try {
      // 서버에 던질 때 각 컬럼의 type 정보도 같이 보내줍니다.
      const columnsForCheck = TABLE_SCHEMAS[targetTable]
        .filter(col => !col.isReadOnly)
        .map(col => ({ key: col.key, type: col.type || 'text' }));
      
      const response = await fetch('/api/editor/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: targetTable, columns: columnsForCheck })
      });
      
      // 💡 여기서 에러가 났다면 숨기지 않고 던져서 파악할 수 있게 합니다.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터 조회 실패');
      }
      
      const { isEmptyTable, data } = await response.json();
      
      if (isEmptyTable) {
        setIsTableEmpty(true);
      } else {
        setCurrentRecord(data);
        if (data) setFormData({ ...data });
      }
    } catch (error: any) {
      console.error(error);
      alert(`조회 중 에러 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextMissingData(selectedTable);
  }, [selectedTable, fetchNextMissingData]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSaveAndNext = async () => {
    if (!currentRecord) return;

    setIsSaving(true);
    try {
      const updates: any = {};
      
      activeColumns.forEach(col => {
        if (!col.isReadOnly) {
          let finalVal = formData[col.key] === '' ? null : formData[col.key];
          
          // 💡 자료형에 맞춰 안전하게 파싱하여 저장
          if (finalVal !== null) {
            if (col.type === 'number') finalVal = Number(finalVal);
            if (col.type === 'boolean') finalVal = (finalVal === 'true' || finalVal === true);
          }
          
          updates[col.key] = finalVal;
        }
      });

      const response = await fetch('/api/editor/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: selectedTable, id: currentRecord.id || currentRecord.event_id, updates })
      });

      if (!response.ok) throw new Error('업데이트 실패');

      const titleKey = currentRecord.name_ko ? 'name_ko' : currentRecord.title ? 'title' : 'id';
      setSuccessMsg(`[${currentRecord[titleKey] || currentRecord.id || '레코드'}] 업데이트 완료!`);
      
      setTimeout(() => {
        fetchNextMissingData(selectedTable);
      }, 1000);

    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const isMissingValue = (val: any) => {
    return val === null || val === '' || val === 'NEED_UPDATE';
  };

  const missingColumns = currentRecord 
    ? activeColumns.filter(col => !col.isReadOnly && isMissingValue(currentRecord[col.key])) 
    : [];

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4C4C] animate-pulse shadow-[0_0_8px_#FF4C4C]"></span>
            <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Universal Database Cleansing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Full Schema Editor
          </h1>
          <p className="text-[#848A9C] text-sm font-medium">
            DB의 모든 테이블과 컬럼 구조를 스캔하여 결측치나 임시값(NEED_UPDATE)을 완벽하게 보정합니다.
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8">
        <div className="flex flex-wrap gap-2 mb-8 bg-[#1A1C23] p-2 rounded-xl border border-[#2C2E38] w-fit">
          {Object.keys(TABLE_SCHEMAS).map((table) => (
            <button
              key={table}
              onClick={() => setSelectedTable(table)}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                selectedTable === table 
                  ? 'bg-[#21232B] text-[#CEFF00] border border-[#CEFF00]/50 shadow-[0_0_15px_rgba(206,255,0,0.1)]' 
                  : 'bg-transparent text-[#848A9C] border border-transparent hover:text-white hover:bg-[#21232B]'
              }`}
            >
              {table.toUpperCase()}
            </button>
          ))}
        </div>

        {successMsg && (
          <div className="mb-6 bg-[#CEFF00]/10 border border-[#CEFF00]/30 text-[#CEFF00] px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between">
            <span>✅ {successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-[#1A1C23] border border-[#2C2E38] rounded-2xl">
            <svg className="animate-spin h-8 w-8 text-[#FF4C4C] mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[#848A9C] text-sm font-bold"><span className="text-white uppercase">{selectedTable}</span> 테이블 스캔 중...</p>
          </div>
        ) : isTableEmpty ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-[#1A1C23] border border-[#2C2E38] rounded-2xl border-dashed">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">{selectedTable} is Empty!</h2>
            <p className="text-[#848A9C] text-sm text-center">해당 테이블에는 아직 삽입된 데이터가 하나도 없습니다.</p>
          </div>
        ) : !currentRecord ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-[#1A1C23] border border-[#2C2E38] rounded-2xl">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">{selectedTable} 완벽!</h2>
            <p className="text-[#848A9C] text-sm">해당 테이블의 감시 대상 컬럼들에 결측치가 존재하지 않습니다.</p>
          </div>
        ) : (
          <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-8 shadow-xl">
            
            <div className="mb-8 bg-[#FF4C4C]/5 border border-[#FF4C4C]/20 rounded-xl p-5">
              <h3 className="text-[#FF4C4C] text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Detection Report
              </h3>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#848A9C]">Target Table:</span>
                  <span className="text-white font-mono font-bold bg-[#2C2E38] px-2 py-0.5 rounded uppercase">{selectedTable}</span>
                </div>
                <div className="hidden md:block w-px h-5 bg-[#2C2E38]"></div>
                <div className="flex items-start md:items-center gap-3">
                  <span className="text-[#848A9C] shrink-0 mt-0.5 md:mt-0">Missing Target:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {missingColumns.map(col => (
                      <span key={col.key} className="bg-[#FF4C4C] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,76,76,0.2)]">
                        {col.key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2C2E38]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  Record ID: <span className="font-mono text-[#CEFF00]">{currentRecord.id}</span>
                </h2>
                <p className="text-[#848A9C] text-xs mt-1">
                  회색 칸은 읽기 전용 정보이며, 빨간 테두리로 강조된 부분이 비어있거나 보정이 필요한 항목입니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {activeColumns.map((col) => {
                const isMissing = !col.isReadOnly && isMissingValue(currentRecord[col.key]);

                let displayValue = formData[col.key] ?? '';
                if (col.isReadOnly && typeof displayValue === 'object') {
                  displayValue = JSON.stringify(displayValue, null, 2);
                } else if (typeof displayValue === 'boolean') {
                  displayValue = displayValue ? 'true' : 'false';
                }

                return (
                  <div key={col.key} className={col.isTextArea || col.key === 'raw_data' ? 'md:col-span-2 lg:col-span-3' : ''}>
                    <label className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                      <span className={isMissing ? 'text-[#FF4C4C]' : 'text-[#848A9C]'}>
                        {col.label} {isMissing && '* (누락)'}
                      </span>
                      <span className="text-[#5C657D] font-mono text-[9px] lowercase flex items-center gap-1">
                        {col.isReadOnly && <span className="bg-[#2C2E38] px-1 rounded">ReadOnly</span>}
                        {col.key}
                      </span>
                    </label>
                    {col.isTextArea || col.key === 'raw_data' ? (
                      <textarea
                        value={displayValue}
                        onChange={(e) => handleInputChange(col.key, e.target.value)}
                        disabled={col.isReadOnly}
                        className={`w-full bg-[#14151A] rounded-xl px-4 py-4 text-sm font-medium focus:outline-none transition-colors ${col.key === 'raw_data' ? 'h-48 font-mono text-[11px]' : 'h-28'} resize-none custom-scrollbar ${
                          col.isReadOnly ? 'text-[#5C657D] border border-[#2C2E38]/50 bg-[#14151A]/50 cursor-not-allowed' :
                          isMissing 
                            ? 'border-2 border-[#FF4C4C]/50 focus:border-[#FF4C4C] text-[#FF4C4C]' 
                            : 'border border-[#2C2E38] focus:border-[#CEFF00] text-white'
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={displayValue}
                        onChange={(e) => handleInputChange(col.key, e.target.value)}
                        disabled={col.isReadOnly}
                        className={`w-full bg-[#14151A] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors ${
                          col.isReadOnly ? 'text-[#5C657D] border border-[#2C2E38]/50 bg-[#14151A]/50 cursor-not-allowed' :
                          isMissing 
                            ? 'border-2 border-[#FF4C4C]/50 focus:border-[#FF4C4C] text-[#FF4C4C]' 
                            : 'border border-[#2C2E38] focus:border-[#CEFF00] text-white'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveAndNext}
              disabled={isSaving}
              className="w-full bg-[#CEFF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b5e600] transition-transform hover:scale-[1.01] shadow-[0_4px_20px_rgba(206,255,0,0.15)] disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '변경사항 저장 및 다음 항목 로드'}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}