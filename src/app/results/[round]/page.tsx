import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BallRow, LottoBall } from "@/components/LottoBall";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { draws, getDraw, latestDraw } from "@/lib/draws";
import {
  analyzeDraw,
  findDuplicateCombo,
  getNumberStat,
  RANGE_BUCKETS,
} from "@/lib/stats";
import { comma, koreanDate, koreanMoney } from "@/lib/format";
import { firstWinnersOf, purchaseLabel } from "@/lib/stores";
import { pageMetadata } from "@/site.config";

export function generateStaticParams() {
  return draws.map((d) => ({ round: String(d.round) }));
}

// 목록에 없는 회차는 404 (미래 회차로 만들어지는 잡페이지 방지)
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/results/[round]">): Promise<Metadata> {
  const { round } = await params;
  const draw = getDraw(Number(round));
  if (!draw) return { title: "회차를 찾을 수 없습니다" };

  const first = draw.prizes.find((p) => p.rank === 1);
  const nums = draw.numbers.join(", ");
  const firstPrize =
    first && first.winners > 0
      ? `1등 ${comma(first.winners)}명, 1인당 ${koreanMoney(first.perWinner)}.`
      : "1등 당첨자는 나오지 않았습니다.";

  return pageMetadata({
    // 한글 검색결과는 30자 근처에서 잘린다. 정작 찾는 당첨번호가 남도록
    // 브랜드 접미사를 붙이지 않는다.
    bareTitle: true,
    title: `${draw.round}회 로또 당첨번호 ${draw.numbers.join(",")}+${draw.bonus}`,
    description: `${draw.round}회 로또 당첨번호는 ${nums}, 보너스 ${draw.bonus}입니다. ${firstPrize}`,
    path: `/results/${draw.round}`,
    ogTitle: `${draw.round}회 로또 당첨번호 - ${nums} + ${draw.bonus}`,
    ogDescription: `추첨일 ${koreanDate(draw.date)} · ${firstPrize}`,
    publishedTime: `${draw.date}T20:45:00+09:00`,
  });
}

const RANK_LABEL: Record<number, string> = {
  1: "1등 (6개 일치)",
  2: "2등 (5개 + 보너스)",
  3: "3등 (5개 일치)",
  4: "4등 (4개 일치)",
  5: "5등 (3개 일치)",
};

