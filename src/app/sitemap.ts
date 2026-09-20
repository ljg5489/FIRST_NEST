// 파일 위치: src/app/sitemap.ts
// 파일 명: sitemap.ts

import type {MetadataRoute} from 'next';
import {getAttractions} from '@/lib/data';
import {supabase} from '@/services/supabase/client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://first-nest-chi.vercel.app';

type SitemapPlace = {id:string;updated_at?:string|null};

async function getSitemapPlaces(): Promise<SitemapPlace[]> {
  const places:SitemapPlace[]=[];
  const pageSize=1000;

  for(let from=0;;from+=pageSize) {
    const {data,error}=await supabase
      .from('places')
      .select('id,updated_at')
      .eq('is_active',true)
      .order('id',{ascending:true})
      .range(from,from+pageSize-1);

    if(error) {
      console.error('[오류] 사이트맵 관광지 조회 에러:',error.message);
      return await getAttractions().catch(()=>[]) as SitemapPlace[];
    }

    places.push(...(data ?? []));
    if(!data || data.length<pageSize) break;
  }

  return places;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {url:siteUrl,lastModified:now,changeFrequency:'weekly',priority:1},
    {url:`${siteUrl}/explore`,lastModified:now,changeFrequency:'daily',priority:0.9},
    {url:`${siteUrl}/recommend`,lastModified:now,changeFrequency:'monthly',priority:0.8},
    {url:`${siteUrl}/terms`,lastModified:now,changeFrequency:'yearly',priority:0.2},
    {url:`${siteUrl}/privacy`,lastModified:now,changeFrequency:'yearly',priority:0.2},
  ];

  const attractions = await getSitemapPlaces();
  return [
    ...staticPages,
    ...attractions.map((place:SitemapPlace) => ({
      url:`${siteUrl}/attractions/${place.id}`,
      lastModified:place.updated_at ? new Date(place.updated_at) : now,
      changeFrequency:'monthly' as const,
      priority:0.7,
    })),
  ];
}
