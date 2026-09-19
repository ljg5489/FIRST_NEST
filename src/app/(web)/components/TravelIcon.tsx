// 파일 위치: src/app/(web)/components/TravelIcon.tsx
// 파일 명: TravelIcon.tsx

import type {CSSProperties} from 'react';

const paths = {
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  map: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3ZM9 2v17M15 5v17',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4',
  leaf: 'M20 3C7 2 2 9 6 16s15 2 14-13ZM4 21l11-11',
  landmark: 'm2 8 10-6 10 6ZM4 10v9M9 10v9M15 10v9M20 10v9M2 22h20',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  food: 'M4 2v7a3 3 0 0 0 6 0V2M7 2v20M20 2c-5 2-5 11 0 11V2Zm0 11v9',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  calendar: 'M4 5h16v16H4ZM4 10h16M8 2v5M16 2v5M8 14h2M14 14h2',
  check: 'm5 12 4 4L19 6',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2c3 2.7 4.5 6 4.5 10S15 19.3 12 22M12 2C9 4.7 7.5 8 7.5 12S9 19.3 12 22',
};
export type TravelIconName = keyof typeof paths;
export function TravelIcon({name,size=22,style}:{name:TravelIconName;size?:number;style?:CSSProperties}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style}><path d={paths[name]} /></svg>;
}
