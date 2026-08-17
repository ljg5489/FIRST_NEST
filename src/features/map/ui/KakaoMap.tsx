// 파일 위치: src/features/map/ui/KakaoMap.tsx
// 파일 명: KakaoMap.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

export interface KakaoMapPlace {
  id?: string;
  name?: string;
  name_ko?: string;
  title?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapx?: string;
  mapy?: string;
}

interface KakaoMapProps {
  places?: KakaoMapPlace[];
}

export default function KakaoMap({ places = [] }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const markerRefs = useRef<Array<{ setMap: (map: unknown | null) => void }>>([]);
  const infoWindowRef = useRef<{ close: () => void } | null>(null);

  const mapPlaces = useMemo(
    () =>
      places
        .map((place) => {
          const latitude = place.latitude ?? Number(place.mapy);
          const longitude = place.longitude ?? Number(place.mapx);

          return {
            ...place,
            latitude,
            longitude,
            title: place.name ?? place.name_ko ?? place.title ?? '관광지',
          };
        })
        .filter(
          (place) =>
            Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
        ),
    [places],
  );

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
        const host = window.location.host;
        const localhostUrl = `${window.location.protocol}//localhost:3000${window.location.pathname}`;

        setError(
          host.startsWith('127.0.0.1')
            ? `카카오맵 허용 도메인 문제일 수 있습니다. ${localhostUrl} 로 다시 열어주세요.`
            : "스크립트 다운로드 실패. 네트워크 상태나 카카오맵 허용 도메인을 확인하세요.",
        );
      };

      document.head.appendChild(script);
    }
  }, [mapInstance]);

  // 2. 지도가 로드된 후 관광지 마커를 찍는 로직
  useEffect(() => {
    if (mapInstance && places.length > 0) {
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      infoWindowRef.current?.close();

      const bounds = new window.kakao.maps.LatLngBounds();

      const markers = mapPlaces.map((place) => {
        const markerPosition = new window.kakao.maps.LatLng(
          place.latitude,
          place.longitude,
        );

        bounds.extend(markerPosition);

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          title: place.title,
        });

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="min-width:150px;padding:10px;font-size:13px;font-weight:700;color:#17211b;">${place.title}</div>`,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindowRef.current?.close();
          infoWindow.open(mapInstance, marker);
          infoWindowRef.current = infoWindow;
        });

        marker.setMap(mapInstance);
        return marker;
      });

      markerRefs.current = markers;

      if (markers.length === 1) {
        mapInstance.setCenter(
          new window.kakao.maps.LatLng(
            mapPlaces[0].latitude,
            mapPlaces[0].longitude,
          ),
        );
        mapInstance.setLevel(5);
      }

      if (markers.length > 1) {
        mapInstance.setBounds(bounds);
      }

      return () => {
        markers.forEach((marker) => marker.setMap(null));
      };
    }
  }, [mapInstance, mapPlaces, places.length]);

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
      {mapInstance && mapPlaces.length === 0 && (
        <div className="absolute inset-x-4 top-4 z-10 rounded-lg border border-[#dce2d7] bg-white/95 p-3 text-sm font-bold text-[#667165] shadow-sm">
          좌표가 있는 관광지가 없어 기본 충남 지도를 표시합니다.
        </div>
      )}
      {/* 실제 지도가 렌더링될 div */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
