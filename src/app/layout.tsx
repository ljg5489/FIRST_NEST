// 파일 위치: src/app/layout.tsx
// 파일 명: layout.tsx

import './globals.css'
import type {Metadata} from 'next'
import React from 'react'
import {getServerLocale} from '@/features/i18n/server'
import {localeTag, translate} from '@/features/i18n/messages'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://first-nest-chi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default:'travel with me · 충남 맞춤 여행',template:'%s | travel with me'},
  description: '공공데이터로 충남 관광지를 찾고 취향, 일정, 예산에 맞는 여행 코스를 만들어 보세요.',
  applicationName: 'travel with me',
  alternates: {canonical:'/'},
  openGraph: {
    type:'website',
    url:'/',
    siteName:'travel with me',
    locale:'ko_KR',
    title:'travel with me · 충남 맞춤 여행',
    description:'공공데이터로 충남 관광지를 찾고 나만의 여행 코스를 만드는 스마트 관광 서비스',
  },
  twitter: {card:'summary_large_image',title:'travel with me · 충남 맞춤 여행',description:'충남 관광지 탐색과 맞춤 여행 코스 추천'},
  robots: {index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  verification: process.env.GOOGLE_SITE_VERIFICATION ? {google:process.env.GOOGLE_SITE_VERIFICATION} : undefined,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale()
  const description = translate(locale,'공공데이터로 충남 관광지를 찾고 취향, 일정, 예산에 맞는 여행 코스를 만들어 보세요.')
  const websiteJsonLd = {
    '@context':'https://schema.org',
    '@type':'WebSite',
    name:'travel with me',
    url:siteUrl,
    description,
    inLanguage:localeTag(locale),
    potentialAction:{'@type':'SearchAction',target:`${siteUrl}/explore?keyword={search_term_string}`,'query-input':'required name=search_term_string'},
  }
  return (
    <html lang={localeTag(locale)}>
      <head />
      <body className="bg-white text-black antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteJsonLd).replace(/</g,'\\u003c')}} />
        {children}
      </body>
    </html>
  )
}
