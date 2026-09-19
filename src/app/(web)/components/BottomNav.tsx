// 파일 위치: src/app/(web)/components/BottomNav.tsx
// 파일 명: BottomNav.tsx

import type {Locale} from '@/features/i18n/config';
import {TravelNav} from './TravelNav';
export function BottomNav({locale}:{locale:Locale}){return <TravelNav locale={locale} mobile/>;}
