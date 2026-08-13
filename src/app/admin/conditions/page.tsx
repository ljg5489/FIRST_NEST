// 파일 위치: src/app/admin/conditions/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState } from 'react';

// 옵션 상수 정의
const NATIONALITIES = ['USA', 'Japan', 'Vietnam', 'France', 'China'];
const DURATIONS = [1, 2, 3];
const INTERESTS = ['History', 'Local Food', 'Nature', 'Festival', 'Photo Spots', 'Family', 'Shopping', 'Healing'];
const TRANSPORTS = ['Public transit', 'Rental Car', 'Taxi'];

export default function AdminConditionsPage() {
  // 폼 상태 관리
  const [nationality, setNationality] = useState('USA');
  const [duration, setDuration] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['History', 'Local Food']);
  const [transport, setTransport] = useState('Public transit');
  
  // 엔진 구동 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 관심사 다중 선택 토글 함수
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // 추천 엔진 실시간 가동 (현재 API 라우트로 커스텀 데이터 전송)
  const handleRunCustomEngine = async () => {
    if (selectedInterests.length === 0) {
      alert('최소 1개의 관심사를 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    // 커스텀 여행자 객체 생성
    const customTraveler = {
      id: 'custom', // 커스텀 테스트임을 명시 (현재 백엔드에서는 기본값인 Emma 경로를 뱉음)
      name: 'Custom Tester',
      country: nationality,
      focus: selectedInterests.join(', '),
      days: duration,
      transport: transport,
    };

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traveler: customTraveler }),
      });

      if (!response.ok) {
        throw new Error(`API 호출 에러: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('[오류] 커스텀 엔진 가동 중 문제 발생:', error);
      alert('추천 엔진을 가동하는 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      
      {/* Header */}
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Simulator · Conditions</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Custom Scenario Builder
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              국적, 관심사, 여행일수 등의 파라미터를 직접 조작하여 동적 추천 알고리즘을 테스트합니다.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center text-right">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Status</span>
              <span className="text-sm font-bold text-[#CEFF00]">Ready for Test</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ==========================================
            Left Column: Condition Inputs
        ========================================== */}
        <div className="xl:col-span-5 space-y-6">
          
          <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
              여행 조건 설정 (Parameters)
              <span className="text-[10px] bg-[#2C2E38] text-[#A0A5B5] px-2 py-1 rounded font-mono">Dynamic</span>
            </h2>

            <div className="space-y-6">
              {/* 1. Nationality */}
              <div>
                <label className="block text-xs text-[#848A9C] font-bold uppercase tracking-wider mb-3">Nationality</label>
                <div className="flex flex-wrap gap-2">
                  {NATIONALITIES.map((nat) => (
                    <button
                      key={nat}
                      onClick={() => setNationality(nat)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        nationality === nat 
                          ? 'bg-[#21232B] text-[#CEFF00] border border-[#CEFF00] shadow-[0_0_10px_rgba(206,255,0,0.1)]' 
                          : 'bg-[#181920] text-[#848A9C] border border-[#2C2E38] hover:border-[#393C4A]'
                      }`}
                    >
                      {nat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Duration */}
              <div>
                <label className="block text-xs text-[#848A9C] font-bold uppercase tracking-wider mb-3">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        duration === d 
                          ? 'bg-[#21232B] text-white border border-[#CEFF00]' 
                          : 'bg-[#181920] text-[#848A9C] border border-[#2C2E38] hover:border-[#393C4A]'
                      }`}
                    >
                      {d} Day{d > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Interests (Multi-select) */}
              <div>
                <label className="block text-xs text-[#848A9C] font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                  Interests
                  <span className="text-[10px] text-[#5C657D] font-normal normal-case">다중 선택 가능</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#CEFF00]/10 text-[#CEFF00] border border-[#CEFF00]/50' 
                            : 'bg-[#181920] text-[#848A9C] border border-[#2C2E38] hover:text-white'
                        }`}
                      >
                        {isSelected && '✓ '} {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Transport */}
              <div>
                <label className="block text-xs text-[#848A9C] font-bold uppercase tracking-wider mb-3">Transport</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRANSPORTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransport(t)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        transport === t 
                          ? 'bg-[#21232B] text-white border border-[#5C657D]' 
                          : 'bg-[#181920] text-[#5C657D] border border-[#2C2E38] hover:text-[#848A9C]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ==========================================
            Right Column: Execution & Results
        ========================================== */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Action Bar */}
          <section className="bg-gradient-to-r from-[#1A1C23] to-[#21232B] border border-[#2C2E38] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">커스텀 조건 추천 가동</h2>
              <p className="text-xs text-[#848A9C]">선택한 파라미터 조합으로 백엔드 API를 찌릅니다.</p>
            </div>
            <button 
              onClick={handleRunCustomEngine}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isGenerating 
                  ? 'bg-[#2C2E38] text-[#848A9C] cursor-not-allowed'
                  : 'bg-[#CEFF00] text-black hover:bg-[#b5e600] hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#848A9C]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Run Custom Engine'
              )}
            </button>
          </section>

          {/* Results Area */}
          <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6 min-h-[400px] flex flex-col">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              API 응답 결과
              {result && <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse"></span>}
            </h2>

            {!isGenerating && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 border-2 border-dashed border-[#5C657D] rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#5C657D] text-xl">⚙️</span>
                </div>
                <p className="text-sm text-[#848A9C]">조건을 설정하고 Run 버튼을 누르세요.</p>
              </div>
            )}

            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#CEFF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#CEFF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#CEFF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-xs text-[#3EAEFF] font-mono animate-pulse">Generating personalized AI story...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 확정 코스 */}
                <div>
                  <h3 className="text-xs text-[#848A9C] font-bold mb-2">1. 백엔드 확정 코스 (현재는 Emma 기본값 반환)</h3>
                  <div className="bg-[#21232B] p-4 rounded-xl border border-[#2C2E38] text-lg font-bold text-white tracking-wide">
                    {result.route}
                  </div>
                </div>

                {/* AI 스토리텔링 */}
                <div>
                  <h3 className="text-xs text-[#848A9C] font-bold mb-2 flex items-center gap-2">
                    2. 다이나믹 맞춤형 설명 (OpenAI API)
                    <span className="text-[9px] bg-[#3EAEFF]/10 text-[#3EAEFF] px-1.5 py-0.5 rounded border border-[#3EAEFF]/20 uppercase">Live Output</span>
                  </h3>
                  <div className="bg-[#181920] p-4 rounded-xl border border-[#2C2E38] border-l-2 border-l-[#3EAEFF] text-sm text-[#A0A5B5] leading-relaxed whitespace-pre-line font-serif italic">
                    "{result.aiStory}"
                  </div>
                </div>

                {/* 검증 지표 */}
                <div>
                  <h3 className="text-xs text-[#848A9C] font-bold mb-3 flex items-center gap-2">
                    3. 카카오 네비게이션 검증 데이터
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#21232B] p-3 rounded-lg border border-[#2C2E38] text-center">
                      <div className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">예상 이동 시간</div>
                      <div className="text-lg font-bold text-white">{result.metrics.estimatedTime ? `${result.metrics.estimatedTime} min` : 'N/A'}</div>
                    </div>
                    <div className="bg-[#21232B] p-3 rounded-lg border border-[#2C2E38] text-center">
                      <div className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">예상 이동 거리</div>
                      <div className="text-lg font-bold text-white">{result.metrics.estimatedDistance ? `${result.metrics.estimatedDistance} km` : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}