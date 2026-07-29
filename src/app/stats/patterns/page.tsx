import Link from "next/link";
import type { Metadata } from "next";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { latestDraw, totalRounds } from "@/lib/draws";
import { analyzeDraw, patternStats, RANGE_BUCKETS } from "@/lib/stats";
import { comma, pct } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export const metadata: Metadata = {
  title: "로또 조합 패턴 분석 - 홀짝·합계·AC값·연속번호 통계",
  description: `역대 로또 6/45 ${comma(totalRounds)}개 당첨 조합의 홀짝 비율, 저고 비율, 번호 합계 분포, AC값, 연속번호 출현 빈도를 분석했습니다. 어떤 조합 형태가 실제로 자주 나왔는지 확인하세요.`,
  alternates: { canonical: absoluteUrl("/stats/patterns") },
};

function DistList({
  rows,
  format,
  total,
}: {
  rows: { key: number; count: number }[];
  format: (k: number) => string;
  total: number;
}) {
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold">{format(r.key)}</span>
            <span className="text-xs text-muted">
              {comma(r.count)}회 · {pct((r.count / total) * 100)}
            </span>
          </div>
          <Bar value={r.count} max={max} />
        </li>
      ))}
    </ul>
  );
}

export default function PatternsPage() {
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: "조합 패턴" },
  ];

  const total = patternStats.total;
  const latest = analyzeDraw(latestDraw.numbers);
  const bestOdd = [...patternStats.odd].sort((a, b) => b.count - a.count)[0];
  const bestLow = [...patternStats.low].sort((a, b) => b.count - a.count)[0];
  const bestAc = [...patternStats.ac].sort((a, b) => b.count - a.count)[0];
  const bestSum = [...patternStats.sumBuckets].sort(
    (a, b) => b.count - a.count,
  )[0];
  const noConsecutive =
    patternStats.consecutive.find((c) => c.key === 0)?.count ?? 0;

  const FAQS = [
    {
      q: "로또 번호 합계는 보통 얼마인가요?",
      a: `역대 당첨 조합의 번호 합계 평균은 ${comma(patternStats.sumAvg)}이고, 최소 ${patternStats.sumMin}부터 최대 ${patternStats.sumMax}까지 분포합니다. 가장 흔한 구간은 ${bestSum.label}로 ${bestSum.count}회(${pct((bestSum.count / total) * 100)}) 나왔습니다.`,
    },
    {
      q: "홀수와 짝수는 어떤 비율이 가장 많나요?",
      a: `홀수 ${bestOdd.key}개, 짝수 ${6 - bestOdd.key}개 조합이 ${bestOdd.count}회로 가장 많았습니다. 전체의 ${pct((bestOdd.count / total) * 100)}에 해당합니다. 홀수 6개나 짝수 6개처럼 한쪽에 몰린 조합은 드물게 나옵니다.`,
    },
    {
      q: "AC값이란 무엇인가요?",
      a: "AC값(Arithmetic Complexity)은 당첨번호 6개에서 두 개씩 뽑아 만든 차이값이 서로 몇 종류나 되는지 센 뒤 5를 뺀 값입니다. 0부터 10까지 나올 수 있으며, 값이 클수록 번호가 고르게 흩어진 조합입니다. 역대 당첨 조합에서는 AC값 " + bestAc.key + "이(가) 가장 흔합니다.",
    },
    {
      q: "연속된 번호는 얼마나 자주 나오나요?",
      a: `연속 번호가 하나도 없는 조합은 ${comma(noConsecutive)}회(${pct((noConsecutive / total) * 100)})였습니다. 즉 절반 가까운 회차에서 12·13처럼 이어진 번호가 최소 한 쌍은 나왔습니다.`,
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 조합 패턴 분석
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        역대 {comma(total)}개 당첨 조합이 어떤 형태였는지 항목별로 분석했습니다.
        내 번호가 &lsquo;흔한 모양&rsquo;인지 확인해 보세요.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="평균 번호 합계"
          value={comma(patternStats.sumAvg)}
          hint={`${patternStats.sumMin}~${patternStats.sumMax}`}
        />
        <Stat
          label="가장 흔한 홀짝"
          value={`${bestOdd.key} : ${6 - bestOdd.key}`}
          hint={pct((bestOdd.count / total) * 100)}
        />
        <Stat
          label="가장 흔한 저고"
          value={`${bestLow.key} : ${6 - bestLow.key}`}
          hint="1~22 / 23~45"
        />
        <Stat
          label="가장 흔한 AC값"
          value={bestAc.key}
          hint={pct((bestAc.count / total) * 100)}
        />
      </dl>

      <Card className="mt-4">
        <h2 className="text-sm font-bold">
          최신 {latestDraw.round}회 조합은 어땠나요?
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="합계" value={latest.sum} />
          <Stat label="홀 : 짝" value={`${latest.odd} : ${latest.even}`} />
          <Stat label="저 : 고" value={`${latest.low} : ${latest.high}`} />
          <Stat label="AC값" value={latest.ac} />
          <Stat label="연속번호" value={`${latest.consecutive}쌍`} />
          <Stat label="끝수 합" value={latest.tailSum} />
        </dl>
        <p className="mt-3 text-xs text-muted">
          <Link
            href={`/results/${latestDraw.round}`}
            className="text-accent hover:underline"
          >
            {latestDraw.round}회 상세 보기 →
          </Link>
        </p>
      </Card>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-bold">홀짝 비율 분포</h2>
          <DistList
            rows={patternStats.odd}
            total={total}
            format={(k) => `홀 ${k} : 짝 ${6 - k}`}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold">
            저고 비율 분포 <span className="font-normal text-muted">(1~22 / 23~45)</span>
          </h2>
          <DistList
            rows={patternStats.low}
            total={total}
            format={(k) => `저 ${k} : 고 ${6 - k}`}
          />
        </Card>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-bold">AC값 분포</h2>
          <DistList
            rows={patternStats.ac.filter((r) => r.count > 0)}
            total={total}
            format={(k) => `AC ${k}`}
          />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            AC값은 번호 간 차이가 얼마나 다양한지를 나타냅니다. 값이 작을수록
            등차수열처럼 규칙적인 조합입니다.
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold">연속번호 쌍 개수</h2>
          <DistList
            rows={patternStats.consecutive.filter((r) => r.count > 0)}
            total={total}
            format={(k) => (k === 0 ? "연속 없음" : `${k}쌍`)}
          />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            12·13처럼 이어진 번호가 몇 쌍 있었는지 집계했습니다. 세 개가 연달아
            나오면(12·13·14) 2쌍으로 셉니다.
          </p>
        </Card>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      <section className="mt-8">
        <SectionTitle sub="6개 번호를 모두 더한 값">번호 합계 분포</SectionTitle>
        <Card>
          <DistList
            rows={patternStats.sumBuckets
              .filter((b) => b.count > 0)
              .map((b) => ({ key: b.min, count: b.count }))}
            total={total}
            format={(k) => `${k}~${k + 19}`}
          />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            이론상 최소 합계는 1+2+3+4+5+6 = 21, 최대는 40+41+42+43+44+45 =
            255입니다. 실제 당첨 조합은 평균 {comma(patternStats.sumAvg)} 부근에
            몰려 있으며, 100~175 구간에 대부분이 들어갑니다.
          </p>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="10단위 구간에서 나온 번호의 총 개수">
          구간별 출현 분포
        </SectionTitle>
        <Card>
          <ul className="space-y-3">
            {patternStats.ranges.map((r) => {
              const size = r.max - r.min + 1;
              return (
                <li key={r.label}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-xs text-muted">
                      {comma(r.count)}회 · 번호당 {comma(r.count / size)}회
                    </span>
                  </div>
                  <Bar
                    value={r.count / size}
                    max={Math.max(
                      ...patternStats.ranges.map(
                        (x) => x.count / (x.max - x.min + 1),
                      ),
                    )}
                  />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            41~45 구간은 번호가 {RANGE_BUCKETS[4].max - RANGE_BUCKETS[4].min + 1}
            개뿐이므로 구간 합계가 작습니다. 공정한 비교를 위해 번호당 평균을
            함께 표시했습니다.
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
            <h2 className="mt-0!">패턴 통계, 어디까지 믿어야 할까</h2>
            <p>
              번호 합계가 100~175에 몰리고 홀짝이 3:3 근처에 몰리는 것은 특별한
              현상이 아니라 <strong>조합의 개수 자체가 그렇기 때문</strong>입니다.
              합계가 21이 되는 조합은 딱 하나(1~6)뿐이지만, 합계가 138이 되는
              조합은 수만 가지입니다. 가운데 값이 자주 나오는 건 당연한
              결과입니다.
            </p>
            <p>
              그래서 &lsquo;합계 100~175 조합을 고르면 당첨 확률이 올라간다&rsquo;는
              말은 정확하지 않습니다. 그 구간의 조합이 많으니 당첨 조합도 그
              구간에서 많이 나올 뿐, 조합 하나하나의 당첨 확률은 여전히
              8,145,060분의 1로 모두 같습니다.
            </p>
            <p>
              패턴 통계의 진짜 쓸모는 다른 데 있습니다. 1·2·3·4·5·6이나 모두
              같은 끝수처럼 <strong>사람들이 몰리는 조합을 피하는 것</strong>입니다.
              당첨 확률은 그대로여도, 당첨됐을 때 나눠 가질 사람이 줄어들기
              때문입니다. 이 논리를 적용한 조합은{" "}
              <Link href="/recommend">번호 추천</Link>의 &lsquo;통계 밸런스&rsquo;
              모드에서 만들 수 있습니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
