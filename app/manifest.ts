import { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => {
  return {
    theme_color: "#ffffff",
    background_color: "#614AD3",
    display: "standalone",
    scope: "/",
    start_url: "/",
    name: "mongeulmongeul",
    short_name: "mongeul",
    description: "아이의 하루를 기록하세요.",
    lang: "ko-KR",
    icons: [
      {
        "src": "/img/mg-logoback.png",
        "sizes": "72x72",
        "type": "image/png",
      },
      {
        "src": "/img/mg-logoback.png",
        "sizes": "192x192",
        "type": "image/png",
      },
    ],
  };
};
export default manifest;