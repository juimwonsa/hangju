import { useState, useRef } from "react";
import Head from "next/head";
import KakaoMapScript from "../../components/KakaoMapScript";
// SheetJS
import * as XLSX from "xlsx";

export default function Home() {
  const fileInputRef = useRef(null);

  // 지도와 마커 관리를 위해 상태변수나 ref 등을 사용할 수도 있으나
  // 여기서는 전역 변수로 관리 (데모 목적)
  let map = null;
  let markers = [];

  const [message, setMessage] = useState("");

  // Kakao 지도 초기화 함수
  const initKakaoMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao map script not loaded");
      return;
    }
    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청
      level: 5,
    };
    map = new window.kakao.maps.Map(container, options);
  };

  // 엑셀 불러오기
  const handleLoadExcel = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("엑셀 파일을 선택해주세요!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // jsonData 로 변환 (header: 'A' → 첫행 헤더를 그대로 사용)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

      let count = 0;
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        // A열 = 아파트명, C열 = 주소 (가정)
        const aptName = row?.A || "이름없음";
        const address = row?.C;
        if (!address) continue;
        count++;
        // 주소 검색 후 마커 표시
        searchAddressAndMark(address, aptName, i);
      }

      setMessage(`총 ${count}개의 주소를 검색합니다 (잠시만 기다려주세요)`);
    };
    reader.readAsArrayBuffer(file);
  };

  // 주소 검색 → 지도 마커 표시
  const searchAddressAndMark = async (address, aptName, rowIndex) => {
    try {
      // 서버사이드 API Route 호출
      const res = await fetch(
        `/api/searchAddress?query=${encodeURIComponent(address)}`
      );
      if (!res.ok) {
        console.error(`${rowIndex}번째 행 검색실패:`, address);
        return;
      }
      const data = await res.json();
      const { documents } = data;
      if (!documents || documents.length === 0) {
        console.warn(`${rowIndex}번째 행 검색결과 없음:`, address);
        return;
      }
      // 최상단 결과
      const { x, y } = documents[0];
      if (!map) return;
      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(y, x);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map,
      });
      markers.push(marker);

      // 인포윈도우
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:14px;">${aptName}</div>`,
      });
      window.kakao.maps.event.addListener(marker, "click", () => {
        infowindow.open(map, marker);
      });
      // 콘솔 출력
      console.log(
        `[${rowIndex}] ${aptName} -> x:${x}, y:${y} (마커 표시 완료)`
      );
    } catch (err) {
      console.error(`${rowIndex}번째 행 검색오류:`, err);
    }
  };

  return (
    <>
      <Head>
        <title>Next.js + Kakao Map + Excel Demo</title>
      </Head>
      {/* 카카오 맵 스크립트 로드 */}
      <KakaoMapScript />

      <div style={{ margin: "20px" }}>
        <h1>엑셀(A열=아파트명, C열=주소) 업로드 & 지도 표시</h1>
        <button onClick={initKakaoMap}>1) 지도 초기화</button> <br />
        <br />
        <input type="file" ref={fileInputRef} accept=".xlsx, .xls" />
        <button onClick={handleLoadExcel}>2) 엑셀 불러오기</button>
        <div style={{ marginTop: "10px", color: "blue" }}>{message}</div>
        <div
          id="map"
          style={{ width: "800px", height: "600px", marginTop: "20px" }}
        ></div>
      </div>
    </>
  );
}
