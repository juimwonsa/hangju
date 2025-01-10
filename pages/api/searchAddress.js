// pages/api/searchAddress.js
export default async function handler(req, res) {
  const { query } = req.query; // ex) /api/searchAddress?query=주소
  const kakaoRestKey = process.env.KAKAO_REST_API_KEY;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "No query provided" });
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoRestKey}`,
        },
      }
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("/api/searchAddress error:", error);
    return res.status(500).json({ message: "Kakao address search failed" });
  }
}
