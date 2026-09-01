import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm";

export const metadata: Metadata = { title: "회원가입 | TRAVEL WITH ME" };

export default function SignupPage() {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-6 px-4 py-12 sm:py-16">
      <section className="soft-card rounded-xl p-5 sm:p-7">
        <p className="section-label">JOIN</p>
        <h1 className="mt-2 text-2xl font-black">회원가입</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">이메일만 수집하며, 실명·주민등록번호·휴대폰 번호는 받지 않습니다.</p>
        <div className="mt-6"><AuthForm mode="signup" /></div>
      </section>
    </main>
  );
}
