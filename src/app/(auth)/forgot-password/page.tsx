import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm";
import {getServerLocale} from "@/features/i18n/server";
import {translate} from "@/features/i18n/messages";

export const metadata: Metadata = { title: "비밀번호 찾기 | travel with me" };

export default async function ForgotPasswordPage() {
  const locale=await getServerLocale(); const t=(source:string)=>translate(locale,source);
  return (
    <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-12 sm:py-16">
      <section className="soft-card rounded-xl p-5 sm:p-7">
        <p className="section-label">PASSWORD</p>
        <h1 className="mt-2 text-2xl font-black">{t('비밀번호 재설정')}</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">{t('가입한 이메일로 안전한 재설정 링크를 보내드립니다.')}</p>
        <div className="mt-6"><AuthForm mode="forgot-password" /></div>
      </section>
    </main>
  );
}
