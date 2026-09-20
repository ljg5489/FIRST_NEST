'use client';
import {useState} from 'react';
import {TravelIcon} from './TravelIcon';
import {useI18n} from '@/features/i18n/I18nProvider';

export function HomeSearch({regions}:{regions:string[]}) {
  const {t,value}=useI18n();
  const [mode,setMode]=useState<'explore'|'plan'>('explore');
  return <div className="home-search">
    <div className="search-tabs" role="tablist" aria-label={t('여행 시작 방법')}>
      <button type="button" role="tab" id="explore-tab" aria-controls="home-search-panel" aria-selected={mode==='explore'} onClick={()=>setMode('explore')}><TravelIcon name="search" size={19}/>{t('여행지 찾기')}</button>
      <button type="button" role="tab" id="plan-tab" aria-controls="home-search-panel" aria-selected={mode==='plan'} onClick={()=>setMode('plan')}><TravelIcon name="sparkles" size={19}/>{t('나만의 코스 만들기')}</button>
    </div>
    <form key={mode} action={mode==='explore'?'/explore':'/recommend'} className="search-fields" id="home-search-panel" role="tabpanel" aria-labelledby={`${mode==='explore'?'explore':'plan'}-tab`}>
      <label className="search-destination"><TravelIcon name="pin"/><span><small>{t(mode==='explore'?'어디로 떠날까요?':'출발 지역')}</small>{mode==='explore'?<input name="keyword" aria-label={t('여행지 검색')} placeholder={t('지역, 여행지 이름으로 검색')} maxLength={80}/>:<select name="startRegion" aria-label={t('출발 지역')}>{regions.map(r=><option key={r} value={r}>{value(r)}</option>)}</select>}</span></label>
      {mode==='explore'?<label><TravelIcon name="map"/><span><small>{t('지역 선택')}</small><select name="region" aria-label={t('검색 지역')}><option value="">{t('충남 전체')}</option>{regions.map(r=><option key={r} value={r}>{value(r)}</option>)}</select></span></label>:<><label><TravelIcon name="calendar"/><span><small>{t('여행 일정')}</small><select name="tripDays" aria-label={t('여행일수')}>{['1일','2일','3일'].map(day=><option key={day} value={day}>{value(day)}</option>)}</select></span></label><label><TravelIcon name="user"/><span><small>{t('함께하는 인원')}</small><select name="people" aria-label={t('여행 인원')}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></span></label></>}
      <button className="primary-button search-submit" type="submit"><TravelIcon name={mode==='explore'?'search':'arrow'} size={20}/>{t(mode==='explore'?'검색':'코스 만들기')}</button>
    </form>
  </div>;
}
