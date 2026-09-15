'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {TravelIcon,type TravelIconName} from './TravelIcon';
const items:{href:string;label:string;icon:TravelIconName}[]=[{href:'/',label:'홈',icon:'home'},{href:'/explore',label:'여행지 탐색',icon:'search'},{href:'/recommend',label:'코스 만들기',icon:'sparkles'},{href:'/account',label:'내 여행',icon:'user'}];
export function TravelNav({mobile=false}:{mobile?:boolean}) {
  const path=usePathname();
  return <nav className={mobile?'mobile-tabbar':'desktop-travel-nav'} aria-label={mobile?'모바일 주요 화면':'주요 화면'}>{items.map(item=>{
    const active=path===item.href||(item.href==='/account'&&['/results','/map'].includes(path));
    return <Link key={item.href} href={item.href} aria-current={active?'page':undefined}>{mobile&&<TravelIcon name={item.icon} size={21}/>}<span>{item.label}</span></Link>;
  })}</nav>;
}
