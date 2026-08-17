// 파일 위치: src/app/(web)/layout.tsx
// 웹 화면 그룹 레이아웃 파일
import type { Metadata } from 'next'
import { BottomNav } from './components/BottomNav'
import { SiteHeader } from './components/SiteHeader'

export const metadata: Metadata = {
  title: 'TRAVEL WITH ME',
  description: '공공데이터 기반 스마트 관광 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <BottomNav />
    </>
  )
}
