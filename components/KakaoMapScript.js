// components/KakaoMapScript.js
import Script from "next/script";

export default function KakaoMapScript() {
  // YOUR_JS_KEY 부분을 발급받은 JavaScript 키로 교체
  const KAKAO_JS_KEY = "f58488efa9fe25c2dfa4f1ff2a1f544d";

  return (
    <Script
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}`}
      strategy="beforeInteractive"
    />
  );
}
