// 파일 위치: src/app/admin/page.tsx
// 파일 명: page.tsx

import React from 'react';

const serverMetrics = {
  status: 'Operational',
  ping: '28ms',
  dbConnection: 'Active',
  apiCallsToday: '1,492',
};

const apiLogs = [
  { id: 1, method: 'POST', endpoint: '/api/recommend', status: 200, time: 'Just now', ms: 1450 },
  { id: 2, method: 'GET', endpoint: '/api/tourism/events', status: 200, time: '15m ago', ms: 85 },
  { id: 3, method: 'POST', endpoint: '/api/places/update', status: 200, time: '1h ago', ms: 120 },
  { id: 4, method: 'GET', endpoint: '/api/places?region=충남', status: 200, time: '3h ago', ms: 112 },
];

const roadmapData = [
  {
    week: '6월 말-7월 1주',
    phase: '기획 확정',
    progress: 100,
    items: [
      { name: '서비스 이름과 핵심 문장 확정', done: true },
      { name: '데이터 설계 초안 작성', done: true },
      { name: '화면 목록 확정', done: true },
      { name: '대표 여행자 3명 정의', done: true },
      { name: '데모 지역 확정', done: true },
    ],
  },
  {
    week: '7월 1-2주',
    phase: '프로젝트 기반 구축',
    progress: 83,
    items: [
      { name: 'Next.js 프로젝트 생성', done: true },
      { name: 'TypeScript, Tailwind CSS 설정', done: true },
      { name: 'Supabase 프로젝트 생성 및 연결', done: true },
      { name: '환경변수 구조 정리', done: true },
      { name: 'TourAPI, Kakao Map, AI API 키 발급', done: true },
      { name: 'Vercel 배포 테스트', done: false },
    ],
  },
  {
    week: '7월 2-3주',
    phase: '관광 데이터 구축',
    progress: 100,
    items: [
      { name: 'TourAPI에서 충남 관광지 수집', done: true },
      { name: '행사/축제 데이터 수집', done: true },
      { name: '이미지/위치 데이터 수집', done: true },
      { name: '지역, 카테고리, 관심사 태그 부여', done: true },
      { name: '외국인 친화 번역(Localization) 툴', done: true },
      { name: '데이터 출처 표시 구조 설계', done: true },
    ],
  },
  {
    week: '8월 1주',
    phase: '추천 엔진 개발',
    progress: 80,
    items: [
      { name: '일수 비례 코스 추천 로직', done: true },
      { name: '대표 여행자 기반 추천 UI', done: true },
      { name: '관심사 기반 DB 필터링', done: true },
      { name: 'AI 추천 이유 (OpenAI) 연동', done: true },
      { name: '지역 분산 조건 가중치 로직', done: false },
    ],
  },
  {
    week: '8월 3주',
    phase: '지도/동선 개발',
    progress: 60,
    items: [
      { name: 'Kakao Map 연동', done: true },
      { name: '관광지 마커 표시', done: true },
      { name: '카카오 모빌리티 거리 계산 API', done: true },
      { name: '코스 순서 표시', done: false },
      { name: '관광지별 길찾기 링크', done: false },
    ],
  }
];

const mvpFeatures = [
  { id: '01', title: '여행자 조건 시뮬레이션', desc: '국적, 일정, 관심사, 수단', status: 'active' },
  { id: '02', title: '대표 여행자 테스트', desc: 'Emma, Yuki, Minh', status: 'active' },
  { id: '03', title: '충남 관광지 탐색', desc: 'DB 연동 및 목록 조회', status: 'active' },
  { id: '04', title: 'AI 맞춤 코스 추천', desc: 'Rule-based + AI 스토리텔링', status: 'active' },
  { id: '05', title: '다국어 번역 (Localization)', desc: '영문 데이터 검증 및 저장', status: 'active' },
  { id: '06', title: 'DB 데이터 뷰어', desc: 'Supabase 전체 테이블 조회', status: 'active' },
  { id: '07', title: '지도와 길찾기', desc: '카카오맵 연동 및 마커', status: 'active' },
  { id: '08', title: '상세 및 출처', desc: 'TourAPI 출처 및 상세 표기', status: 'pending' },
  { id: '09', title: 'AI 결측치 생성기', desc: '설명/전화번호 등 AI 기반 자동화', status: 'active' },
];

