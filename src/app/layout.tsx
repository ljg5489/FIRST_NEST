import './globals.css'
import React from 'react'

export const metadata = {
  title: 'FIRST NEST',
  description: 'TRAVEL WITH ME — Admin and Web',
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
