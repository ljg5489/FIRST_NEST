import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      <header className="border-b border-[#dce2d7] bg-white/90">
        <div className="mx-auto flex min-h-16 w-full max-w-[980px] items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#174d3c] text-sm text-white">T</span>
            <span>TRAVEL WITH ME</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-[#5d675f] hover:text-[#174d3c]">홈으로</Link>
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
