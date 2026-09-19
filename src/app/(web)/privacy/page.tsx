// 파일 위치: src/app/(web)/privacy/page.tsx
// 파일 명: page.tsx

import type { Metadata } from "next";
import { PRIVACY_VERSION } from "@/features/auth/constants";
import { isLegalOperatorConfigured, legalOperator } from "@/features/legal/config";

export const metadata: Metadata = { title: "개인정보 처리방침 | travel with me" };

export default function PrivacyPage() {
  const isConfigured = isLegalOperatorConfigured();

  return (
    <main className="page-shell">
      <p className="section-label">PRIVACY</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">개인정보 처리방침</h1>
      <p className="mt-3 text-sm text-[#5d675f]">시행일 및 버전: {PRIVACY_VERSION}</p>

      {!isConfigured ? (
        <p className="mt-6 rounded-md bg-[#fff7e6] px-4 py-3 text-sm leading-6 text-[#8a6d00]">개발 환경 안내: 실제 서비스 공개 전 운영자명과 개인정보 문의 이메일을 환경 변수로 반드시 설정해야 합니다.</p>
      ) : null}

      <article className="soft-card mt-6 grid gap-7 rounded-xl p-5 text-sm leading-7 text-[#3d4941] sm:p-8">
        <section>
          <h2 className="text-lg font-black text-[#17211b]">1. 개인정보처리자</h2>
          <p className="mt-2">처리자: {legalOperator.name}</p>
          <p>개인정보 문의: {legalOperator.privacyContact}</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">2. 처리 목적과 항목</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead><tr className="border-b border-[#dce2d7]"><th className="p-2">목적</th><th className="p-2">필수 항목</th><th className="p-2">보유기간</th></tr></thead>
              <tbody>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">회원가입·로그인·계정 복구</td><td className="p-2">이메일, 내부 회원 식별값, 인증정보</td><td className="p-2">회원 탈퇴 시까지</td></tr>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">필수 동의 이력 관리</td><td className="p-2">약관·처리방침 버전과 동의 시각, 만 14세 이상 확인 시각</td><td className="p-2">회원 탈퇴 시까지</td></tr>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">여행 코스 저장</td><td className="p-2">저장한 코스, 경유지, 이동정보</td><td className="p-2">회원이 삭제하거나 탈퇴할 때까지</td></tr>
                <tr><td className="p-2">보안·장애 대응</td><td className="p-2">접속 시각, IP 주소, 기기·브라우저 정보 등 서비스 로그</td><td className="p-2">보안 목적 달성 또는 관계 법령상 기간까지</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">비밀번호는 인증 제공자인 Supabase가 암호화 방식으로 처리하며 운영자는 원문을 조회하지 않습니다. 주민등록번호, 실명, 휴대폰 번호와 생년월일은 수집하지 않습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">3. 처리 근거</h2>
          <p className="mt-2">회원 계정과 저장 기능 제공을 위한 계약 체결·이행 및 회원이 표시한 필수 동의를 근거로 처리합니다. 필수정보 제공을 거부하면 회원 기능은 이용할 수 없지만 비회원 관광정보 조회는 계속 이용할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">4. 처리위탁과 외부 서비스</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="border-b border-[#dce2d7]"><th className="p-2">수탁자</th><th className="p-2">업무</th><th className="p-2">처리 항목</th><th className="p-2">보유기간</th></tr></thead>
              <tbody>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">Supabase, Inc.</td><td className="p-2">회원 인증·데이터베이스</td><td className="p-2">이메일, 내부 회원 식별값, 동의 이력, 저장 코스</td><td className="p-2">계정 삭제 또는 계약 종료 시까지. 법령상 보존 의무가 있으면 해당 기간</td></tr>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">Vercel Inc.</td><td className="p-2">웹 호스팅·배포·보안 로그</td><td className="p-2">IP 주소, 요청·브라우저·오류 로그</td><td className="p-2">서비스 설정과 계약에 따른 기간. 삭제 요청 또는 계약 종료 시 삭제하되 법적 의무가 있으면 예외</td></tr>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">OpenAI, L.L.C.</td><td className="p-2">여행 추천 설명 생성</td><td className="p-2">선택한 여행 조건과 관광지명. 이메일과 회원 식별값은 전송하지 않음</td><td className="p-2">기본 API 악용 모니터링 로그는 최대 30일. 법적·보안상 필요한 경우 예외</td></tr>
                <tr><td className="p-2">Kakao Corp.</td><td className="p-2">지도·길찾기·장소 검색</td><td className="p-2">검색어, 장소 좌표, IP 주소와 브라우저 정보</td><td className="p-2">카카오의 서비스 운영정책과 관계 법령에 따른 기간</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Supabase의 주 데이터베이스는 대한민국 서울 리전에 두고 있습니다. 외부 서비스는 각 제공자가 공개한 보안·개인정보 보호 기준과 실제 이용 계약에 따라 접근을 통제합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">5. 국외 이전</h2>
          <p className="mt-2">Vercel과 OpenAI 이용 과정에서 아래 정보가 서비스 요청 시 암호화된 통신으로 국외 이전될 수 있습니다.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="border-b border-[#dce2d7]"><th className="p-2">이전받는 자</th><th className="p-2">국가·시점·방법</th><th className="p-2">목적·항목·기간</th></tr></thead>
              <tbody>
                <tr className="border-b border-[#edf0ea]"><td className="p-2">Vercel Inc.</td><td className="p-2">미국 및 공개된 하위처리자 소재국 / 웹 요청·배포 시 / 암호화 전송</td><td className="p-2">호스팅과 보안 운영 / 접속·오류 로그 / 위탁업무 종료 또는 계약·법령상 기간까지</td></tr>
                <tr><td className="p-2">OpenAI, L.L.C.</td><td className="p-2">미국 및 공개된 하위처리자 소재국 / 추천 설명 요청 시 / 암호화 전송</td><td className="p-2">추천 설명 생성 / 여행 조건·관광지명 / 기본 악용 모니터링 로그 최대 30일</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">OpenAI API로 전송된 데이터는 기본적으로 모델 학습에 사용되지 않습니다. 이용자는 국외 이전을 원하지 않으면 AI 추천 설명 생성을 이용하지 않거나 개인정보 문의처로 처리를 요청할 수 있으며, 이 경우 해당 설명 기능이 제한될 수 있습니다.</p>
          <p className="mt-2">세부 기준: <a className="font-bold underline" href="https://vercel.com/legal/dpa" target="_blank" rel="noreferrer">Vercel 데이터 처리 계약</a>, <a className="font-bold underline" href="https://platform.openai.com/docs/models/default-usage-policies-by-endpoint" target="_blank" rel="noreferrer">OpenAI API 데이터 보유 정책</a>, <a className="font-bold underline" href="https://supabase.com/docs/guides/platform/regions" target="_blank" rel="noreferrer">Supabase 리전 안내</a></p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">6. 쿠키·로컬 저장소와 행태정보</h2>
          <p className="mt-2">로그인 상태 유지와 보안을 위해 Supabase 인증 쿠키 등 서비스에 필요한 저장기술을 사용합니다. 여행 조건과 임시 일정 등 일부 기능은 브라우저 로컬·세션 저장소를 사용할 수 있으며, 브라우저 설정에서 직접 삭제할 수 있습니다. 계정에 저장된 코스는 서비스 화면에서 삭제하거나 회원 탈퇴 시 함께 삭제할 수 있습니다.</p>
          <p className="mt-2">현재 맞춤형 광고, 광고 식별자 또는 제3자 행태분석 도구를 사용하지 않습니다. 향후 광고나 분석 도구를 도입하면 수집 항목, 목적, 보유기간, 거부 방법을 사전에 고지하고 필요한 동의를 받습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">7. 위치정보</h2>
          <p className="mt-2">현재 회원의 실시간 위치를 계정에 저장하지 않습니다. 향후 개인위치정보를 저장·이용하는 기능을 추가할 경우 위치정보 관련 약관과 동의 절차를 별도로 제공합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">8. AI 추천 정보와 자동화 처리</h2>
          <p className="mt-2">AI는 이미 선택된 여행 조건과 관광지명을 바탕으로 추천 이유를 설명하며, 운영시간·휴무일·요금 같은 사실정보를 생성하지 않습니다. AI 설명은 법적 효과 또는 이에 준하는 중대한 영향을 주는 자동화 결정에 사용되지 않으며, 이용자는 결과를 다시 생성하거나 저장하지 않을 수 있습니다.</p>
          <p className="mt-2">운영시간과 휴무일은 TourAPI 원본 출처가 확인되는 경우에만 참고정보로 표시합니다. 출처가 없거나 최신성을 확인할 수 없으면 정확한 값을 숨기고 “방문 전 확인 필요”로 안내합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">9. 파기</h2>
          <p className="mt-2">회원 탈퇴 또는 목적 달성 시 개인정보를 지체 없이 삭제합니다. 법령에 따라 보존해야 하는 정보가 생기는 경우 해당 정보만 분리해 법정 기간 동안 보관한 뒤 파기합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">10. 정보주체의 권리</h2>
          <p className="mt-2">회원은 내 계정에서 계정 정보와 동의 이력을 확인하고 탈퇴할 수 있으며, 문의처를 통해 열람·정정·삭제·처리정지 및 동의 철회를 요청할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">11. 안전성 확보조치</h2>
          <p className="mt-2">접근권한 최소화, RLS에 의한 사용자별 데이터 분리, 전송구간 암호화, 관리자 비밀키의 서버 전용 보관, 보안 응답 헤더와 접속기록 점검을 적용합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">12. 방침 변경</h2>
          <p className="mt-2">내용이 변경되면 시행 전에 서비스 화면을 통해 알리고, 새 동의가 필요한 변경은 별도 동의를 받습니다.</p>
        </section>
      </article>
    </main>
  );
}
