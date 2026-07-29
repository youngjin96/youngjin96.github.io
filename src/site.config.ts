/**
 * 사이트 전역 설정.
 *
 * GitHub Pages 배포 기준:
 *  - 커스텀 도메인 또는 <username>.github.io 저장소 → NEXT_PUBLIC_BASE_PATH 비워둠
 *  - 프로젝트 저장소(https://<username>.github.io/lotto-stats) → NEXT_PUBLIC_BASE_PATH=/lotto-stats
 *
 * canonical / sitemap / OG URL 이 모두 아래 값에서 나오므로 배포 전에 꼭 채워주세요.
 */

// GitHub Actions 는 정의되지 않은 vars 를 빈 문자열로 넘긴다.
// ?? 는 빈 문자열을 걸러내지 못하므로(=> new URL("") 이 터짐) 명시적으로 처리한다.
const rawSiteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.github.io"
).replace(/\/+$/, "");

/** 프로젝트 저장소로 배포할 때의 하위 경로. 예: "/lottery" */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

export const siteConfig = {
  name: "로또리포트",
  shortName: "로또리포트",
  title: "로또리포트 - 로또 6/45 당첨번호 통계와 번호 추천",
  description:
    "1회차부터 최신 회차까지 로또 6/45 당첨번호를 모두 모아 번호별 출현 횟수, 미출현 기간, 궁합수, 홀짝·합계 패턴을 분석합니다. 통계 기반 번호 추천도 무료로 제공합니다.",
  /** basePath 를 포함한 사이트 루트 URL (뒤에 / 없음) */
  url: `${rawSiteUrl}${basePath}`,
  basePath,
  locale: "ko_KR",
  // 애드센스 승인 후 발급받은 ca-pub-XXXXXXXXXXXXXXXX 를 .env 에 넣으면 자동 적용됩니다.
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",
  // 구글 서치콘솔 소유권 확인용 메타태그 값 (선택)
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  // GA4 측정 ID (선택)
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

/**
 * 경로를 절대 URL 로 바꾼다.
 *
 * canonical 에 상대경로를 쓰면 metadataBase 의 basePath 가 날아가므로
 * (예: base 가 /lotto-stats 여도 "/results/1" → 도메인 루트로 해석)
 * 항상 이 함수로 절대 URL 을 만들어 넣는다.
 *
 * next.config 의 trailingSlash: true 와 맞추기 위해 끝에 / 를 붙인다.
 */
export function absoluteUrl(path = "/"): string {
  const clean = `/${path}`.replace(/\/+/g, "/");
  const withSlash = clean.endsWith("/") ? clean : `${clean}/`;
  return `${siteConfig.url}${withSlash === "/" ? "/" : withSlash}`;
}

/**
 * public/ 안의 파일을 절대 URL 로. (뒤에 / 를 붙이지 않는다)
 * 예: assetUrl("/og.png") → https://site.kr/basePath/og.png
 */
export function assetUrl(file: string): string {
  return `${siteConfig.url}/${file.replace(/^\/+/, "")}`;
}

/**
 * 공용 OG 이미지. scripts/gen-images.mjs 가 빌드 전에 public/og.png 로 만든다.
 *
 * 하위 페이지에서 openGraph 를 직접 정의하면 레이아웃의 openGraph 가 통째로
 * 덮이므로, 그런 페이지에서는 images 에 이 값을 다시 넣어줘야 한다.
 */
export const ogImage = {
  url: assetUrl("/og.png"),
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} - 로또 6/45 당첨번호 통계와 번호 추천`,
  type: "image/png",
} as const;

export type SiteConfig = typeof siteConfig;
