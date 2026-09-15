'use client';
import {useState} from 'react';
import {TravelIcon} from './TravelIcon';

export function HomeSearch({regions}:{regions:string[]}) {
  const [mode,setMode]=useState<'explore'|'plan'>('explore');
  return <div className="home-search">
    <div className="search-tabs" role="tablist" aria-label="여행 시작 방법">
      <button type="button" role="tab" id="explore-tab" aria-controls="home-search-panel" aria-selected={mode==='explore'} onClick={()=>setMode('explore')}><TravelIcon name="search" size={19}/>여행지 찾기</button>
      <button type="button" role="tab" id="plan-tab" aria-controls="home-search-panel" aria-selected={mode==='plan'} onClick={()=>setMode('plan')}><TravelIcon name="sparkles" size={19}/>나만의 코스 만들기</button>
    </div>
    <form key={mode} action={mode==='explore'?'/explore':'/recommend'} className="search-fields" id="home-search-panel" role="tabpanel" aria-labelledby={`${mode==='explore'?'explore':'plan'}-tab`}>
      <label className="search-destination"><TravelIcon name="pin"/><span><small>{mode==='explore'?'어디로 떠날까요?':'출발 지역'}</small>{mode==='explore'?<input name="keyword" aria-label="여행지 검색" placeholder="지역, 여행지 이름으로 검색" maxLength={80}/>:<select name="startRegion" aria-label="출발 지역">{regions.map(r=><option key={r}>{r}</option>)}</select>}</span></label>
      {mode==='explore'?<label><TravelIcon name="map"/><span><small>지역 선택</small><select name="region" aria-label="검색 지역"><option value="">충남 전체</option>{regions.map(r=><option key={r}>{r}</option>)}</select></span></label>:<><label><TravelIcon name="calendar"/><span><small>여행 일정</small><select name="tripDays" aria-label="여행일수"><option>1일</option><option>2일</option><option>3일</option></select></span></label><label><TravelIcon name="user"/><span><small>함께하는 인원</small><select name="people" aria-label="여행 인원">{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}명</option>)}</select></span></label></>}
      <button className="primary-button search-submit" type="submit"><TravelIcon name={mode==='explore'?'search':'arrow'} size={20}/>{mode==='explore'?'검색':'코스 만들기'}</button>
    </form>
  </div>;
}
