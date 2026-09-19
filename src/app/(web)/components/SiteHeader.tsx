// 파일 위치: src/app/(web)/components/SiteHeader.tsx
// 파일 명: SiteHeader.tsx

import Link from 'next/link';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {LanguageSwitcher} from '@/features/i18n/LanguageSwitcher';
import {navigationMessages,type Locale} from '@/features/i18n/config';
import {TravelNav} from './TravelNav';
import {TravelIcon} from './TravelIcon';
export async function SiteHeader({locale}:{locale:Locale}){
 const supabase=await createServerSupabaseClient();
 const {data}=await supabase.auth.getClaims();
 const messages=navigationMessages[locale];
 return <header className="travel-header"><div className="header-inner"><Link href="/" className="brand-name" aria-label={`travel with me ${messages.home}`}>travel with me<span>.</span></Link><TravelNav locale={locale}/><div className="header-actions"><div className="header-account"><Link href={data?.claims?.sub?'/account':'/login'}><TravelIcon name="user" size={18}/>{data?.claims?.sub?messages.account:messages.login}</Link></div><LanguageSwitcher locale={locale}/></div></div></header>;
}
