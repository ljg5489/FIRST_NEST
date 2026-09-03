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
      console.error("[오류] NEXT_PUBLIC_KAKAO_MAP_JS_KEY가 설정되지 않았습니다.");
      setError("지도 설정을 확인하는 중입니다.");
      return;
    }

    // 이미 스크립트가 문서에 존재하는지 확인 (중복 방지)
    const scriptId = 'kakao-map-script';
    const existingScript = document.getElementById(scriptId);
    let isCanceled = false;

    const failToLoadMap = () => {
      if (isCanceled || mapInstance) return;

      console.error(
        "[오류] 카카오맵 로딩 실패:",
        `origin=${window.location.origin}`,
      );
      setError("잠시 후 다시 지도를 열어주세요.");
    };

    const loadingTimer = window.setTimeout(failToLoadMap, 8000);

    const initMap = () => {
      if (!window.kakao?.maps?.load) {
        failToLoadMap();
        return;
      }

      window.kakao.maps.load(() => {
        if (isCanceled || !mapRef.current || mapInstance) {
          return;
        }

        window.clearTimeout(loadingTimer);

        const options = {
          center: new window.kakao.maps.LatLng(36.45, 126.8), // 충남 중심부
          level: 11,
        };
        const map = new window.kakao.maps.Map(mapRef.current, options);
        setError(null);
        setMapInstance(map);
      });
    };

    if (existingScript) {
      // 이미 스크립트가 로드되어 있다면 바로 실행
      existingScript.addEventListener("load", initMap);
      existingScript.addEventListener("error", failToLoadMap);
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
            ? `localhost 주소로 다시 열어주세요. ${localhostUrl}`
            : "지도를 불러오지 못했습니다.",
        );
      };

      document.head.appendChild(script);
    }

    return () => {
      isCanceled = true;
      window.clearTimeout(loadingTimer);
      existingScript?.removeEventListener("load", initMap);
      existingScript?.removeEventListener("error", failToLoadMap);
    };
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
      <div className="flex h-[420px] w-full flex-col items-center justify-center rounded-lg border border-[#dce2d7] bg-white p-6 text-center sm:h-[500px]">
        <p className="text-lg font-black text-[#17211b]">지도를 불러오지 못했어요.</p>
        <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-[#667165]">
          {error} 위치 정보는 아래 목록과 길찾기 버튼으로 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-[#dce2d7] bg-white shadow-[0_10px_30px_rgba(23,33,27,0.08)] sm:h-[500px]">
      {!mapInstance && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 font-bold text-gray-500">
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
