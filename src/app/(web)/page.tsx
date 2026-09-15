import {getAttractions,getTravelConditionOptions} from '@/lib/data';
import {HomeSearch} from './components/HomeSearch';
import {TravelIcon,type TravelIconName} from './components/TravelIcon';
import {PlaceCard} from './components/PlaceCard';
export const dynamic='force-dynamic';
const themes:{label:string;subtitle:string;icon:TravelIconName;filter:string}[]=[{label:'자연 속 쉼',subtitle:'숲과 바다 사이',icon:'leaf',filter:'자연'},{label:'역사 산책',subtitle:'시간을 걷는 여행',icon:'landmark',filter:'역사'},{label:'맛있는 여행',subtitle:'그 지역의 한 끼',icon:'food',filter:'음식'},{label:'문화 산책',subtitle:'전시와 이야기',icon:'sun',filter:'문화'},{label:'나만의 코스',subtitle:'취향을 담은 일정',icon:'sparkles',filter:''}];
const regionCopy:Record<string,string>={공주:'백제의 시간을 걷다',부여:'고즈넉한 풍경에 머물다',보령:'바다와 함께 쉬어가다',서천:'자연 가까이, 더 느리게',태안:'노을이 머무는 해변',청양:'초록으로 채우는 하루'};
const labels:Record<string,string>={HS:'역사 · 문화유산',NA:'자연 · 풍경',EX:'체험 · 즐길거리',VE:'문화 · 전시',FD:'음식 · 카페',AC:'숙박',SH:'쇼핑',LS:'레저 · 액티비티',EV:'축제 · 행사'};
export default async function Home(){
 const [raw,options]=await Promise.all([getAttractions(),getTravelConditionOptions()]);
 const places=raw.map((p:any)=>({id:p.id,name:p.name_ko||p.name,region:options.startRegions.find(r=>p.address?.includes(r))||p.region||p.address?.split(' ')[1]||'충남',category:labels[(p.category_code||'').slice(0,2)]||p.category||'충남 여행지',imageUrl:p.imageUrl||p.place_images?.[0]?.image_url,summary:p.description||p.summary||'',code:p.category_code||''}));
 const pictured=places.filter(p=>p.imageUrl);
 const hero=pictured.find(p=>/해수욕장|해변|수목원|자연휴양림/.test(p.name))||pictured.find(p=>p.code.startsWith('NA'))||pictured[0];
 const picks=[...pictured.filter(p=>/^(NA|HS|VE|EX)/.test(p.code)),...pictured.filter(p=>! /^(NA|HS|VE|EX)/.test(p.code))].slice(0,4);
 return <main>
  <section className="discovery-hero">
   {hero&&<img className="hero-image" src={hero.imageUrl.replace(/^http:/,'https:')} alt="" fetchPriority="high"/>}<div className="hero-shade"/>
   <div className="page-shell hero-content"><p className="hero-eyebrow">YOUR NEXT CHAPTER, CHUNGNAM</p><h1>멀리 가지 않아도,<br/>새로운 여행은 시작되니까.</h1><p className="hero-description">발길 닿는 충남의 모든 순간, travel with me와 함께.</p><HomeSearch regions={options.startRegions}/>{hero&&<a className="hero-location" href={`/attractions/${hero.id}`}><TravelIcon name="pin" size={14}/>{hero.region} · {hero.name}<TravelIcon name="arrow" size={14}/></a>}</div>
  </section>
  <div className="page-shell home-content">
   <nav className="theme-shortcuts" aria-label="여행 테마">{themes.map(t=><a key={t.label} href={t.filter?`/explore?theme=${encodeURIComponent(t.filter)}`:'/recommend'}><span className="theme-icon"><TravelIcon name={t.icon} size={27}/></span><strong>{t.label}</strong><small>{t.subtitle}</small></a>)}</nav>
   <section className="home-section"><div className="section-heading"><div><p className="eyebrow">CLOSE TO YOU</p><h2>어느 동네로 떠나볼까요?</h2><p>각기 다른 매력의 충남, 마음이 가는 곳부터.</p></div><a href="/explore">전체 보기 <TravelIcon name="arrow" size={17}/></a></div><div className="region-grid">{options.startRegions.map((region,i)=>{const image=pictured.find(p=>p.region===region&&/^(NA|HS|VE)/.test(p.code))||pictured.find(p=>p.region===region);return <a className={`region-tile region-tone-${i}`} key={region} href={`/explore?region=${encodeURIComponent(region)}`}>{image&&<img src={image.imageUrl.replace(/^http:/,'https:')} loading="lazy" alt=""/>}<span><strong>{region}</strong><small>{regionCopy[region]}</small></span></a>})}</div></section>
   <section className="planner-promo"><div><span className="small-badge">MY TRAVEL PLAN</span><h2>가고 싶은 곳은 많은데,<br/>어디부터 시작할지 고민이라면.</h2><p>여행 취향을 고르고, 추천받은 일정을 나답게 바꿔보세요.</p><a href="/recommend" className="primary-button">나만의 코스 만들기<TravelIcon name="arrow" size={18}/></a></div><div className="promo-illustration" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><div className="mini-ticket"><span>CHUNGNAM</span><strong>나의 다음 여행</strong><div><i>01</i> 취향을 담고</div><div><i>02</i> 일정을 만들고</div><div><i>03</i> 추억을 남겨요</div><b>travel with me ↗</b></div><span className="promo-pin"><TravelIcon name="pin" size={36}/></span></div></section>
   <section className="home-section"><div className="section-heading"><div><p className="eyebrow">PLACES TO DISCOVER</p><h2>사진 한 장으로 시작하는 여행</h2><p>자세히 볼수록 가고 싶어지는 곳들.</p></div><a href="/explore">더 둘러보기 <TravelIcon name="arrow" size={17}/></a></div><div className="places-grid">{picks.map(p=><PlaceCard key={p.id} {...p}/>)}</div></section>
   <section className="travel-help"><div><TravelIcon name="map" size={28}/><h3>내 여행은 한곳에</h3><p>만든 코스를 계정에 저장하고,<br/>언제든 이어서 계획하세요.</p></div><a href="/account">내 여행 확인하기<TravelIcon name="arrow" size={18}/></a></section>
  </div>
 </main>;
}
