import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "@/features/auth/constants";
import { recordCurrentConsentAction } from "@/features/auth/server/actions";
import { DeleteAccountForm } from "@/features/auth/ui/DeleteAccountForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "내 계정 | TRAVEL WITH ME" };
export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/account");
  }

  const params = await searchParams;
  const { data: consents } = await supabase
    .from("user_consents")
    .select(
      "terms_version, privacy_version, terms_accepted_at, privacy_accepted_at, age_14_or_over_confirmed_at",
    )
    .order("created_at", { ascending: false });

  const latestConsent = consents?.[0] ?? null;
  const needsCurrentConsent =
    !latestConsent ||
    latestConsent.terms_version !== TERMS_VERSION ||
    latestConsent.privacy_version !== PRIVACY_VERSION;
  const email =
    typeof claimsData.claims.email === "string" ? claimsData.claims.email : "이메일 확인 불가";
  const passwordUpdated = params.password === "updated";
  const consentRecorded = params.consent === "recorded";
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="page-shell">
      <p className="section-label">/account</p>
      <h1 className="mt-2 text-2xl font-black sm:text-3xl">내 계정</h1>
      <p className="mt-3 max-w-2xl text-[#4f5b52]">로그인 정보와 동의 이력을 확인하고 계정을 관리합니다.</p>

      {passwordUpdated ? (
        <p className="mt-6 rounded-md bg-[#e8f1eb] px-4 py-3 text-sm text-[#174d3c]">비밀번호가 변경됐습니다.</p>
      ) : null}
      {consentRecorded ? (
        <p className="mt-6 rounded-md bg-[#e8f1eb] px-4 py-3 text-sm text-[#174d3c]">현재 이용약관과 개인정보 처리방침 동의가 기록됐습니다.</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[#fff0ed] px-4 py-3 text-sm text-[#9f321f]">
          {error === "confirmation"
            ? "확인 문구를 정확히 입력해 주세요."
            : error === "consent"
              ? "필수 확인 및 동의 항목을 모두 선택해 주세요."
              : error === "consent-save"
                ? "동의 이력을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
                : "계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."}
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="soft-card rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-black">로그인 정보</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="text-[#667165]">이메일</dt>
              <dd className="mt-1 font-bold">{email}</dd>
            </div>
            <div>
              <dt className="text-[#667165]">회원 식별값</dt>
              <dd className="mt-1 break-all font-mono text-xs text-[#5d675f]">{userId}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/forgot-password" className="primary-button">비밀번호 변경</a>
            <form action="/auth/signout" method="post">
              <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#dce2d7] bg-white px-5 py-3 text-sm font-black text-[#3d4941]">로그아웃</button>
            </form>
          </div>
        </section>

        <section className="soft-card rounded-xl p-5 sm:p-6">
          <h2 className="text-lg font-black">필수 동의 이력</h2>
          {latestConsent && !needsCurrentConsent ? (
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-[#667165]">이용약관 버전</dt>
                <dd className="mt-1 font-bold">{latestConsent.terms_version}</dd>
              </div>
              <div>
                <dt className="text-[#667165]">개인정보 처리방침 버전</dt>
                <dd className="mt-1 font-bold">{latestConsent.privacy_version}</dd>
              </div>
              <div>
                <dt className="text-[#667165]">동의 일시</dt>
                <dd className="mt-1 font-bold">{new Date(latestConsent.terms_accepted_at).toLocaleString("ko-KR")}</dd>
              </div>
            </dl>
          ) : (
            <form action={recordCurrentConsentAction} className="mt-4 grid gap-3 text-sm">
              <p className="leading-6 text-[#5d675f]">
                과거 동의를 임의로 소급 기록하지 않았습니다. 현재 문서를 확인한 뒤 직접 동의해 주세요.
              </p>
              <label className="flex items-start gap-3">
                <input className="mt-1" type="checkbox" name="ageConfirmed" required />
                <span>만 14세 이상입니다.</span>
              </label>
              <label className="flex items-start gap-3">
                <input className="mt-1" type="checkbox" name="termsAccepted" required />
                <span>
                  <Link href="/terms" target="_blank" className="font-bold text-[#174d3c] underline">이용약관</Link>에 동의합니다.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input className="mt-1" type="checkbox" name="privacyAccepted" required />
                <span>
                  <Link href="/privacy" target="_blank" className="font-bold text-[#174d3c] underline">개인정보 처리방침</Link>을 확인하고 동의합니다.
                </span>
              </label>
              <button type="submit" className="primary-button mt-2 border-0">동의하고 계속하기</button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-[#efc7bf] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-black text-[#9f321f]">회원 탈퇴</h2>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">계정, 저장한 코스와 동의 기록이 삭제됩니다. 삭제 후에는 복구할 수 없습니다.</p>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