const travelerProfiles = [
  { name: 'Emma', country: 'USA', focus: 'History', duration: '3D', score: 'High' },
  { name: 'Yuki', country: 'JPN', focus: 'Nature', duration: '2D', score: 'Mid' },
  { name: 'Minh', country: 'VNM', focus: 'Family', duration: '1D', score: 'High' },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#14151A] text-[#E0E2E8] pb-20 font-sans selection:bg-[#CEFF00] selection:text-black">
      
      {/* Sleek Header */}
      <header className="px-8 py-10 border-b border-[#2C2E38] bg-[#1A1C23]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#CEFF00] animate-pulse shadow-[0_0_8px_#CEFF00]"></span>
              <span className="text-[11px] font-bold text-[#A0A5B5] uppercase tracking-widest">Workspace · Travel With Me</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              DevOps Board
            </h1>
            <p className="text-[#848A9C] text-sm font-medium">
              MVP 데모 배포(26.09.05)를 위한 핵심 기능 테스트 및 시스템 관제 센터
            </p>
          </div>
          
          {/* Server Metrics Quick View */}
          <div className="flex gap-4">
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">Latency</span>
              <span className="text-lg font-bold text-white">{serverMetrics.ping}</span>
            </div>
            <div className="bg-[#21232B] border border-[#2C2E38] rounded-xl px-5 py-3 flex flex-col justify-center">
              <span className="text-[10px] text-[#848A9C] uppercase font-bold mb-1">API Calls (24h)</span>
              <span className="text-lg font-bold text-white">{serverMetrics.apiCallsToday}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* MVP Features Grid (Bento Box - Top Full Width) */}
        <section className="xl:col-span-12 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">MVP 테스트 허브</h2>
            <span className="text-xs font-bold text-[#CEFF00] bg-[#CEFF00]/10 px-3 py-1 rounded-full">8 Core Features</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mvpFeatures.map((feature) => (
              <button 
                key={feature.id} 
                className={`text-left p-4 rounded-xl border transition-all duration-200 group ${
                  feature.status === 'active' 
                    ? 'bg-[#21232B] border-[#393C4A] hover:border-[#CEFF00] hover:shadow-[0_4px_20px_rgba(206,255,0,0.05)]' 
                    : 'bg-[#181920] border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    feature.status === 'active' ? 'bg-[#CEFF00]/10 text-[#CEFF00]' : 'bg-[#2C2E38] text-[#848A9C]'
                  }`}>
                    FT_{feature.id}
                  </span>
                </div>
                <h3 className={`font-bold text-sm mb-1 ${feature.status === 'active' ? 'text-white' : 'text-[#A0A5B5]'}`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-[#848A9C] truncate">{feature.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Roadmap Column */}
        <section className="xl:col-span-8 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span>마스터 로드맵</span>
            <span className="text-[#848A9C] text-sm font-normal">Sprint Progress</span>
          </h2>
          <div className="space-y-4">
            {roadmapData.map((phase) => (
              <div key={phase.week} className="bg-[#21232B] rounded-xl p-5 border border-[#2C2E38] hover:border-[#393C4A] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#2C2E38]">
                  <div>
                    <p className="text-[10px] font-bold text-[#A0A5B5] mb-1">{phase.week}</p>
                    <h3 className="text-base font-bold text-white">{phase.phase}</h3>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="flex justify-between text-[11px] text-[#A0A5B5] mb-1.5 font-bold">
                      <span>Progress</span>
                      <span className={phase.progress === 100 ? 'text-[#CEFF00]' : 'text-white'}>{phase.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1C23] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${phase.progress === 100 ? 'bg-[#CEFF00]' : 'bg-[#5C657D]'}`} 
                        style={{ width: `${phase.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                  {phase.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-colors ${
                        item.done ? 'bg-[#CEFF00] text-black' : 'bg-[#2C2E38] text-transparent'
                      }`}>
                        <svg viewBox="0 0 14 14" fill="none" className="w-2.5 h-2.5 stroke-current stroke-2">
                          <path d="M3 7.5L5.5 10L11 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className={`text-[13px] ${item.done ? 'text-[#848A9C] line-through decoration-[#393C4A]' : 'text-[#E0E2E8]'}`}>
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* API Logs Widget */}
          <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">최근 API 호출</h2>
              <span className="text-[10px] bg-[#2C2E38] text-[#A0A5B5] px-2 py-1 rounded font-mono">Live</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              {apiLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2.5 bg-[#21232B] rounded-lg border border-[#2C2E38]">
                  <div className="flex items-center gap-3 truncate">
                    <span className={`font-bold ${
                      log.method === 'GET' ? 'text-[#3EAEFF]' : 'text-[#CEFF00]'
                    }`}>{log.method}</span>
                    <span className="text-[#A0A5B5] truncate max-w-[120px]">{log.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`${log.status >= 500 ? 'text-[#FF4C4C]' : 'text-white'}`}>{log.status}</span>
                    <span className="text-[#848A9C]">{log.ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Persona Widget */}
          <section className="bg-[#1A1C23] border border-[#2C2E38] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4">테스트 페르소나</h2>
            <div className="space-y-2">
              {travelerProfiles.map((traveler) => (
                <div key={traveler.name} className="flex items-center justify-between p-3 bg-[#21232B] rounded-xl border border-[#2C2E38] hover:border-[#393C4A] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2C2E38] rounded-lg flex items-center justify-center text-xs font-bold text-white">
                      {traveler.name[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white leading-tight">{traveler.name} <span className="text-[#848A9C] font-normal text-[11px] ml-1">{traveler.country}</span></p>
                      <p className="text-[11px] text-[#A0A5B5] mt-0.5">{traveler.focus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] font-bold text-[#CEFF00]">{traveler.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}