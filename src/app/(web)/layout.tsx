// 파일 위치: src/app/(web)/layout.tsx
// 웹 화면 그룹 레이아웃 파일
import type { Metadata } from 'next'
import { BottomNav } from './components/BottomNav'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'

export const metadata: Metadata = {
  title: 'travel with me · 나의 첫 번째 여행지',
  description: '공공데이터 기반 스마트 관광 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="travel-site">
      <SiteHeader />
      {children}
      <SiteFooter />
      <BottomNav />
    </div>
  )
}
