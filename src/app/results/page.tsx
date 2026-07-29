import Link from "next/link";
import type { Metadata } from "next";
import { BallRow } from "@/components/LottoBall";
import { Breadcrumbs, Card, Prose, SectionTitle } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { draws, latestDraw, totalRounds } from "@/lib/draws";
import { comma, koreanMoney } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

const PAGE_SIZE = 100;

export const metadata: Metadata = {
  title: `회차별 로또 당첨번호 전체 (1회~${latestDraw.round}회)`,
  description: `로또 6/45 1회차부터 ${latestDraw.round}회차까지 모든 당첨번호를 한 페이지에서 확인하세요. 회차, 추첨일, 당첨번호 6개와 보너스 번호, 1등 당첨자 수를 정리했습니다.`,
  alternates: { canonical: absoluteUrl("/results") },
};

const years = [
  ...new Set(draws.map((d) => d.date.slice(0, 4))),
].sort((a, b) => Number(b) - Number(a));

export default function ResultsPage() {
  const list = draws.slice(-PAGE_SIZE).reverse();
  const crumbs = [{ name: "홈", href: "/" }, { name: "회차별 당첨번호" }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        회차별 로또 당첨번호
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        1회차(2002년 12월 7일)부터 {latestDraw.round}회차까지 총{" "}
        {comma(totalRounds)}회차의 로또 6/45 당첨번호입니다. 아래는 최근{" "}
        {PAGE_SIZE}회차이며, 그 이전 회차는 연도별 목록에서 확인할 수 있습니다.
      </p>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub={`${list[list.length - 1].round}회 ~ ${latestDraw.round}회`}>
          최근 {PAGE_SIZE}회차 당첨번호
        </SectionTitle>

        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">최근 회차별 로또 당첨번호</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    회차
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    추첨일
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    당첨번호 (보너스)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    1등
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((d) => {
                  const first = d.prizes.find((p) => p.rank === 1);
                  return (
                    <tr key={d.round} className="hover:bg-surface-2">
                      <th scope="row" className="px-4 py-3 text-left">
                        <Link
                          href={`/results/${d.round}`}
                          className="font-bold text-accent hover:underline"
                        >
                          {d.round}회
                        </Link>
                      </th>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {d.date}
                      </td>
                      <td className="px-4 py-3">
                        <BallRow numbers={d.numbers} bonus={d.bonus} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                        <span className="block font-medium">
                          {comma(first?.winners ?? 0)}명
                        </span>
                        <span className="block text-[11px] text-muted">
                          {koreanMoney(first?.perWinner ?? 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="연도를 선택하면 해당 연도의 전 회차를 볼 수 있습니다">
          연도별 당첨번호
        </SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {years.map((y) => (
            <li key={y}>
              <Link
                href={`/results/year/${y}`}
                className="block rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2"
              >
                {y}년
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">로또 당첨번호 조회 안내</h2>
            <p>
              로또 6/45는 매주 토요일 저녁 8시 35분에 추첨하며, 45개 번호 중 6개를
              뽑고 이어서 보너스 번호 1개를 추가로 뽑습니다. 6개를 모두 맞히면
              1등, 5개와 보너스 번호가 일치하면 2등입니다.
            </p>
            <p>
              각 회차를 누르면 등수별 당첨자 수와 1인당 당첨금, 판매액, 조합의
              통계적 특징(번호 합계, 홀짝 비율, AC값 등)까지 확인할 수 있습니다.
              내가 고른 번호가 과거 회차에서 몇 등이었는지 궁금하다면{" "}
              <Link href="/results/search">내 번호 당첨 확인</Link>을
              이용해 보세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
