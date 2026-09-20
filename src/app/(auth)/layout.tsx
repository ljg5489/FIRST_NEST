import Link from "next/link";
import {getServerLocale} from "@/features/i18n/server";
import {I18nProvider} from "@/features/i18n/I18nProvider";
import {translate} from "@/features/i18n/messages";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const t = (source:string) => translate(locale, source);
  return (
    <I18nProvider locale={locale}><div className="travel-site auth-site">
      <header className="auth-header">
        <div className="header-inner">
          <Link href="/" className="brand-name" aria-label={`travel with me ${t("홈")}`}>
            travel with me<span>.</span>
          </Link>
          <Link href="/" className="auth-home-link">{t("여행 둘러보기 ↗")}</Link>
        </div>
      </header>
      {children}
      <footer className="mx-auto flex w-full max-w-[980px] flex-wrap justify-center gap-4 px-4 pb-10 text-xs text-[#667165]">
        <Link href="/terms">{t("이용약관")}</Link>
        <Link href="/privacy">{t("개인정보 처리방침")}</Link>
      </footer>
    </div></I18nProvider>
  );
}
