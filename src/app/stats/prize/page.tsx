import Link from "next/link";
import type { Metadata } from "next";
import { BallRow } from "@/components/LottoBall";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { draws, latestDraw } from "@/lib/draws";
import { firstPrize, prizeStats, yearlyStats } from "@/lib/stats";
import { comma, koreanDate, koreanMoney } from "@/lib/format";
import { pageMetadata } from "@/site.config";

export const metadata: Metadata = pageMetadata({
  title: "로또 당첨금 통계 - 역대 1등 당첨금 순위와 판매액 추이",
  description:
    "역대 로또 1등 최고 당첨금과 당첨자 수 순위, 연도별 판매액 추이, 자동·수동 1등 비율을 정리했습니다.",
  path: "/stats/prize",
});

export default function PrizePage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: "당첨금 통계" },
  ];

  const withFirst = draws.filter((d) => (firstPrize(d)?.winners ?? 0) > 0);
  const topPrizes = [...withFirst]
    .sort((a, b) => firstPrize(b)!.perWinner - firstPrize(a)!.perWinner)
    .slice(0, 15);
  const mostWinners = [...draws]
    .sort((a, b) => (firstPrize(b)?.winners ?? 0) - (firstPrize(a)?.winners ?? 0))
    .slice(0, 10);
  const noWinner = draws.filter((d) => (firstPrize(d)?.winners ?? 0) === 0);

  const types = prizeStats.types;
  const typeTotal = types.auto + types.manual + types.semiAuto;
  const maxSales = Math.max(...yearlyStats.map((y) => y.sales));

  const FAQS = [
    {
      q: "역대 로또 1등 최고 당첨금은 얼마인가요?",
      a: `${prizeStats.maxFirstPrize.draw.round}회에서 1인당 ${koreanMoney(prizeStats.maxFirstPrize.amount)}이 지급되어 역대 최고액입니다. 추첨일은 ${koreanDate(prizeStats.maxFirstPrize.draw.date)}이었습니다.`,
    },
    {
      q: "로또 1등 평균 당첨금은 얼마인가요?",
      a: `1등 당첨자가 나온 회차만 놓고 평균을 내면 1인당 약 ${koreanMoney(prizeStats.avgFirstPrize)}입니다. 1등 당첨금은 회차 판매액과 당첨자 수에 따라 매번 달라집니다.`,
    },
    {
      q: "1등은 자동이 많나요, 수동이 많나요?",
      a: typeTotal
        ? `집계된 1등 당첨 ${comma(typeTotal)}건 중 자동 선택이 ${comma(types.auto)}건(${((types.auto / typeTotal) * 100).toFixed(1)}%), 수동이 ${comma(types.manual)}건(${((types.manual / typeTotal) * 100).toFixed(1)}%), 반자동이 ${comma(types.semiAuto)}건입니다. 다만 애초에 자동으로 구매하는 사람이 훨씬 많아서 자동 당첨이 많은 것이며, 자동이 더 유리하다는 뜻은 아닙니다.`
        : "집계 데이터가 없습니다.",
    },
    {
      q: "1등 당첨자가 한 명도 없었던 적이 있나요?",
      a: noWinner.length
        ? `있습니다. 지금까지 ${noWinner.length}개 회차에서 1등 당첨자가 나오지 않았고, 해당 회차의 1등 당첨금은 다음 회차로 이월되었습니다.`
        : "모든 회차에서 1등 당첨자가 나왔습니다.",
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 당첨금 통계
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        1회차부터 {latestDraw.round}회차까지 1등 당첨금과 당첨자 수, 회차별
        판매액을 정리했습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="역대 최고 1등"
          value={koreanMoney(prizeStats.maxFirstPrize.amount)}
          hint={`${prizeStats.maxFirstPrize.draw.round}회`}
        />
        <Stat
          label="평균 1등 당첨금"
          value={koreanMoney(prizeStats.avgFirstPrize)}
        />
        <Stat
          label="평균 1등 당첨자"
          value={`${prizeStats.avgFirstWinners.toFixed(1)}명`}
          hint={`최다 ${prizeStats.maxFirstWinners}명`}
        />
        <Stat
          label="역대 최저 1등"
          value={koreanMoney(prizeStats.minFirstPrize.amount)}
          hint={`${prizeStats.minFirstPrize.draw.round}회`}
        />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="1인당 지급액 기준">역대 1등 당첨금 TOP 15</SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[600px] text-sm">
              <caption className="sr-only">역대 로또 1등 당첨금 순위</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    순위
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    회차
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    당첨번호
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    1등 당첨자
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    1인당 당첨금
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topPrizes.map((d, i) => (
                  <tr key={d.round} className="hover:bg-surface-2">
                    <td className="px-4 py-2.5 tabular-nums text-muted">
                      {i + 1}
                    </td>
                    <th scope="row" className="px-4 py-2.5 text-left">
                      <Link
                        href={`/results/${d.round}`}
                        className="font-bold text-accent hover:underline"
                      >
                        {d.round}회
                      </Link>
                      <span className="block text-[11px] font-normal text-muted">
                        {d.date}
                      </span>
                    </th>
                    <td className="px-4 py-2.5">
                      <BallRow numbers={d.numbers} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {firstPrize(d)!.winners}명
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {koreanMoney(firstPrize(d)!.perWinner)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      <section className="mt-8">
        <SectionTitle sub="한 회차에 1등이 가장 많이 나온 경우">
          1등 당첨자 최다 회차
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    회차
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    1등 당첨자
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    1인당 당첨금
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    총 1등 당첨금
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {mostWinners.map((d) => (
                  <tr key={d.round} className="hover:bg-surface-2">
                    <th scope="row" className="px-4 py-2.5 text-left">
                      <Link
                        href={`/results/${d.round}`}
                        className="font-bold text-accent hover:underline"
                      >
                        {d.round}회
                      </Link>
                      <span className="block text-[11px] font-normal text-muted">
                        {d.date}
                      </span>
                    </th>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                      {firstPrize(d)!.winners}명
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {koreanMoney(firstPrize(d)!.perWinner)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {koreanMoney(firstPrize(d)!.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="연도별 판매액과 1등 당첨자 수">
          연도별 판매액 추이
        </SectionTitle>
        <Card>
          <ul className="space-y-3">
            {yearlyStats.map((y) => (
              <li key={y.year}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <Link
                    href={`/results/year/${y.year}`}
                    className="font-semibold hover:text-accent hover:underline"
                  >
                    {y.year}년
                  </Link>
                  <span className="text-xs text-muted">
                    {koreanMoney(y.sales)} · {y.rounds}회차 · 1등{" "}
                    {comma(y.firstWinners)}명
                  </span>
                </div>
                <Bar value={y.sales} max={maxSales} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            가장 최근 연도는 아직 회차가 진행 중이라 판매액이 낮게 보일 수
            있습니다.
          </p>
        </Card>
      </section>

      {typeTotal > 0 && (
        <section className="mt-8">
          <SectionTitle sub="1등 당첨 티켓의 구매 방식">
            자동 / 수동 / 반자동 비율
          </SectionTitle>
          <Card>
            <ul className="space-y-3">
              {[
                { label: "자동", value: types.auto },
                { label: "수동", value: types.manual },
                { label: "반자동", value: types.semiAuto },
              ].map((t) => (
                <li key={t.label}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{t.label}</span>
                    <span className="text-xs text-muted">
                      {comma(t.value)}건 ·{" "}
                      {((t.value / typeTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Bar value={t.value} max={typeTotal} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              동행복권이 구매 방식을 함께 공개하기 시작한 회차부터의 누적
              집계입니다. 자동 당첨이 많은 이유는 애초에 자동 구매 비중이 훨씬
              높기 때문이며, 자동이 더 유리해서가 아닙니다.
            </p>
          </Card>
        </section>
      )}

      <section className="mt-8">
        <SectionTitle>자주 묻는 질문</SectionTitle>
        <Card>
          <dl className="divide-y divide-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">로또 당첨금은 어떻게 정해지나요</h2>
            <p>
              로또 6/45의 당첨금은 고정액이 아닙니다. 회차별 총 판매액에서 법정
              적립금 등을 뺀 당첨금 총액을 등수별로 나누는 방식이라, 판매액이
              많고 1등 당첨자가 적을수록 1인당 금액이 커집니다.
            </p>
            <ul>
              <li>
                <strong>1등</strong> — 당첨금 총액의 75%를 당첨자 수로 나눔
              </li>
              <li>
                <strong>2등</strong> — 12.5%를 나눔
              </li>
              <li>
                <strong>3등</strong> — 12.5%를 나눔
              </li>
              <li>
                <strong>4등</strong> — 1인당 5만원 고정
              </li>
              <li>
                <strong>5등</strong> — 1인당 5천원 고정
              </li>
            </ul>
            <p>
              1등 당첨자가 없으면 해당 회차 1등 당첨금은 다음 회차로 이월되어
              당첨금이 크게 불어납니다. 실제 수령액은 세금이 빠진 금액이므로{" "}
              <Link href="/guide/tax">로또 당첨금 세금</Link> 문서도 함께
              확인하세요. 수령 절차는{" "}
              <Link href="/guide/claim">당첨금 수령 방법</Link>에 정리해 두었습니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
