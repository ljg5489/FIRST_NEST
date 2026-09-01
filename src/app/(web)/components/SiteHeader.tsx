import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const desktopNavItems = [
  { href: "/", label: "홈" },
  { href: "/recommend", label: "조건 입력" },
  { href: "/results", label: "추천 결과" },
  { href: "/explore", label: "관광지 탐색" },
  { href: "/map", label: "지도" },
];

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  return (
    <header className="sticky top-0 z-10 border-b border-[#dce2d7] bg-[#f5f7f2]/94 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-[1180px] flex-col justify-center gap-3 px-4 py-2 sm:px-8 xl:min-h-16 xl:py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-base font-black tracking-normal xl:text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#174d3c] text-sm text-white xl:h-9 xl:w-9">
              T
            </span>
            <span>TRAVEL WITH ME</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-[#dce2d7] bg-white px-3 py-2 text-sm font-semibold text-[#5d675f] lg:inline">
              충남 스마트 관광 MVP
            </span>
            {isSignedIn ? (
              <>
                <Link
                  href="/account"
                  className="rounded-md border border-[#dce2d7] bg-white px-3 py-2 text-sm font-black text-[#174d3c]"
                >
                  내 계정
                </Link>
                <form action="/auth/signout" method="post" className="hidden sm:block">
                  <button
                    type="submit"
                    className="rounded-md px-3 py-2 text-sm font-bold text-[#5d675f] hover:bg-white hover:text-[#174d3c]"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-[#174d3c] px-3 py-2 text-sm font-black text-white"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
        <nav aria-label="주요 화면" className="hidden gap-2 overflow-x-auto pb-1 xl:flex">
          {desktopNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-[#3d4941] transition hover:bg-white hover:text-[#174d3c]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
