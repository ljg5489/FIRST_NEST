// 파일 위치: src/app/sitemap.ts
// 파일 명: sitemap.ts

import type {MetadataRoute} from 'next';
import {getAttractions} from '@/lib/data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://first-nest-chi.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {url:siteUrl,lastModified:now,changeFrequency:'weekly',priority:1},
    {url:`${siteUrl}/explore`,lastModified:now,changeFrequency:'daily',priority:0.9},
    {url:`${siteUrl}/recommend`,lastModified:now,changeFrequency:'monthly',priority:0.8},
    {url:`${siteUrl}/terms`,lastModified:now,changeFrequency:'yearly',priority:0.2},
    {url:`${siteUrl}/privacy`,lastModified:now,changeFrequency:'yearly',priority:0.2},
  ];

  const attractions = await getAttractions().catch(() => []);
  return [
    ...staticPages,
    ...attractions.map((place:{id:string;updated_at?:string|null}) => ({
      url:`${siteUrl}/attractions/${place.id}`,
      lastModified:place.updated_at ? new Date(place.updated_at) : now,
      changeFrequency:'monthly' as const,
      priority:0.7,
    })),
  ];
}
