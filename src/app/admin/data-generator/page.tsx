// 파일 위치: src/app/admin/data-generator/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/services/supabase/client'; 

interface GenerationLog {
  id: string;
  name_ko: string;
  description: string | null;
  phone: string | null;
  timestamp: string;
}

export default function AdminDataGeneratorPage() {
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [currentJob, setCurrentJob] = useState<any>(null); 
  const [logs, setLogs] = useState<GenerationLog[]>([]); 
  
  const isRunningRef = useRef(false);

  const processNextGeneration = async () => {
    if (!isRunningRef.current) return;

    try {
      // 1. description이 비어있는(null) 데이터 1개 조회
      const { data, error } = await supabase
        .from('places')
        .select('id, name_ko, address')
        .is('description', null)
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code === 'PGRST116') {
        setIsFinished(true);
        setIsAutoRunning(false);
        isRunningRef.current = false;
        setCurrentJob(null);
        return;
      }

      if (!data) return;

      setCurrentJob({ ...data, status: 'generating' });

      // 2. AI 데이터 생성 및 DB 업데이트 호출 (백엔드 통합 API)
      const generateRes = await fetch('/api/admin/generate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: data.id, 
          name_ko: data.name_ko, 
          address: data.address || '주소 없음' 
        }),
      });

      if (!generateRes.ok) {
        const errData = await generateRes.json();
        throw new Error(errData.error || 'AI 데이터 생성 통신 에러');
      }
      
      const { data: generatedData } = await generateRes.json();

      setCurrentJob({ ...data, status: 'done', ...generatedData });

      // 3. 완료 로그 추가
      const newLog: GenerationLog = {
        id: data.id,
        name_ko: data.name_ko,
        description: generatedData.description,
        phone: generatedData.phone,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setLogs((prev) => [newLog, ...prev]);

      // 4. Rate Limit 방지를 위해 1.5초 대기 후 다음 작업 실행 (GPT-4o 호출이므로 여유있게)
      if (isRunningRef.current) {
        setTimeout(() => {
          processNextGeneration();
        }, 1500);
      }

    } catch (error) {
      console.error('자동화 루프 에러:', error);
      setIsAutoRunning(false);
      isRunningRef.current = false;
      alert('데이터 생성 중 에러가 발생하여 일시 정지되었습니다. 콘솔을 확인해주세요.');
    }
  };

  const handleStart = () => {
    setIsAutoRunning(true);
    isRunningRef.current = true;
    processNextGeneration();
  };

  const handleStop = () => {
    setIsAutoRunning(false);
    isRunningRef.current = false;
    setCurrentJob(null);
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#B28DFF] animate-pulse shadow-[0_0_8px_#B28DFF]"></span>
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Automation · AI Researcher</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              AI Data Generator
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              AI 설명과 카카오 검색 기반 연락처·공식 링크를 채웁니다. 운영시간과 휴무일은 생성하지 않습니다.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center text-right">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Items Generated</span>
              <span className="text-xl font-bold text-[#B28DFF]">{logs.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action Card */}
          <div className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-white mb-4">제어 패널 (Control Panel)</h2>
            {isFinished ? (
              <div className="bg-[#B28DFF]/10 border border-[#B28DFF]/30 text-[#B28DFF] font-bold p-4 rounded-xl text-center">
                🎉 모든 데이터 생성 완료!
              </div>
            ) : isAutoRunning ? (
              <button 
                onClick={handleStop}
                className="w-full bg-[#FF4C4C]/10 border border-[#FF4C4C]/50 text-[#FF4C4C] hover:bg-[#FF4C4C]/20 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 bg-[#FF4C4C] rounded-full animate-pulse"></span>
                자동화 중지 (Stop)
              </button>
            ) : (
              <button 
                onClick={handleStart}
                className="w-full bg-[#B28DFF] text-black font-bold py-4 rounded-xl hover:bg-[#9d73fc] transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(178,141,255,0.2)]"
              >
                ▶️ AI 생성 시작 (Start Batch)
              </button>
            )}
          </div>

          {/* Current Job Status Card */}
          <div className="md:col-span-2 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              실시간 작업 상태
              {isAutoRunning && <span className="text-[10px] bg-[#3EAEFF]/10 text-[#3EAEFF] px-2 py-0.5 rounded uppercase border border-[#3EAEFF]/20 animate-pulse">Running</span>}
            </h2>
            
            {currentJob ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#848A9C] font-bold">대상 원문:</span>
                  <p className="text-white font-bold text-lg">{currentJob.name_ko}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#848A9C] font-bold">작업 진행:</span>
                  {currentJob.status === 'generating' ? (
                    <p className="text-[#3EAEFF] font-mono text-sm animate-pulse flex items-center gap-2 mt-1">
                      <svg className="animate-spin h-4 w-4 text-[#3EAEFF]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      OpenAI 설명 작성 및 카카오 장소 검색 중...
                    </p>
                  ) : (
                    <p className="text-[#B28DFF] font-mono text-sm mt-1 flex items-center gap-2">
                      <span className="text-lg">✓</span> DB 반영 완료
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[100px] flex items-center justify-center text-[#5C657D] text-sm">
                대기 중 (시작 버튼을 눌러주세요)
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden flex flex-col h-[50vh]">
          <div className="flex items-center justify-between p-6 border-b border-[#2C2E38] bg-[#21232B]">
            <h2 className="text-sm font-bold text-white">✅ 생성 이력 (Generated Logs)</h2>
            <span className="text-[10px] text-[#848A9C]">최신순으로 표시됩니다.</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#5C657D] text-sm">
                아직 생성된 데이터가 없습니다.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1A1C23] text-[#848A9C] sticky top-0 border-b border-[#2C2E38] z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold w-[100px]">Time</th>
                    <th className="px-6 py-4 font-bold w-[25%]">Place Name</th>
                    <th className="px-6 py-4 font-bold w-[45%]">Generated Description</th>
                    <th className="px-6 py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2E38]">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[#21232B] transition-colors">
                      <td className="px-6 py-4 text-[#5C657D] font-mono text-xs">{log.timestamp}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-1">{log.name_ko}</div>
                        <div className="text-[10px] text-[#A0A5B5] font-mono">{log.phone || '번호 없음'}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-[#2C2E38]/50 bg-[#21232B]/30">
                        <div className="text-xs text-[#A0A5B5] line-clamp-3 leading-relaxed">
                          {log.description || '설명 생성 실패'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-[#B28DFF]/10 text-[#B28DFF] text-[10px] font-bold">
                          Updated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