export default async function RoundPage({
  params,
}: PageProps<"/results/[round]">) {
  const { round } = await params;
  const n = Number(round);
  const draw = getDraw(n);
  if (!draw) notFound();

  const prev = getDraw(n - 1);
  const next = getDraw(n + 1);
  const first = draw.prizes.find((p) => p.rank === 1);
  const pattern = analyzeDraw(draw.numbers);
  const carried = prev
    ? draw.numbers.filter((x) => prev.numbers.includes(x))
    : [];
  const duplicateOf = (() => {
    const r = findDuplicateCombo(draw.numbers);
    return r && r !== draw.round ? r : undefined;
  })();
  const types = draw.firstPrizeTypes;
  const winners = firstWinnersOf(draw.round);
  const typeTotal = types.auto + types.manual + types.semiAuto;

  const crumbs = [
    { name: "홈", href: "/" },
    { name: "회차별 당첨번호", href: "/results" },
    { name: `${draw.round}회` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            headline: `${draw.round}회 로또 당첨번호`,
            description: `${draw.round}회 로또 6/45 당첨번호 ${draw.numbers.join(", ")} + 보너스 ${draw.bonus}`,
            path: `/results/${draw.round}`,
            datePublished: `${draw.date}T20:45:00+09:00`,
          }),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      <article>
        <Card className="bg-gradient-to-br from-accent-soft to-surface">
          <p className="text-sm font-medium text-accent">
            {koreanDate(draw.date)} 추첨
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {draw.round}회 로또 당첨번호
          </h1>
          <BallRow
            numbers={draw.numbers}
            bonus={draw.bonus}
            size="xl"
            className="mt-5"
          />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {draw.round}회 로또 6/45 당첨번호는{" "}
            <strong className="text-fg">{draw.numbers.join(", ")}</strong>,
            보너스 번호는 <strong className="text-fg">{draw.bonus}</strong>번
            입니다.
            {first && first.winners > 0 ? (
              <>
                {" "}
                1등은 {comma(first.winners)}명이 나와 1인당{" "}
                {koreanMoney(first.perWinner)}씩 받았습니다.
              </>
            ) : (
              " 이 회차에는 1등 당첨자가 나오지 않았습니다."
            )}
          </p>
        </Card>

        {/* 등수별 당첨 정보 */}
        <section className="mt-8">
          <SectionTitle sub={`${draw.round}회 등수별 당첨자 수와 당첨금`}>
            등위별 당첨 결과
          </SectionTitle>
          <Card className="p-0! sm:p-0!">
            <div className="scroll-x">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">
                  {draw.round}회 등수별 당첨자 수 및 당첨금
                </caption>
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="px-5 py-3 font-medium">
                      등위
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      당첨자 수
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      1인당 당첨금
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      총 당첨금
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {draw.prizes.map((p) => (
                    <tr key={p.rank}>
                      <th
                        scope="row"
                        className="px-5 py-3 text-left font-semibold"
                      >
                        {RANK_LABEL[p.rank]}
                      </th>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {comma(p.winners)}명
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {comma(p.perWinner)}원
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted">
                        {p.total ? comma(p.total) : "-"}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="총 당첨자" value={`${comma(draw.totalWinners)}명`} />
            <Stat label="회차 판매액" value={koreanMoney(draw.sales)} />
            <Stat
              label="1등 자동 선택"
              value={typeTotal ? `${types.auto}명` : "-"}
              hint={typeTotal ? `수동 ${types.manual} · 반자동 ${types.semiAuto}` : undefined}
            />
            <Stat label="보너스 번호" value={`${draw.bonus}번`} />
          </dl>
        </section>

        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

        {/* 조합 분석 */}
        <section className="mt-8">
          <SectionTitle sub="이 회차 당첨 조합의 통계적 특징">
            {draw.round}회 조합 분석
          </SectionTitle>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="번호 합계" value={comma(pattern.sum)} />
            <Stat label="홀 : 짝" value={`${pattern.odd} : ${pattern.even}`} />
            <Stat
              label="저 : 고"
              value={`${pattern.low} : ${pattern.high}`}
              hint="1~22 / 23~45"
            />
            <Stat label="AC값" value={pattern.ac} hint="0~10" />
            <Stat label="연속번호" value={`${pattern.consecutive}쌍`} />
            <Stat label="끝수 합" value={pattern.tailSum} />
          </dl>

          <Card className="mt-4">
            <h3 className="mb-3 text-sm font-bold">구간별 분포</h3>
            <ul className="grid grid-cols-5 gap-2 text-center">
              {RANGE_BUCKETS.map((b, i) => (
                <li
                  key={b.label}
                  className="rounded-xl border border-line bg-surface-2 px-2 py-3"
                >
                  <p className="text-[11px] text-muted">{b.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    {pattern.rangeCounts[i]}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          {prev && (
            <Card className="mt-4">
              <h3 className="mb-2 text-sm font-bold">
                직전 {prev.round}회와 겹친 번호
              </h3>
              {carried.length ? (
                <div className="flex items-center gap-2">
                  <BallRow numbers={carried} size="sm" />
                  <span className="text-sm text-muted">
                    {carried.length}개 이월
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  직전 회차와 겹치는 번호가 없습니다.
                </p>
              )}
            </Card>
          )}

          {duplicateOf && (
            <Card className="mt-4">
              <p className="text-sm">
                이 조합은{" "}
                <Link
                  href={`/results/${duplicateOf}`}
                  className="font-semibold text-accent hover:underline"
                >
                  {duplicateOf}회
                </Link>
                에도 똑같이 나왔던 조합입니다.
              </p>
            </Card>
          )}
        </section>

        {/* 번호별 누적 통계 */}
        <section className="mt-8">
          <SectionTitle sub="당첨번호 각각의 전 회차 누적 기록">
            당첨번호별 통계
          </SectionTitle>
          <Card className="p-0! sm:p-0!">
            <div className="scroll-x">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="px-5 py-3 font-medium">
                      번호
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      누적 출현
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      출현 순위
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      직전 출현
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[...draw.numbers, draw.bonus].map((num, i) => {
                    const s = getNumberStat(num)!;
                    const isBonus = i === draw.numbers.length;
                    const before = s.rounds.filter((r) => r < draw.round);
                    return (
                      <tr key={`${num}-${isBonus}`}>
                        <th scope="row" className="px-5 py-3 text-left">
                          <Link
                            href={`/stats/number/${num}`}
                            className="flex items-center gap-2 hover:underline"
                          >
                            <LottoBall n={num} size="sm" />
                            <span className="font-semibold">
                              {num}번{isBonus && " (보너스)"}
                            </span>
                          </Link>
                        </th>
                        <td className="px-5 py-3 text-right tabular-nums">
                          {s.count}회
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">
                          {s.rank}위
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">
                          {before.length
                            ? `${before[before.length - 1]}회`
                            : "첫 출현"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* 이 회차 1등 배출 판매점 */}
        {winners.length > 0 && (
          <section className="mt-8">
            <SectionTitle
              sub={`${draw.round}회 1등 당첨 복권이 팔린 곳`}
              href="/stores"
              linkLabel="전국 명당 순위"
            >
              {draw.round}회 1등 배출 판매점
            </SectionTitle>
            <Card className="p-0! sm:p-0!">
              <div className="scroll-x">
                <table className="w-full min-w-[560px] text-sm">
                  <caption className="sr-only">
                    {draw.round}회 1등 배출 판매점 목록
                  </caption>
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-muted">
                      <th scope="col" className="px-5 py-3 font-medium">
                        판매점
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        지역
                      </th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">
                        구매방식
                      </th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">
                        누적 1등
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {winners.map((w, i) => (
                      <tr key={`${w.store.id}-${i}`} className="hover:bg-surface-2">
                        <th scope="row" className="px-5 py-3 text-left align-top">
                          <span className="block font-semibold">
                            {w.store.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-normal leading-relaxed text-muted">
                            {w.store.addr}
                          </span>
                        </th>
                        <td className="px-5 py-3 align-top whitespace-nowrap text-muted">
                          {w.store.isInternet ? (
                            "인터넷"
                          ) : (
                            <Link
                              href={`/stores/${encodeURIComponent(w.store.sido)}/${encodeURIComponent(w.store.sigungu)}`}
                              className="hover:text-accent hover:underline"
                            >
                              {w.store.sido} {w.store.sigungu}
                            </Link>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right align-top whitespace-nowrap text-muted">
                          {purchaseLabel(w.type)}
                        </td>
                        <td className="px-5 py-3 text-right align-top tabular-nums">
                          {w.store.first}회
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}

        {/* 이전/다음 회차 */}
        <nav
          aria-label="회차 이동"
          className="mt-8 grid grid-cols-2 gap-3 text-sm"
        >
          {prev ? (
            <Link
              href={`/results/${prev.round}`}
              className="rounded-2xl border border-line bg-surface p-4 hover:bg-surface-2"
            >
              <span className="text-xs text-muted">이전 회차</span>
              <span className="mt-0.5 block font-bold">
                {prev.round}회 당첨번호
              </span>
              <span className="mt-1 block text-xs text-muted">
                {prev.numbers.join(", ")}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/results/${next.round}`}
              className="rounded-2xl border border-line bg-surface p-4 text-right hover:bg-surface-2"
            >
              <span className="text-xs text-muted">다음 회차</span>
              <span className="mt-0.5 block font-bold">
                {next.round}회 당첨번호
              </span>
              <span className="mt-1 block text-xs text-muted">
                {next.numbers.join(", ")}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <section className="mt-8">
          <Card>
            <Prose>
              <h2 className="mt-0!">{draw.round}회 로또 당첨번호 요약</h2>
              <p>
                {koreanDate(draw.date)}에 추첨한 {draw.round}회 로또 6/45의
                당첨번호는 {draw.numbers.join(", ")}이고 보너스 번호는{" "}
                {draw.bonus}번입니다. 6개 번호의 합은 {pattern.sum}으로, 역대
                평균과 비교해 볼 수 있습니다. 홀수 {pattern.odd}개와 짝수{" "}
                {pattern.even}개로 구성되었고, 1~22 구간에서 {pattern.low}개,
                23~45 구간에서 {pattern.high}개가 나왔습니다.
                {pattern.consecutive > 0
                  ? ` 연속된 번호는 ${pattern.consecutive}쌍 포함되었습니다.`
                  : " 연속된 번호는 포함되지 않았습니다."}
              </p>
              <p>
                당첨금 지급 기한은 지급 개시일로부터 1년입니다. 1·2등 당첨금은
                농협은행 본점에서, 3등 이하는 가까운 은행이나 판매점에서 받을 수
                있습니다. 자세한 절차는{" "}
                <Link href="/guide/claim">당첨금 수령 방법</Link> 문서를
                참고하세요.
              </p>
            </Prose>
          </Card>
        </section>

        <p className="mt-6 text-center text-xs text-muted">
          전체 회차는{" "}
          <Link href="/results" className="text-accent hover:underline">
            회차별 당첨번호
          </Link>{" "}
          페이지에서, 최신 회차는{" "}
          <Link
            href={`/results/${latestDraw.round}`}
            className="text-accent hover:underline"
          >
            {latestDraw.round}회
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </article>
    </>
  );
}
