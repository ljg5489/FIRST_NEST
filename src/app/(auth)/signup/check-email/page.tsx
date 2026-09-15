import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이메일 인증 안내 | travel with me",
};

export default function SignupCheckEmailPage() {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-6 px-4 py-12 sm:py-16">
      <section
        className="soft-card rounded-xl p-6 text-center sm:p-8"
        aria-labelledby="email-confirmation-title"
      >
        <p className="section-label">EMAIL VERIFICATION</p>
        <h1 id="email-confirmation-title" className="mt-2 text-2xl font-black">
          이메일 인증을 완료해 주세요
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5d675f]">
          입력하신 이메일로 인증 링크를 보냈습니다.
          <br />
          받은편지함의 링크를 눌러 회원가입을 완료해 주세요.
        </p>
        <p className="mt-3 text-xs leading-5 text-[#667165]">
          메일이 보이지 않으면 스팸 메일함도 확인해 주세요.
        </p>
      </section>
    </main>
  );
}
