import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

// output: "export" 에서 정적 파일로 뽑히도록 명시
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // 애드센스 크롤러가 페이지 내용을 읽어야 광고 매칭이 정확해진다.
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    // host 는 얀덱스 전용 비표준 지시어라 넣지 않는다.
    // (basePath 배포에서는 경로가 붙어 오히려 잘못된 값이 된다)
  };
}
