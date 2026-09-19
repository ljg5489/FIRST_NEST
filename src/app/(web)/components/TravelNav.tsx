// 파일 위치: src/app/(web)/components/TravelNav.tsx
// 파일 명: TravelNav.tsx

'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {navigationMessages,type Locale} from '@/features/i18n/config';
import {TravelIcon,type TravelIconName} from './TravelIcon';
export function TravelNav({mobile=false,locale}:{mobile?:boolean;locale:Locale}) {
  const path=usePathname();
  const messages=navigationMessages[locale];
  const items:{href:string;label:string;icon:TravelIconName}[]=[{href:'/',label:messages.home,icon:'home'},{href:'/explore',label:messages.explore,icon:'search'},{href:'/recommend',label:messages.recommend,icon:'sparkles'},{href:'/account',label:messages.myTrip,icon:'user'}];
  return <nav className={mobile?'mobile-tabbar':'desktop-travel-nav'} aria-label={mobile?messages.mobileNavLabel:messages.desktopNavLabel}>{items.map(item=>{
    const active=path===item.href||(item.href==='/account'&&['/results','/map'].includes(path));
    return <Link key={item.href} href={item.href} aria-current={active?'page':undefined}>{mobile&&<TravelIcon name={item.icon} size={21}/>}<span>{item.label}</span></Link>;
  })}</nav>;
}
