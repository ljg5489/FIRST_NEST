// 파일 위치: src/app/admin/map/MapClient.tsx
// 파일 명: MapClient.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

type MapClientProps = {
  attractions: any[];
  festivals: any[];
};

export default function MapClient({ attractions, festivals }: MapClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'events'>('places');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [keyError, setKeyError] = useState(false);

  // 1. 지도 스크립트 로드 및 지도 뼈대 생성
  useEffect(() => {
    const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY;
    
    if (!kakaoApiKey) {
      console.error('NEXT_PUBLIC_KAKAO_MAP_JS_KEY가 존재하지 않습니다.');
      setKeyError(true);
      return;
    }

    const initMap = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const options = {
          center: new window.kakao.maps.LatLng(36.5184, 126.8), // 충남 중심 좌표
          level: 10,
        };
        const kakaoMap = new window.kakao.maps.Map(mapRef.current, options);
        setMap(kakaoMap);
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const scriptId = 'kakao-map-script';
      const existingScript = document.getElementById(scriptId);

      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false`;
        document.head.appendChild(script);
        script.onload = initMap;
      }
    }
  }, []);

  // 2. 마커 업데이트 로직 (탭 변경 시)
  useEffect(() => {
    if (!map || !window.kakao) return;

    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: any[] = [];
    const targetData = activeTab === 'places' ? attractions : festivals;

    targetData.forEach((item) => {
      const lat = item.latitude || item.event_latitude || 36.5; 
      const lng = item.longitude || item.event_longitude || 126.8;

      if (lat && lng) {
        const markerPosition = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });
        
        marker.setMap(map);
        newMarkers.push(marker);

        // 마커 클릭 시
        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedItem(item);
          map.panTo(markerPosition);
        });
      }
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, activeTab, attractions, festivals]);

  // 💡 3. 새로 추가된 부분: 리스트에서 선택 시 지도 이동 로직
  useEffect(() => {
    if (!map || !window.kakao || !selectedItem) return;

    const lat = selectedItem.latitude || selectedItem.event_latitude;
    const lng = selectedItem.longitude || selectedItem.event_longitude;

    if (lat && lng) {
      const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLon); // 부드럽게 위치 이동
    }
  }, [selectedItem, map]);

  const displayList = activeTab === 'places' ? attractions : festivals;

  if (keyError) {
    return (
      <div className="flex flex-col items-center justify-center h-[700px] bg-[#1A1C23] border border-[#FF4C4C]/50 rounded-2xl text-center p-8">
        <div className="w-16 h-16 bg-[#FF4C4C]/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-[#FF4C4C] text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Kakao Map API Key Error</h2>
        <p className="text-[#848A9C] text-sm max-w-md">
          <code>.env</code> 파일에 <code>NEXT_PUBLIC_KAKAO_MAP_JS_KEY</code>가 설정되지 않았거나 서버가 재시작되지 않았습니다.<br/><br/>
          키 설정 후 터미널에서 서버를 껐다가 다시 켜주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[700px]">
      
      {/* Left Sidebar: Data List */}
      <section className="xl:col-span-4 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-[#2C2E38]">
          <div className="flex bg-[#21232B] rounded-lg p-1">
            <button 
              onClick={() => { setActiveTab('places'); setSelectedItem(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'places' ? 'bg-[#CEFF00] text-black shadow-sm' : 'text-[#848A9C] hover:text-white'}`}
            >
              Places
            </button>
            <button 
              onClick={() => { setActiveTab('events'); setSelectedItem(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'events' ? 'bg-[#CEFF00] text-black shadow-sm' : 'text-[#848A9C] hover:text-white'}`}
            >
              Events
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
          {displayList.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)} // 여기서 selectedItem이 바뀌면 3번 useEffect가 실행됨
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedItem?.id === item.id 
                  ? 'bg-[#21232B] border-[#CEFF00] shadow-[0_0_10px_rgba(206,255,0,0.05)]' 
                  : 'bg-[#181920] border-[#2C2E38] hover:border-[#393C4A]'
              }`}
            >
              <h4 className="text-[13px] font-bold text-white mb-1 truncate">
                {item.name_ko || item.title}
              </h4>
              <p className="text-[11px] text-[#848A9C] truncate">
                {item.address || '주소 정보 없음'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Right Side: Kakao Map & Detail Overlay */}
      <section className="xl:col-span-8 bg-[#1A1C23] border border-[#2C2E38] rounded-2xl overflow-hidden relative">
        <div ref={mapRef} className="w-full h-full bg-[#21232B]" />
        
        {selectedItem && (
          <div className="absolute bottom-6 left-6 right-6 bg-[#1A1C23]/95 backdrop-blur-md border border-[#2C2E38] p-5 rounded-xl shadow-2xl flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-bold text-[#CEFF00] bg-[#CEFF00]/10 px-2 py-0.5 rounded border border-[#CEFF00]/20 mb-2 inline-block">
                Selected
              </span>
              <h3 className="text-lg font-bold text-white mb-1">
                {selectedItem.name_ko || selectedItem.title}
              </h3>
              <p className="text-xs text-[#A0A5B5]">
                {selectedItem.address}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono text-[#848A9C] mb-1">COORDINATES</div>
              <div className="text-sm font-bold text-white">
                {selectedItem.latitude?.toFixed(4) || selectedItem.event_latitude?.toFixed(4)}, 
                {selectedItem.longitude?.toFixed(4) || selectedItem.event_longitude?.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}