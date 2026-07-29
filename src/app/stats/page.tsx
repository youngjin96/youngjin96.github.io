import Link from "next/link";
import type { Metadata } from "next";
import { LottoBall } from "@/components/LottoBall";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { latestDraw, totalRounds } from "@/lib/draws";
import {
  ALL_NUMBERS,
  coldNumbers,
  hotNumbers,
  numberStats,
  overdueNumbers,
  patternStats,
  prizeStats,
} from "@/lib/stats";
import { comma, koreanMoney } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export const metadata: Metadata = {
  title: `로또 통계 종합 - 1회~${latestDraw.round}회 전체 분석`,
  description: `로또 6/45 ${comma(totalRounds)}회차 데이터를 번호별 출현 횟수, 미출현 기간, 궁합수, 홀짝·합계·AC값 패턴, 당첨금 흐름까지 항목별로 분석했습니다.`,
  alternates: { canonical: absoluteUrl("/stats") },
};

const SECTIONS = [
  {
    href: "/stats/frequency",
    title: "번호별 출현 횟수",
    desc: "1~45번이 각각 몇 번 나왔는지 순위와 함께 정리했습니다.",
  },
  {
    href: "/stats/overdue",
    title: "미출현 회차",
    desc: "마지막 출현 이후 지난 회차와 번호별 평균 출현 간격입니다.",
  },
  {
    href: "/stats/pairs",
    title: "궁합수 (동시 출현)",
    desc: "같은 회차에 함께 나온 횟수가 많은 번호쌍을 보여줍니다.",
  },
  {
    href: "/stats/patterns",
    title: "조합 패턴 분석",
    desc: "홀짝 비율, 저고 비율, 번호 합계, AC값, 연속번호 분포입니다.",
  },
  {
    href: "/stats/prize",
    title: "당첨금 · 판매액 통계",
    desc: "역대 1등 당첨금과 당첨자 수, 연도별 판매액 추이입니다.",
  },
];

export default function StatsHubPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "통계" }];
  const maxCount = Math.max(...numberStats.map((s) => s.count));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 통계 종합
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        1회차부터 {latestDraw.round}회차까지 {comma(totalRounds)}개 회차,
        당첨번호 {comma(totalRounds * 6)}개를 집계한 결과입니다. 데이터는 매주
        추첨 직후 갱신됩니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="분석 회차" value={`${comma(totalRounds)}회`} />
        <Stat
          label="최다 출현"
          value={`${hotNumbers[0].number}번`}
          hint={`${hotNumbers[0].count}회`}
        />
        <Stat
          label="최소 출현"
          value={`${coldNumbers[0].number}번`}
          hint={`${coldNumbers[0].count}회`}
        />
        <Stat
          label="평균 1등 당첨금"
          value={koreanMoney(prizeStats.avgFirstPrize)}
        />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="보고 싶은 통계를 선택하세요">
          통계 항목
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2"
              >
                <h2 className="font-bold">{s.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {s.desc}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionTitle sub="번호를 누르면 해당 번호의 상세 통계로 이동합니다">
          번호별 통계 바로가기
        </SectionTitle>
        <Card>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
            {ALL_NUMBERS.map((n) => {
              const s = numberStats[n - 1];
              return (
                <li key={n}>
                  <Link
                    href={`/stats/number/${n}`}
                    className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface-2 py-2 hover:bg-surface"
                    style={{
                      opacity: 0.55 + (s.count / maxCount) * 0.45,
                    }}
                  >
                    <LottoBall n={n} size="sm" />
                    <span className="text-[11px] tabular-nums text-muted">
                      {s.count}회
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>요약 지표</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-bold">가장 많이 나온 번호 5개</h3>
            <ol className="space-y-2">
              {hotNumbers.slice(0, 5).map((s, i) => (
                <li key={s.number} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-muted tabular-nums">{i + 1}</span>
                  <LottoBall n={s.number} size="sm" />
                  <span className="font-medium">{s.number}번</span>
                  <span className="ml-auto tabular-nums text-muted">
                    {s.count}회
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-bold">가장 오래 안 나온 번호 5개</h3>
            <ol className="space-y-2">
              {overdueNumbers.slice(0, 5).map((s, i) => (
                <li key={s.number} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-muted tabular-nums">{i + 1}</span>
                  <LottoBall n={s.number} size="sm" />
                  <span className="font-medium">{s.number}번</span>
                  <span className="ml-auto tabular-nums text-muted">
                    {s.gap}회째 미출현
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">통계를 읽을 때 알아두면 좋은 것</h2>
            <p>
              45개 번호가 균등하게 나온다면 한 번호가 나올 기대 횟수는{" "}
              {comma((totalRounds * 6) / 45)}회입니다. 실제로는{" "}
              {hotNumbers[0].count}회부터 {coldNumbers[0].count}회까지 편차가
              있는데, 이는 무작위 추첨에서 자연스럽게 생기는 통계적 변동 범위
              안에 있습니다. 특정 번호가 더 잘 나오도록 설계되어 있다는 뜻이
              아닙니다.
            </p>
            <p>
              현재 가장 흔한 홀짝 구성은{" "}
              {(() => {
                const b = [...patternStats.odd].sort(
                  (a, c) => c.count - a.count,
                )[0];
                return `홀 ${b.key} : 짝 ${6 - b.key}`;
              })()}
              이고, 번호 합계의 평균은 {comma(patternStats.sumAvg)}입니다. 이런
              지표는 조합을 고를 때의 참고 기준일 뿐, 당첨 확률 자체를 바꾸지는
              않습니다.
            </p>
            <p>
              통계를 바탕으로 조합을 자동으로 만들어 보고 싶다면{" "}
              <Link href="/recommend">번호 추천</Link> 페이지를 이용하세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
