import './globals.css'
import React from 'react'

export const metadata = {
  title: 'travel with me',
  description: '취향에 맞는 충남 여행지를 발견하고 나만의 여행 일정을 만들어 보세요.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  )
}
