import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="travel-site auth-site">
      <header className="auth-header">
        <div className="header-inner">
          <Link href="/" className="brand-name" aria-label="travel with me 홈">
            travel with me<span>.</span>
          </Link>
          <Link href="/" className="auth-home-link">여행 둘러보기 ↗</Link>
        </div>
      </header>
      {children}
      <footer className="mx-auto flex w-full max-w-[980px] flex-wrap justify-center gap-4 px-4 pb-10 text-xs text-[#667165]">
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy">개인정보 처리방침</Link>
      </footer>
    </div>
  );
}
