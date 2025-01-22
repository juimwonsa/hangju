"use client"; // Next.js 13(이하 App router) 환경에서 client component로 지정 시 (필요시)

import React, { useEffect, useRef } from "react";
import { addresses } from "../lib/addresses";

const KakaoMap = () => {
  const mapRef = useRef(null); // 지도를 표시할 div 참조

  useEffect(() => {
    // window가 없는 SSR 환경에서는 로직이 동작하지 않도록 처리
    if (typeof window === "undefined") return;

    // 1. Kakao 지도 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    // 2. 스크립트 로드 후 kakao.maps 로딩
    script.onload = () => {
      window.kakao.maps.load(() => {
        // 지도를 표시할 container
        const container = mapRef.current;
        // 지도 옵션 설정
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 초기 지도 중심(서울 시청 근처)
          level: 5,
        };
        // 지도 생성
        const map = new window.kakao.maps.Map(container, options);
        // 주소-좌표 변환 객체
        const geocoder = new window.kakao.maps.services.Geocoder();

        // 주소 배열 돌면서 마커 표시
        addresses.forEach((addr) => {
          geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const { x, y } = result[0];
              const markerPosition = new window.kakao.maps.LatLng(y, x);
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                map,
              });

              // 간단한 인포윈도우 예시
              const infoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px; white-space:nowrap;">${addr}</div>`,
              });

              // 마커 호버 이벤트
              window.kakao.maps.event.addListener(marker, "mouseover", () => {
                infoWindow.open(map, marker);
              });
              window.kakao.maps.event.addListener(marker, "mouseout", () => {
                infoWindow.close();
              });
            }
          });
        });
      });
    };

    // 언마운트 시 스크립트 제거
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "600px",
      }}
    />
  );
};

export default KakaoMap;
