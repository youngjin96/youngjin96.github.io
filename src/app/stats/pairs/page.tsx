import Link from "next/link";
import type { Metadata } from "next";
import { LottoBall } from "@/components/LottoBall";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { latestDraw, totalRounds } from "@/lib/draws";
import { ALL_NUMBERS, bestPartners, topPairs } from "@/lib/stats";
import { comma } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export const metadata: Metadata = {
  title: `로또 궁합수 - 함께 자주 나온 번호 조합 순위`,
  description: `1회부터 ${latestDraw.round}회까지 같은 회차에 함께 나온 로또 번호쌍을 집계했습니다. 궁합수 TOP 30과 1~45번 각각의 최고 궁합 번호를 확인하세요.`,
  alternates: { canonical: absoluteUrl("/stats/pairs") },
};

export default function PairsPage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: "궁합수" },
  ];

  const pairs = topPairs(30);
  const maxPair = pairs[0].count;
  // 두 번호가 한 회차에 함께 나올 기대 횟수 = C(43,4)/C(45,6) * 회차수
  const expected = (totalRounds * (6 * 5)) / (45 * 44);

  const FAQS = [
    {
      q: "로또 궁합수란 무엇인가요?",
      a: "궁합수는 같은 회차에 함께 당첨번호로 뽑힌 번호쌍을 뜻합니다. 특정 두 번호가 과거에 몇 번이나 같이 나왔는지를 세어 순위를 매긴 것으로, 번호 조합을 고를 때 참고 자료로 쓰입니다.",
    },
    {
      q: "가장 궁합이 좋은 번호 조합은?",
      a: `1회부터 ${latestDraw.round}회까지 집계하면 ${pairs[0].a}번과 ${pairs[0].b}번이 ${pairs[0].count}회로 가장 많이 함께 나왔습니다. 다음은 ${pairs[1].a}·${pairs[1].b}번(${pairs[1].count}회), ${pairs[2].a}·${pairs[2].b}번(${pairs[2].count}회) 순입니다.`,
    },
    {
      q: "궁합수가 실제로 당첨에 도움이 되나요?",
      a: `두 번호가 한 회차에 함께 나올 확률은 이론적으로 약 ${((6 * 5) / (45 * 44) * 100).toFixed(2)}%이고, ${comma(totalRounds)}회차 기준 기대 동시 출현 횟수는 약 ${expected.toFixed(1)}회입니다. 상위 조합이 기대치보다 많이 나온 것은 무작위 변동 범위 안의 결과이며, 앞으로의 당첨 확률을 높여주지는 않습니다.`,
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 궁합수 (동시 출현 분석)
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        같은 회차에 함께 뽑힌 번호쌍을 990개 조합 전부에 대해 집계했습니다.
        (45개 번호에서 2개를 고르는 경우의 수)
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="최고 궁합"
          value={`${pairs[0].a} · ${pairs[0].b}`}
          hint={`${pairs[0].count}회`}
        />
        <Stat label="기대 동시 출현" value={`${expected.toFixed(1)}회`} />
        <Stat label="분석 조합 수" value="990쌍" />
        <Stat label="분석 회차" value={`${comma(totalRounds)}회`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="함께 나온 횟수가 많은 순서">궁합수 TOP 30</SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[520px] text-sm">
              <caption className="sr-only">로또 궁합수 상위 30개 조합</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    순위
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    번호쌍
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    동시 출현
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    기대 대비
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pairs.map((p, i) => (
                  <tr key={`${p.a}-${p.b}`} className="hover:bg-surface-2">
                    <td className="px-4 py-2.5 tabular-nums text-muted">
                      {i + 1}
                    </td>
                    <th scope="row" className="px-4 py-2.5 text-left">
                      <span className="flex items-center gap-1.5">
                        <Link href={`/stats/number/${p.a}`}>
                          <LottoBall n={p.a} size="sm" />
                        </Link>
                        <Link href={`/stats/number/${p.b}`}>
                          <LottoBall n={p.b} size="sm" />
                        </Link>
                      </span>
                    </th>
                    <td className="px-4 py-2.5">
                      <Bar value={p.count} max={maxPair} label={`${p.count}회`} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                      +{(p.count - expected).toFixed(1)}
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
        <SectionTitle sub="각 번호와 가장 많이 함께 나온 번호 3개">
          번호별 최고 궁합수
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    번호
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    궁합수 TOP 3
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ALL_NUMBERS.map((n) => {
                  const top3 = bestPartners(n, 3);
                  return (
                    <tr key={n} className="hover:bg-surface-2">
                      <th scope="row" className="px-4 py-2.5 text-left">
                        <Link
                          href={`/stats/number/${n}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <LottoBall n={n} size="sm" />
                          <span className="font-semibold">{n}번</span>
                        </Link>
                      </th>
                      <td className="px-4 py-2.5">
                        <span className="flex flex-wrap items-center gap-2">
                          {top3.map((p) => (
                            <span
                              key={p.number}
                              className="flex items-center gap-1"
                            >
                              <LottoBall n={p.number} size="sm" />
                              <span className="text-xs tabular-nums text-muted">
                                {p.count}회
                              </span>
                            </span>
                          ))}
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
            <h2 className="mt-0!">궁합수를 읽는 법</h2>
            <p>
              두 번호가 같은 회차에 함께 뽑힐 확률은 (6/45) × (5/44), 약{" "}
              {(((6 * 5) / (45 * 44)) * 100).toFixed(2)}%입니다. 회차가{" "}
              {comma(totalRounds)}회 쌓였으니 어떤 번호쌍이든 평균{" "}
              {expected.toFixed(1)}회 정도 함께 나오는 것이 정상입니다.
            </p>
            <p>
              상위 조합이 {maxPair}회까지 올라간 것은 990개 조합을 모두 세다 보면
              그중 가장 운이 좋았던 조합이 평균보다 꽤 위에 있게 되는, 통계에서
              흔한 현상입니다. 990번 동전을 던지는 실험을 하면 그중 몇 개는
              유난히 앞면이 많이 나오는 것과 같습니다.
            </p>
            <p>
              그래도 궁합수는 조합을 고를 때 나름의 기준이 되어 줍니다. 특정
              번호를 이미 정해 뒀다면 그 번호의 상세 페이지에서 궁합수를 확인해
              나머지를 채우거나,{" "}
              <Link href="/recommend">번호 추천</Link>에서 고정수로 지정한 뒤
              자동으로 조합을 만들어 보세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
