import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BallRow } from "@/components/LottoBall";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { draws } from "@/lib/draws";
import { comma, koreanMoney } from "@/lib/format";
import { pageMetadata } from "@/site.config";

const YEARS = [...new Set(draws.map((d) => d.date.slice(0, 4)))].sort();

export function generateStaticParams() {
  return YEARS.map((year) => ({ year }));
}

export const dynamicParams = false;

function drawsOfYear(year: string) {
  return draws.filter((d) => d.date.startsWith(year));
}

export async function generateMetadata({
  params,
}: PageProps<"/results/year/[year]">): Promise<Metadata> {
  const { year } = await params;
  const list = drawsOfYear(year);
  if (!list.length) return { title: "연도를 찾을 수 없습니다" };

  return pageMetadata({
    title: `${year}년 로또 당첨번호 전체 (${list[0].round}회~${list[list.length - 1].round}회)`,
    description: `${year}년에 추첨한 로또 ${list.length}개 회차의 당첨번호와 1등 당첨자 수, 당첨금을 정리했습니다.`,
    path: `/results/year/${year}`,
  });
}

export default async function YearPage({
  params,
}: PageProps<"/results/year/[year]">) {
  const { year } = await params;
  const list = drawsOfYear(year);
  if (!list.length) notFound();

  const reversed = [...list].reverse();
  const idx = YEARS.indexOf(year);
  const prevYear = YEARS[idx - 1];
  const nextYear = YEARS[idx + 1];

  const firstWinners = list.reduce(
    (a, d) => a + (d.prizes.find((p) => p.rank === 1)?.winners ?? 0),
    0,
  );
  const totalSales = list.reduce((a, d) => a + d.sales, 0);
  const maxPrize = list.reduce((best, d) => {
    const cur = d.prizes.find((p) => p.rank === 1)?.perWinner ?? 0;
    const bestVal = best.prizes.find((p) => p.rank === 1)?.perWinner ?? 0;
    return cur > bestVal ? d : best;
  });

  const crumbs = [
    { name: "홈", href: "/" },
    { name: "회차별 당첨번호", href: "/results" },
    { name: `${year}년` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {year}년 로또 당첨번호
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {year}년에는 {list[0].round}회부터 {list[list.length - 1].round}회까지 총{" "}
        {list.length}회 추첨이 있었습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="추첨 회차" value={`${list.length}회`} />
        <Stat label="1등 당첨자" value={`${comma(firstWinners)}명`} />
        <Stat label="연간 판매액" value={koreanMoney(totalSales)} />
        <Stat
          label="최고 1등 당첨금"
          value={koreanMoney(
            maxPrize.prizes.find((p) => p.rank === 1)?.perWinner ?? 0,
          )}
          hint={`${maxPrize.round}회`}
        />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle>{year}년 회차별 당첨번호</SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">
                {year}년 회차별 로또 당첨번호
              </caption>
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
                {reversed.map((d) => {
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

      <nav
        aria-label="연도 이동"
        className="mt-8 flex items-center justify-between gap-3 text-sm"
      >
        {prevYear ? (
          <Link
            href={`/results/year/${prevYear}`}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold hover:bg-surface-2"
          >
            ← {prevYear}년
          </Link>
        ) : (
          <span />
        )}
        <Link href="/results" className="text-accent hover:underline">
          전체 연도 보기
        </Link>
        {nextYear ? (
          <Link
            href={`/results/year/${nextYear}`}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 font-semibold hover:bg-surface-2"
          >
            {nextYear}년 →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">{year}년 로또 한 해 요약</h2>
            <p>
              {year}년 한 해 동안 로또 6/45는 {list.length}회 추첨되었고, 1등
              당첨자는 모두 {comma(firstWinners)}명이 나왔습니다. 연간 판매액은{" "}
              {koreanMoney(totalSales)}이며, 가장 큰 1등 당첨금이 나온 회차는{" "}
              <Link href={`/results/${maxPrize.round}`}>{maxPrize.round}회</Link>
              로 1인당{" "}
              {koreanMoney(
                maxPrize.prizes.find((p) => p.rank === 1)?.perWinner ?? 0,
              )}
              을 받았습니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
