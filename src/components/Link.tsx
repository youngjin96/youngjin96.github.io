import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * 내부 경로 끝에 / 를 붙인다. (쿼리·해시는 그대로 둔다)
 * 예: "/results/644" → "/results/644/", "/results/search?q=1" → "/results/search/?q=1"
 */
function withTrailingSlash(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? "" : href.slice(cut);
  // 확장자가 있는 정적 파일은 trailingSlash 대상이 아니다
  if (path.endsWith("/") || /\.[a-z0-9]+$/i.test(path)) return href;
  return `${path}/${rest}`;
}

/**
 * next/link 대신 쓰는 Link.
 *
 * trailingSlash: true 여도 next/link 는 <a href> 에만 / 를 붙이고,
 * HTML 에 인라인되는 RSC 페이로드에는 넘겨받은 href("/results/644")를 그대로 남긴다.
 * 구글봇이 그 문자열을 URL 로 주워 크롤링하면 GitHub Pages 가 301 을 돌려줘
 * 서치콘솔에 "리디렉션이 포함된 페이지"로 쌓인다.
 * 그래서 next/link 에 넘기기 전에 미리 / 를 붙여 둔다.
 */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      href={typeof href === "string" ? withTrailingSlash(href) : href}
      {...rest}
    />
  );
}
