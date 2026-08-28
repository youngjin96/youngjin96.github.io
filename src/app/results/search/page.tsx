import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, Card, Prose } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { NumberChecker, type CompactDraw } from "@/components/NumberChecker";
import { draws, latestDraw, totalRounds } from "@/lib/draws";
import { comma } from "@/lib/format";
import { pageMetadata } from "@/site.config";

export const metadata: Metadata = pageMetadata({
  title: "내 로또 번호 당첨 확인 - 전 회차 대조",
  description: `내가 고른 번호 6개가 1회~${latestDraw.round}회 과거 회차에서 몇 등이었는지 즉시 대조해 드립니다.`,
  path: "/results/search",
});

// 클라이언트로 넘길 최소 데이터: [회차, 번호6, 보너스]
const compact: CompactDraw[] = draws.map((d) => [
  d.round,
  ...d.numbers,
  d.bonus,
]);

export default function SearchPage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "회차별 당첨번호", href: "/results" },
    { name: "내 번호 당첨 확인" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        내 로또 번호 당첨 확인
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        번호 6개를 고르면 1회차부터 {latestDraw.round}회차까지{" "}
        {comma(totalRounds)}개 회차와 모두 대조해 등수별 당첨 횟수를 계산합니다.
        서버로 번호를 보내지 않고 브라우저에서 바로 계산합니다.
      </p>

      <div className="mt-6">
        <NumberChecker data={compact} />
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">로또 등수 기준</h2>
            <ul>
              <li>
                <strong>1등</strong> — 당첨번호 6개 모두 일치
              </li>
              <li>
                <strong>2등</strong> — 당첨번호 5개 + 보너스 번호 일치
              </li>
              <li>
                <strong>3등</strong> — 당첨번호 5개 일치
              </li>
              <li>
                <strong>4등</strong> — 당첨번호 4개 일치 (고정 5만원)
              </li>
              <li>
                <strong>5등</strong> — 당첨번호 3개 일치 (고정 5천원)
              </li>
            </ul>
            <p>
              1~3등 당첨금은 회차별 판매액과 당첨자 수에 따라 매번 달라집니다.
              회차별 실제 당첨금은{" "}
              <Link href="/results">회차별 당첨번호</Link> 페이지에서 확인할 수
              있습니다.
            </p>
            <h2>번호 고르는 데 참고할 만한 통계</h2>
            <ul>
              <li>
                <Link href="/stats/frequency">번호별 출현 횟수</Link> — 어떤
                번호가 많이 나왔는지
              </li>
              <li>
                <Link href="/stats/overdue">미출현 회차</Link> — 오래 안 나온
                번호
              </li>
              <li>
                <Link href="/stats/pairs">궁합수</Link> — 같이 자주 나오는 번호
              </li>
              <li>
                <Link href="/recommend">번호 추천</Link> — 통계 기반 자동 조합
                생성
              </li>
            </ul>
          </Prose>
        </Card>
      </section>
    </>
  );
}
