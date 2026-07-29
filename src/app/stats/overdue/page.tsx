import Link from "next/link";
import type { Metadata } from "next";
import { LottoBall } from "@/components/LottoBall";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { latestDraw, totalRounds } from "@/lib/draws";
import { carryOverStats, overdueNumbers } from "@/lib/stats";
import { comma, pct } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export const metadata: Metadata = {
  title: `오래 안 나온 로또 번호 - 미출현 회차 순위 (${latestDraw.round}회 기준)`,
  description: `${latestDraw.round}회 기준으로 각 로또 번호가 마지막으로 나온 뒤 몇 회차가 지났는지, 평균 출현 간격과 역대 최장 미출현 기록은 얼마인지 정리했습니다.`,
  alternates: { canonical: absoluteUrl("/stats/overdue") },
};

export default function OverduePage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: "미출현 회차" },
  ];

  const list = overdueNumbers;
  const maxGap = list[0].gap;
  const avgGapAll =
    list.reduce((a, s) => a + s.avgGap, 0) / list.length;
  const longestEver = [...list].sort((a, b) => b.maxGap - a.maxGap)[0];
  const totalCarry = carryOverStats.reduce((a, c) => a + c.count, 0);

  const FAQS = [
    {
      q: "가장 오래 안 나온 로또 번호는?",
      a: `${latestDraw.round}회 기준으로 ${list[0].number}번이 ${list[0].gap}회째 나오지 않아 가장 오래 쉬고 있습니다. 이 번호가 마지막으로 나온 회차는 ${list[0].lastRound}회입니다.`,
    },
    {
      q: "번호 하나가 나오기까지 평균 몇 회차가 걸리나요?",
      a: `한 회차에 6개 번호가 뽑히므로 특정 번호가 나올 확률은 회차당 약 13.3%이고, 평균 출현 간격은 약 ${avgGapAll.toFixed(1)}회입니다. 다만 실제로는 연속으로 나오기도 하고 수십 회 쉬기도 합니다.`,
    },
    {
      q: "오래 안 나온 번호가 곧 나올 확률이 높나요?",
      a: "그렇지 않습니다. 로또 추첨은 이전 결과를 기억하지 않는 독립 시행이라, 몇 회를 쉬었든 다음 회차에 나올 확률은 항상 6/45(약 13.3%)로 같습니다. 오래 쉬었으니 나올 때가 됐다고 생각하는 것을 '도박사의 오류'라고 합니다.",
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        오래 안 나온 로또 번호 (미출현 회차)
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {latestDraw.round}회 기준으로 각 번호가 마지막으로 당첨번호에 포함된 뒤
        몇 회차가 지났는지 정렬했습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="최장 미출현"
          value={`${list[0].number}번`}
          hint={`${list[0].gap}회째`}
        />
        <Stat label="평균 출현 간격" value={`${avgGapAll.toFixed(1)}회`} />
        <Stat
          label="역대 최장 기록"
          value={`${longestEver.maxGap}회`}
          hint={`${longestEver.number}번`}
        />
        <Stat label="분석 회차" value={`${comma(totalRounds)}회`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="미출현 회차가 긴 순서">번호별 미출현 현황</SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[600px] text-sm">
              <caption className="sr-only">번호별 미출현 회차 순위표</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    번호
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    미출현 회차
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    마지막 출현
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    평균 간격
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    역대 최장
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((s) => (
                  <tr key={s.number} className="hover:bg-surface-2">
                    <th scope="row" className="px-4 py-2.5 text-left">
                      <Link
                        href={`/stats/number/${s.number}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <LottoBall n={s.number} size="sm" />
                        <span className="font-semibold">{s.number}번</span>
                      </Link>
                    </th>
                    <td className="px-4 py-2.5">
                      <Bar
                        value={s.gap}
                        max={maxGap || 1}
                        label={`${s.gap}회`}
                        color="var(--color-ball-red)"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <Link
                        href={`/results/${s.lastRound}`}
                        className="text-accent hover:underline"
                      >
                        {s.lastRound}회
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {s.avgGap.toFixed(1)}회
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {s.maxGap}회
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
        <SectionTitle sub="직전 회차 번호가 다음 회차에 다시 나온 개수">
          이월수(연속 출현) 분포
        </SectionTitle>
        <Card>
          <ul className="space-y-3">
            {carryOverStats.map((c) => (
              <li key={c.key}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{c.key}개 겹침</span>
                  <span className="text-xs text-muted">
                    {comma(c.count)}회 · {pct((c.count / totalCarry) * 100)}
                  </span>
                </div>
                <Bar value={c.count} max={Math.max(...carryOverStats.map((x) => x.count))} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            직전 회차 당첨번호 6개 중 몇 개가 다음 회차에도 나왔는지를 집계한
            분포입니다. 1개 정도 겹치는 경우가 가장 흔합니다.
          </p>
        </Card>
      </section>

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
            <h2 className="mt-0!">미출현 통계와 도박사의 오류</h2>
            <p>
              오래 나오지 않은 번호를 고르는 것은 가장 흔한 로또 전략 중
              하나입니다. 동전을 던져 앞면이 열 번 연속 나왔다면 다음엔 뒷면이
              나올 차례라고 느끼는 것과 같은 심리인데, 확률적으로는 근거가
              없습니다. 이를 <strong>도박사의 오류</strong>라고 부릅니다.
            </p>
            <p>
              로또 추첨기는 지난 회차 결과를 기억하지 않습니다. 어떤 번호가 50회
              동안 나오지 않았더라도, 다음 회차에 그 번호가 포함될 확률은 여전히
              6/45, 약 13.3%입니다. 다만 &lsquo;오래 쉰 번호는 다들 잘 고르지
              않는다&rsquo;는 점에서, 인기 없는 번호를 고르면 당첨 시 나눠 가질
              사람이 적어질 수는 있습니다.
            </p>
            <p>
              누적 출현 횟수는{" "}
              <Link href="/stats/frequency">번호별 출현 횟수</Link>에서, 확률
              계산은 <Link href="/guide/probability">로또 당첨 확률</Link>{" "}
              문서에서 자세히 다룹니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
