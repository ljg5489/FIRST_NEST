import type { Metadata } from "next";
import { TERMS_VERSION } from "@/features/auth/constants";
import { legalOperator } from "@/features/legal/config";

export const metadata: Metadata = { title: "이용약관 | TRAVEL WITH ME" };

export default function TermsPage() {
  return (
    <main className="page-shell">
      <p className="section-label">LEGAL</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">이용약관</h1>
      <p className="mt-3 text-sm text-[#5d675f]">시행일 및 버전: {TERMS_VERSION}</p>

      <article className="soft-card mt-6 grid gap-7 rounded-xl p-5 text-sm leading-7 text-[#3d4941] sm:p-8">
        <section>
          <h2 className="text-lg font-black text-[#17211b]">1. 목적과 운영자</h2>
          <p className="mt-2">이 약관은 {legalOperator.name}(이하 “운영자”)가 제공하는 TRAVEL WITH ME의 관광정보 조회, AI 여행 코스 추천 및 코스 저장 서비스 이용 조건을 정합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">2. 계정</h2>
          <p className="mt-2">회원은 본인이 관리하는 이메일을 사용해야 하며 로그인 정보를 안전하게 관리해야 합니다. 현재 법정대리인 동의 확인 절차를 제공하지 않으므로 만 14세 미만은 회원가입할 수 없습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">3. 관광정보와 AI 추천</h2>
          <p className="mt-2">관광정보, 거리, 운영시간, 비용 및 AI 추천 결과는 공공데이터와 외부 API를 바탕으로 한 참고 정보입니다. 실제 방문 전 해당 시설과 교통기관의 최신 정보를 확인해야 합니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">4. 금지행위</h2>
          <p className="mt-2">다른 사람의 계정 사용, 서비스 장애를 유발하는 행위, 자동화된 대량 요청, 데이터·콘텐츠의 권리를 침해하는 행위를 해서는 안 됩니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">5. 서비스 변경과 중단</h2>
          <p className="mt-2">운영자는 유지보수, 외부 API 장애 또는 불가피한 사유가 있을 때 서비스를 변경하거나 일시 중단할 수 있습니다. 중요한 변경은 서비스 화면을 통해 알립니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">6. 탈퇴</h2>
          <p className="mt-2">회원은 내 계정 화면에서 언제든 탈퇴할 수 있습니다. 탈퇴하면 계정과 저장한 코스가 삭제되며 복구할 수 없습니다.</p>
        </section>
        <section>
          <h2 className="text-lg font-black text-[#17211b]">7. 문의와 준거법</h2>
          <p className="mt-2">문의처: {legalOperator.privacyContact}. 이 약관에는 대한민국 법률을 적용합니다.</p>
        </section>
      </article>
    </main>
  );
}
