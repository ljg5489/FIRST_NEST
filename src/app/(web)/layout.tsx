// 파일 위치: src/app/(web)/layout.tsx
// 웹 화면 그룹 레이아웃 파일
import { BottomNav } from './components/BottomNav'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { getServerLocale } from '@/features/i18n/server'
import { I18nProvider } from '@/features/i18n/I18nProvider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getServerLocale()

  return (
    <I18nProvider locale={locale}><div className="travel-site">
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter locale={locale} />
      <BottomNav locale={locale} />
    </div></I18nProvider>
  )
}
