import type { MetadataRoute } from "next";
import { draws, latestDraw } from "@/lib/draws";
import { ALL_NUMBERS } from "@/lib/patterns";
import { guides } from "@/lib/guides";
import { absoluteUrl } from "@/site.config";

// output: "export" 에서 정적 파일로 뽑히도록 명시
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // 최신 추첨일을 기준 lastModified 로 쓴다 (매주 갱신 신호)
  const lastDrawDate = new Date(`${latestDraw.date}T20:45:00+09:00`);

  const years = [...new Set(draws.map((d) => d.date.slice(0, 4)))];

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
      { url: absoluteUrl("/results"), changeFrequency: "weekly", priority: 0.9 },
      {
        url: absoluteUrl("/results/search"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: absoluteUrl("/recommend"),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      { url: absoluteUrl("/stats"), changeFrequency: "weekly", priority: 0.9 },
      {
        url: absoluteUrl("/stats/frequency"),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/stats/overdue"),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: absoluteUrl("/stats/pairs"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: absoluteUrl("/stats/patterns"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: absoluteUrl("/stats/prize"),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      { url: absoluteUrl("/guide"), changeFrequency: "monthly", priority: 0.6 },
      { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
      { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    ] satisfies MetadataRoute.Sitemap
  ).map((p) => ({ ...p, lastModified: lastDrawDate }));

  const numberPages: MetadataRoute.Sitemap = ALL_NUMBERS.map((n) => ({
    url: absoluteUrl(`/stats/number/${n}`),
    lastModified: lastDrawDate,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const yearPages: MetadataRoute.Sitemap = years.map((y) => ({
    url: absoluteUrl(`/results/year/${y}`),
    lastModified: lastDrawDate,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  // 회차 페이지는 내용이 고정이므로 추첨일을 lastModified 로 쓴다.
  const roundPages: MetadataRoute.Sitemap = draws.map((d) => ({
    url: absoluteUrl(`/results/${d.round}`),
    lastModified: new Date(`${d.date}T20:45:00+09:00`),
    changeFrequency: "yearly",
    // 최신 회차일수록 검색 수요가 크다
    priority: d.round > latestDraw.round - 12 ? 0.8 : 0.4,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: absoluteUrl(`/guide/${g.slug}`),
    lastModified: new Date(`${g.updated}T00:00:00+09:00`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...numberPages,
    ...guidePages,
    ...yearPages,
    ...roundPages,
  ];
}
