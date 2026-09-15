import Link from 'next/link';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {TravelNav} from './TravelNav';
import {TravelIcon} from './TravelIcon';
export async function SiteHeader(){
 const supabase=await createServerSupabaseClient();
 const {data}=await supabase.auth.getClaims();
 return <header className="travel-header"><div className="header-inner"><Link href="/" className="brand-name" aria-label="travel with me 홈">travel with me<span>.</span></Link><TravelNav/><div className="header-account"><Link href={data?.claims?.sub?'/account':'/login'}><TravelIcon name="user" size={18}/>{data?.claims?.sub?'내 계정':'로그인 / 회원가입'}</Link></div></div></header>;
}
