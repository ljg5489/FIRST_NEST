// 파일 위치: src/app/admin/prompt-test/page.tsx
// 파일 명: page.tsx

'use client';

import React, { useState } from 'react';

const DEFAULT_PROMPT = `
# ROLE
You are a professional local tour storyteller for Chungcheongnam-do, South Korea.
Your role is NOT to recommend destinations.
The itinerary has already been selected by our recommendation system.
Your only job is to explain why this itinerary suits the traveler.

# TRAVELER PROFILE
Name: Emma
Country: USA
Travel Focus: History and Local Food
Trip Duration: 3 Days

# CONFIRMED ITINERARY
1. 공주 공산성
2. 부여 부소산성
3. 서천 국립생태원

# STRICT RULES
- Do NOT add, remove, replace, or recommend any destinations.
- Do NOT invent facts.
- Keep the tone warm, elegant, and inspiring.

# TASK
Write a short personalized explanation (3–4 sentences) describing why this itinerary matches the traveler's interests.

# OUTPUT FORMAT
[ENGLISH]
(English explanation)

[KOREAN]
(Korean translation)
`.trim();

export default function AdminPromptLabPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestPrompt = async () => {
    if (!prompt.trim()) return alert('프롬프트를 입력해주세요.');
    
    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/admin/prompt-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '테스트 실패');
      }

      setResult(data.result);
    } catch (error: any) {
      setResult(`[ERROR] ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
            <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">AI Tools · Prompt Lab</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            LLM Prompt Playground
          </h1>
          <p className="text-[#848A9C] text-sm font-medium">
            코드 수정 없이 실시간으로 OpenAI 프롬프트를 테스트하고 결과물을 튜닝합니다.
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 h-[70vh]">
        
        {/* ==============================
            LEFT: Prompt Editor
        ============================== */}
        <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2C2E38] bg-[#21232B]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              📝 Prompt Editor
            </h2>
            <button 
              onClick={() => setPrompt(DEFAULT_PROMPT)}
              className="text-[10px] bg-[#2C2E38] hover:bg-[#393C4A] text-[#A0A5B5] px-3 py-1.5 rounded transition-colors"
            >
              Reset to Default
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full bg-[#14151A] text-[#A0A5B5] text-sm font-mono p-6 resize-none focus:outline-none focus:ring-1 focus:ring-[#CEFF00] custom-scrollbar leading-relaxed"
            placeholder="여기에 프롬프트를 입력하세요..."
          />
          <div className="p-4 border-t border-[#2C2E38] bg-[#21232B]">
            <button
              onClick={handleTestPrompt}
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                isLoading 
                  ? 'bg-[#2C2E38] text-[#848A9C] cursor-not-allowed'
                  : 'bg-[#CEFF00] text-black hover:bg-[#b5e600] hover:scale-[1.01]'
              }`}
            >
              {isLoading ? 'Generating Response...' : '🚀 Send to OpenAI'}
            </button>
          </div>
        </section>

        {/* ==============================
            RIGHT: LLM Output
        ============================== */}
        <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2C2E38] bg-[#21232B]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              ✨ Output Result
            </h2>
            <span className="text-[10px] text-[#CEFF00] border border-[#CEFF00]/20 bg-[#CEFF00]/10 px-2 py-0.5 rounded uppercase">
              gpt-4o-mini
            </span>
          </div>
          <div className="flex-1 w-full bg-[#181920] p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-[#3EAEFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#3EAEFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#3EAEFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-xs text-[#848A9C] font-mono animate-pulse">Waiting for LLM generation...</p>
              </div>
            ) : result ? (
              <pre className="text-sm text-white font-serif whitespace-pre-wrap leading-loose">
                {result}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center opacity-30">
                <p className="text-sm text-[#848A9C]">Send a prompt to see the result here.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}