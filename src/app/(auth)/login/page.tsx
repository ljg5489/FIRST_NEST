import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm";
import { getSafeNextPath } from "@/features/auth/server/redirect";

export const metadata: Metadata = { title: "로그인 | TRAVEL WITH ME" };

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = getSafeNextPath(rawNext);
  const confirmed = params.confirmed === "true";
  const loggedOut = params.loggedOut === "true";
  const confirmationError = params.error === "confirmation";

  return (
    <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-12 sm:py-16">
      <section className="soft-card rounded-xl p-5 sm:p-7">
        <p className="section-label">ACCOUNT</p>
        <h1 className="mt-2 text-2xl font-black">로그인</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">저장한 여행 코스와 일정을 안전하게 관리하세요.</p>
        {confirmed ? (
          <p className="mt-5 rounded-md bg-[#e8f1eb] px-4 py-3 text-sm text-[#174d3c]">이메일 확인이 완료됐습니다. 로그인해 주세요.</p>
        ) : null}
        {loggedOut ? (
          <p className="mt-5 rounded-md bg-[#e8f1eb] px-4 py-3 text-sm text-[#174d3c]">안전하게 로그아웃됐습니다.</p>
        ) : null}
        {confirmationError ? (
          <p role="alert" className="mt-5 rounded-md bg-[#fff0ed] px-4 py-3 text-sm text-[#9f321f]">확인 링크가 만료됐거나 올바르지 않습니다. 회원가입 또는 비밀번호 재설정을 다시 진행해 주세요.</p>
        ) : null}
        <div className="mt-6"><AuthForm mode="login" next={next} /></div>
      </section>
    </main>
  );
}
