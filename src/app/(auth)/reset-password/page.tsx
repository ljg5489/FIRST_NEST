import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm";
import {getServerLocale} from "@/features/i18n/server";
import {translate} from "@/features/i18n/messages";

export const metadata: Metadata = { title: "새 비밀번호 | travel with me" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const locale=await getServerLocale(); const t=(source:string)=>translate(locale,source);
  return (
    <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-12 sm:py-16">
      <section className="soft-card rounded-xl p-5 sm:p-7">
        <p className="section-label">PASSWORD</p>
        <h1 className="mt-2 text-2xl font-black">{t('새 비밀번호 설정')}</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">{t('영문과 숫자를 포함해 8자 이상으로 설정해 주세요.')}</p>
        <div className="mt-6"><AuthForm mode="reset-password" /></div>
      </section>
    </main>
  );
}
