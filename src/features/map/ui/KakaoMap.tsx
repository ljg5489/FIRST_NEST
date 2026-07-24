// 파일 위치: src/features/map/ui/KakaoMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlaceListItem } from '../../tourism/server/queries';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

interface KakaoMapProps {
  places?: PlaceListItem[];
}

export default function KakaoMap({ places = [] }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. 카카오맵 스크립트를 수동으로 직접 주입하는 로직
  useEffect(() => {
    const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY;

    if (!kakaoApiKey) {
      setError("API 키가 없습니다.");
      return;
    }

    // 이미 스크립트가 문서에 존재하는지 확인 (중복 방지)
    const scriptId = 'kakao-map-script';
    const existingScript = document.getElementById(scriptId);

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (mapRef.current && !mapInstance) {
            const options = {
              center: new window.kakao.maps.LatLng(36.45, 126.8), // 충남 중심부
              level: 11,
            };
            const map = new window.kakao.maps.Map(mapRef.current, options);
            setMapInstance(map);
          }
        });
      }
    };

    if (existingScript) {
      // 이미 스크립트가 로드되어 있다면 바로 실행
      initMap();
    } else {
      // 스크립트 태그를 직접 만들어서 HTML head에 삽입
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false`;
      script.async = true;
      script.onload = initMap;
      
      script.onerror = () => {
        setError("스크립트 다운로드 실패. 네트워크 상태나 도메인을 확인하세요.");
      };

      document.head.appendChild(script);
    }
  }, [mapInstance]);

  // 2. 지도가 로드된 후 관광지 마커를 찍는 로직
  useEffect(() => {
    if (mapInstance && places.length > 0) {
      const markers = places.flatMap((place) => {
        if (place.latitude !== null && place.longitude !== null) {
          const markerPosition = new window.kakao.maps.LatLng(
            place.latitude,
            place.longitude,
          );

          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: place.name_ko,
          });

          marker.setMap(mapInstance);
          return [marker];
        }

        return [];
      });

      return () => {
        markers.forEach((marker) => marker.setMap(null));
      };
    }
  }, [mapInstance, places]);

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-200 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-xl shadow-md border border-gray-200">
      {!mapInstance && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500 font-medium z-10">
          지도를 그리는 중입니다...
        </div>
      )}
      {/* 실제 지도가 렌더링될 div */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
