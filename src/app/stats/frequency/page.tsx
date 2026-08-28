import Link from "next/link";
import type { Metadata } from "next";
import { LottoBall } from "@/components/LottoBall";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { latestDraw, totalRounds } from "@/lib/draws";
import {
  coldNumbers,
  frequencyInRecent,
  hotNumbers,
  numberStats,
  RANGE_BUCKETS,
} from "@/lib/stats";
import { comma, pct } from "@/lib/format";
import { pageMetadata } from "@/site.config";

export const metadata: Metadata = pageMetadata({
  title: `로또 번호별 출현 횟수 - 많이 나온 번호 순위 (1~${latestDraw.round}회)`,
  description: `1회~${latestDraw.round}회 로또 번호 1~45번의 출현 횟수 순위입니다. 최근 50·100회 기준과 구간별 분포도 함께.`,
  path: "/stats/frequency",
});

const FAQS = [
  {
    q: "로또에서 가장 많이 나온 번호는?",
    a: `1회부터 ${latestDraw.round}회까지 누적하면 ${hotNumbers[0].number}번이 ${hotNumbers[0].count}회로 가장 많이 나왔고, 그 뒤를 ${hotNumbers[1].number}번(${hotNumbers[1].count}회), ${hotNumbers[2].number}번(${hotNumbers[2].count}회)이 잇습니다.`,
  },
  {
    q: "가장 적게 나온 로또 번호는?",
    a: `${coldNumbers[0].number}번이 ${coldNumbers[0].count}회로 가장 적게 나왔습니다. 최다 출현 번호와의 차이는 ${hotNumbers[0].count - coldNumbers[0].count}회입니다.`,
  },
  {
    q: "번호마다 출현 횟수가 다른 이유는 무엇인가요?",
    a: `번호가 완전히 균등하게 나온다면 각 번호의 기대 출현 횟수는 ${Math.round((totalRounds * 6) / 45)}회입니다. 실제 집계에서 생기는 차이는 무작위 추첨에서 자연스럽게 나타나는 통계적 변동으로, 특정 번호가 더 잘 나오도록 되어 있다는 의미가 아닙니다.`,
  },
];

export default function FrequencyPage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: "번호별 출현 횟수" },
  ];

  const ranked = hotNumbers;
  const maxCount = ranked[0].count;
  const expected = (totalRounds * 6) / 45;
  const recent50 = frequencyInRecent(50);
  const recent100 = frequencyInRecent(100);
  const recent50Max = Math.max(...recent50.map((r) => r.count));

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 번호별 출현 횟수
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        1회차부터 {latestDraw.round}회차까지 당첨번호로 뽑힌 {comma(totalRounds * 6)}
        개의 번호를 집계했습니다. 보너스 번호는 별도로 표시했습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="최다 출현"
          value={`${ranked[0].number}번`}
          hint={`${ranked[0].count}회`}
        />
        <Stat
          label="최소 출현"
          value={`${coldNumbers[0].number}번`}
          hint={`${coldNumbers[0].count}회`}
        />
        <Stat label="번호당 기대 횟수" value={`${comma(expected)}회`} />
        <Stat
          label="최대-최소 차이"
          value={`${ranked[0].count - coldNumbers[0].count}회`}
        />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="출현 횟수 순위 (누적 전체)">
          번호별 출현 횟수 순위
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[600px] text-sm">
              <caption className="sr-only">
                로또 번호별 누적 출현 횟수 순위표
              </caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    순위
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    번호
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    출현 횟수
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    출현율
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    보너스
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    최근 출현
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ranked.map((s) => (
                  <tr key={s.number} className="hover:bg-surface-2">
                    <td className="px-4 py-2.5 tabular-nums text-muted">
                      {s.rank}
                    </td>
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
                      <Bar value={s.count} max={maxCount} label={`${s.count}회`} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {pct(s.rate)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {s.bonusCount}회
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      {s.lastRound}회
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
        <SectionTitle sub="최근 흐름은 누적 통계와 다를 수 있습니다">
          최근 50회 / 100회 출현 횟수
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    번호
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    최근 50회
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    최근 100회
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    전체
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[...recent50]
                  .sort((a, b) => b.count - a.count || a.number - b.number)
                  .map((r) => (
                    <tr key={r.number} className="hover:bg-surface-2">
                      <th scope="row" className="px-4 py-2.5 text-left">
                        <Link
                          href={`/stats/number/${r.number}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <LottoBall n={r.number} size="sm" />
                          <span className="font-semibold">{r.number}번</span>
                        </Link>
                      </th>
                      <td className="px-4 py-2.5">
                        <Bar
                          value={r.count}
                          max={recent50Max}
                          label={`${r.count}회`}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                        {recent100[r.number - 1].count}회
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                        {numberStats[r.number - 1].count}회
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="10단위 구간별 누적 출현 수">구간별 분포</SectionTitle>
        <Card>
          <ul className="space-y-3">
            {RANGE_BUCKETS.map((b) => {
              const count = numberStats
                .filter((s) => s.number >= b.min && s.number <= b.max)
                .reduce((a, s) => a + s.count, 0);
              const size = b.max - b.min + 1;
              const max = totalRounds * 6;
              return (
                <li key={b.label}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{b.label}</span>
                    <span className="text-xs text-muted">
                      {comma(count)}회 · 번호당 평균 {comma(count / size)}회
                    </span>
                  </div>
                  <Bar value={count} max={max / 3} label={pct((count / max) * 100)} />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            41~45 구간은 번호가 5개뿐이라 구간 합계가 작게 나옵니다. 구간을
            비교할 때는 &lsquo;번호당 평균&rsquo; 값을 보세요.
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
            <h2 className="mt-0!">출현 횟수 통계를 어떻게 활용할까</h2>
            <p>
              출현 횟수가 많은 번호를 &lsquo;핫넘버&rsquo;, 적은 번호를
              &lsquo;콜드넘버&rsquo;라고 부릅니다. 핫넘버를 고르는 사람은 흐름을
              따라가려는 쪽이고, 콜드넘버를 고르는 사람은 평균으로 되돌아올
              것이라 보는 쪽입니다. 두 전략 모두 나름의 논리가 있지만, 확률적으로
              어느 쪽이 더 유리하지는 않습니다.
            </p>
            <p>
              통계적으로 의미가 있는 부분은 오히려 다른 데 있습니다. 많은 사람이
              고르는 번호(생일에 몰린 1~31, 연속된 번호, 대각선 패턴 등)를 피하면
              당첨 시 당첨금을 나눠 가질 사람이 줄어듭니다. 당첨 확률은 그대로지만
              기대 수령액은 조금 올라갑니다.
            </p>
            <p>
              번호별 상세 기록은 각 번호를 눌러 확인할 수 있고, 오래 안 나온
              번호는 <Link href="/stats/overdue">미출현 회차</Link>에서, 함께
              나오는 번호는 <Link href="/stats/pairs">궁합수</Link>에서 볼 수
              있습니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
