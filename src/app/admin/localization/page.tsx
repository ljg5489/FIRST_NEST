// 파일 위치: src/app/admin/localization/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client'; 

export default function AdminLocalizationPage() {
  const [currentPlace, setCurrentPlace] = useState<any>(null);
  const [formData, setFormData] = useState({ name_en: '', address_en: '' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchNextPlace();
  }, []);

  const fetchNextPlace = async () => {
    setIsLoading(true);
    setSuccessMsg(null);
    setFormData({ name_en: '', address_en: '' });
    
    try {
      const { data, error } = await supabase
        .from('places')
        .select('id, name_ko, name_en, address, address_en, description')
        .is('name_en', null)
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('조회 에러:', error);
      }
      
      setCurrentPlace(data || null);

      if (data) {
        handleAutoTranslate(data.name_ko, data.address);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoTranslate = async (nameKo: string, addressKo: string | null) => {
    setIsTranslating(true);
    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_ko: nameKo, address: addressKo || '주소 없음' }),
      });

      if (response.ok) {
        const { name_en, address_en } = await response.json();
        setFormData({ 
          name_en: name_en || '', 
          // AI가 'N/A'나 '주소 없음'으로 번역했을 경우 빈 칸으로 처리
          address_en: (address_en && address_en !== 'N/A' && address_en !== 'None') ? address_en : '' 
        });
      }
    } catch (error) {
      console.error('AI 번역 실패:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!currentPlace) return;
    if (!formData.name_en.trim()) {
      alert('영문 이름(English Name)은 필수 항목입니다.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/places/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentPlace.id,
          name_en: formData.name_en,
          address_en: formData.address_en
        })
      });

      if (!response.ok) throw new Error('API 업데이트 실패');

      setSuccessMsg(`[${currentPlace.name_ko}] 저장 완료!`);
      
      setTimeout(() => {
        fetchNextPlace();
      }, 1000);

    } catch (error) {
      console.error(error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Data Enrichment · AI Localization</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              AI Translation Hub
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              AI가 번역 초안을 생성하면, 관리자가 검토(Human-in-the-loop) 후 저장합니다.
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8">
        
        {successMsg && (
          <div className="mb-6 bg-[#CEFF00]/10 border border-[#CEFF00]/30 text-[#CEFF00] px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-4 flex items-center justify-between">
            <span>✅ {successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-[#1A1C23] border border-[#2C2E38] rounded-2xl">
            <svg className="animate-spin h-8 w-8 text-[#CEFF00] mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[#848A9C] text-sm font-bold">다음 항목을 찾고 있습니다...</p>
          </div>
        ) : !currentPlace ? (
          <div className="flex flex-col items-center justify-center h-[500px] bg-[#1A1C23] border border-[#2C2E38] rounded-2xl">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">모든 데이터 번역 완료!</h2>
            <p className="text-[#848A9C] text-sm">현재 DB에 영문 이름이 누락된 관광지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
            
            {/* LEFT: 한국어 원본 (컬럼 비율 5) */}
            <section className={`xl:col-span-5 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-8 transition-opacity ${isSaving || successMsg ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  🇰🇷 Original Data
                  <span className="text-[10px] bg-[#2C2E38] text-[#A0A5B5] px-2 py-0.5 rounded uppercase">Read Only</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-[#848A9C] font-bold uppercase tracking-wider mb-2">이름 (Name)</label>
                  <div className="bg-[#21232B] p-4 rounded-xl border border-[#2C2E38] text-white font-bold text-lg">
                    {currentPlace.name_ko}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#848A9C] font-bold uppercase tracking-wider mb-2">주소 (Address)</label>
                  <div className="bg-[#21232B] p-4 rounded-xl border border-[#2C2E38] text-[#A0A5B5] text-sm">
                    {currentPlace.address || '주소 정보 없음'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#848A9C] font-bold uppercase tracking-wider mb-2">설명 (Description)</label>
                  <div className="bg-[#21232B] p-4 rounded-xl border border-[#2C2E38] text-[#848A9C] text-xs leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                    {currentPlace.description || '설명 데이터가 없습니다.'}
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT: 영문 입력 폼 (컬럼 비율 7) */}
            <section className={`xl:col-span-7 bg-[#21232B] border ${formData.name_en ? 'border-[#3EAEFF]/50 shadow-[0_0_20px_rgba(62,174,255,0.05)]' : 'border-[#2C2E38]'} rounded-2xl p-8 relative transition-all duration-500 ${isSaving || successMsg ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  🇺🇸 Review & Translate
                  {isTranslating ? (
                    <span className="text-[10px] bg-[#3EAEFF]/10 text-[#3EAEFF] px-2 py-0.5 rounded uppercase border border-[#3EAEFF]/20 flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 bg-[#3EAEFF] rounded-full"></span> AI Generating...
                    </span>
                  ) : formData.name_en ? (
                    <span className="text-[10px] bg-[#3EAEFF]/10 text-[#3EAEFF] px-2 py-0.5 rounded uppercase border border-[#3EAEFF]/20 flex items-center gap-1">
                      🤖 AI Suggested
                    </span>
                  ) : null}
                </h2>
              </div>

              <div className="space-y-8">
                {/* 이름 입력 영역 */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] text-[#848A9C] font-bold uppercase tracking-wider">
                      English Name <span className="text-[#FF4C4C]">*</span>
                    </label>
                  </div>
                  {/* 💡 입력창 바로 위에 원본 텍스트를 작게 표시하여 직관적인 비교 가능 */}
                  <p className="text-xs text-[#5C657D] mb-2 font-medium bg-[#1A1C23] p-2 rounded-lg border border-[#2C2E38]">
                    <span className="font-bold text-[#848A9C]">원문:</span> {currentPlace.name_ko}
                  </p>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    disabled={isTranslating}
                    placeholder="AI가 번역을 생성 중입니다..."
                    className={`w-full bg-[#1A1C23] border ${isTranslating ? 'border-[#3EAEFF] animate-pulse' : 'border-[#2C2E38]'} rounded-xl px-4 py-4 text-white font-bold focus:outline-none focus:border-[#CEFF00] transition-colors`}
                  />
                </div>

                {/* 주소 입력 영역 */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] text-[#848A9C] font-bold uppercase tracking-wider">
                      English Address (Optional)
                    </label>
                  </div>
                  {/* 💡 주소도 원문을 바로 위에 띄워줍니다 */}
                  <p className="text-xs text-[#5C657D] mb-2 font-medium bg-[#1A1C23] p-2 rounded-lg border border-[#2C2E38]">
                    <span className="font-bold text-[#848A9C]">원문:</span> {currentPlace.address || '주소 데이터 없음'}
                  </p>
                  <input
                    type="text"
                    value={formData.address_en}
                    onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                    disabled={isTranslating}
                    placeholder={currentPlace.address ? "AI가 주소를 번역 중입니다..." : "원본 주소가 없어 빈 칸으로 남깁니다."}
                    className={`w-full bg-[#1A1C23] border ${isTranslating ? 'border-[#3EAEFF] animate-pulse' : 'border-[#2C2E38]'} rounded-xl px-4 py-4 text-[#A0A5B5] text-sm focus:outline-none focus:border-[#CEFF00] transition-colors`}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-12">
                <button
                  onClick={handleSaveAndNext}
                  disabled={isSaving || isTranslating}
                  className="w-full bg-[#CEFF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#b5e600] transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(206,255,0,0.15)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? 'Saving to DB...' : 'Confirm & Load Next'}
                  {!isSaving && !isTranslating && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}