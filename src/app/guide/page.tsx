import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, Card } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { guides } from "@/lib/guides";
import { pageMetadata } from "@/site.config";

export const metadata: Metadata = pageMetadata({
  title: "로또 가이드 - 확률, 당첨금 수령, 세금, 구매 방법",
  description:
    "로또 6/45 등수별 당첨 확률, 당첨금 수령 절차와 세금, 구매 방법과 흔한 오해를 정리한 가이드입니다.",
  path: "/guide",
});

export default function GuideIndexPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "가이드" }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 가이드
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        확률 계산부터 당첨금 수령 절차, 세금까지 로또와 관련해 자주 찾는 정보를
        정리했습니다.
      </p>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guide/${g.slug}`}
              className="block h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2"
            >
              <h2 className="font-bold leading-snug">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {g.summary}
              </p>
              <span className="mt-3 inline-block text-xs font-medium text-accent">
                자세히 보기 →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <Card>
          <h2 className="text-sm font-bold">함께 보면 좋은 페이지</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/stats" className="text-accent hover:underline">
                로또 통계 종합
              </Link>{" "}
              <span className="text-muted">
                — 번호별 출현 횟수, 궁합수, 조합 패턴
              </span>
            </li>
            <li>
              <Link href="/recommend" className="text-accent hover:underline">
                번호 추천
              </Link>{" "}
              <span className="text-muted">— 통계 기반 자동 번호 생성</span>
            </li>
            <li>
              <Link href="/results" className="text-accent hover:underline">
                회차별 당첨번호
              </Link>{" "}
              <span className="text-muted">— 1회차부터 전 회차 기록</span>
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
