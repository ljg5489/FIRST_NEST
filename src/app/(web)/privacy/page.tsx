import type { Metadata } from "next";
import { PRIVACY_VERSION } from "@/features/auth/constants";
import { isLegalOperatorConfigured, legalOperator } from "@/features/legal/config";

export const metadata: Metadata = { title: "개인정보 처리방침 | TRAVEL WITH ME" };

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
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Supabase: 회원 인증과 데이터베이스 운영. 현재 프로젝트 데이터베이스 리전은 대한민국 서울입니다.</li>
            <li>Vercel: 웹 애플리케이션 배포와 접속 로그 처리.</li>
            <li>OpenAI API: 계정 이메일이나 회원 식별값을 제외한 여행 조건을 이용한 추천 문장 생성.</li>
          </ul>
          <p className="mt-3">운영자는 실제 배포 계약, 처리 국가와 보유기간을 확정한 뒤 국외 처리·보관이 발생하는 항목을 이 방침에 구체적으로 반영하고 필요한 보호조치를 적용합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">5. 위치정보</h2>
          <p className="mt-2">현재 회원의 실시간 위치를 계정에 저장하지 않습니다. 향후 개인위치정보를 저장·이용하는 기능을 추가할 경우 위치정보 관련 약관과 동의 절차를 별도로 제공합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">6. 파기</h2>
          <p className="mt-2">회원 탈퇴 또는 목적 달성 시 개인정보를 지체 없이 삭제합니다. 법령에 따라 보존해야 하는 정보가 생기는 경우 해당 정보만 분리해 법정 기간 동안 보관한 뒤 파기합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">7. 정보주체의 권리</h2>
          <p className="mt-2">회원은 내 계정에서 계정 정보와 동의 이력을 확인하고 탈퇴할 수 있으며, 문의처를 통해 열람·정정·삭제·처리정지 및 동의 철회를 요청할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">8. 안전성 확보조치</h2>
          <p className="mt-2">접근권한 최소화, RLS에 의한 사용자별 데이터 분리, 전송구간 암호화, 관리자 비밀키의 서버 전용 보관과 접속기록 점검을 적용합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">9. 방침 변경</h2>
          <p className="mt-2">내용이 변경되면 시행 전에 서비스 화면을 통해 알리고, 새 동의가 필요한 변경은 별도 동의를 받습니다.</p>
        </section>
      </article>
    </main>
  );
}
