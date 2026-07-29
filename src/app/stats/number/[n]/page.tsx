import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BallRow, LottoBall } from "@/components/LottoBall";
import { Bar, Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { draws, getDraw, latestDraw, totalRounds } from "@/lib/draws";
import {
  ALL_NUMBERS,
  bestPartners,
  getNumberStat,
  worstPartners,
} from "@/lib/stats";
import { comma, pct } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export function generateStaticParams() {
  return ALL_NUMBERS.map((n) => ({ n: String(n) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/stats/number/[n]">): Promise<Metadata> {
  const { n } = await params;
  const s = getNumberStat(Number(n));
  if (!s) return { title: "번호를 찾을 수 없습니다" };

  return {
    title: `로또 ${s.number}번 통계 - 출현 횟수 ${s.count}회, 최근 ${s.lastRound}회`,
    description: `로또 6/45 ${s.number}번은 1회부터 ${latestDraw.round}회까지 ${s.count}회 나와 출현 순위 ${s.rank}위입니다. 마지막 출현은 ${s.lastRound}회이며 평균 출현 간격은 ${s.avgGap.toFixed(1)}회입니다. ${s.number}번과 함께 자주 나온 궁합수도 확인하세요.`,
    alternates: { canonical: absoluteUrl(`/stats/number/${s.number}`) },
  };
}

export default async function NumberPage({
  params,
}: PageProps<"/stats/number/[n]">) {
  const { n } = await params;
  const num = Number(n);
  const s = getNumberStat(num);
  if (!s) notFound();

  const partners = bestPartners(num, 10);
  const rare = worstPartners(num, 5);
  const maxPartner = partners[0].count;
  const recentAppearances = s.rounds.slice(-10).reverse();
  const expected = (totalRounds * 6) / 45;
  const diff = s.count - expected;

  // 최근 100회 안에서 몇 번 나왔는지
  const recent100 = draws
    .slice(-100)
    .filter((d) => d.numbers.includes(num)).length;

  const prevNum = num > 1 ? num - 1 : null;
  const nextNum = num < 45 ? num + 1 : null;

  const crumbs = [
    { name: "홈", href: "/" },
    { name: "통계", href: "/stats" },
    { name: `${num}번` },
  ];

  const FAQS = [
    {
      q: `로또 ${num}번은 몇 번 나왔나요?`,
      a: `${num}번은 1회부터 ${latestDraw.round}회까지 본번호로 ${s.count}회 나왔습니다. 전체 45개 번호 중 출현 횟수 ${s.rank}위이며, 보너스 번호로는 ${s.bonusCount}회 나왔습니다.`,
    },
    {
      q: `로또 ${num}번이 마지막으로 나온 건 언제인가요?`,
      a: `가장 최근 출현은 ${s.lastRound}회입니다. ${latestDraw.round}회 기준으로 ${s.gap}회째 나오지 않고 있으며, 역대 최장 미출현 기록은 ${s.maxGap}회입니다.`,
    },
    {
      q: `${num}번과 궁합이 좋은 번호는?`,
      a: `${num}번과 같은 회차에 가장 많이 함께 나온 번호는 ${partners[0].number}번으로 ${partners[0].count}회 동시 출현했습니다. 그 다음은 ${partners[1].number}번(${partners[1].count}회), ${partners[2].number}번(${partners[2].count}회)입니다.`,
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <div className="flex items-center gap-4">
        <LottoBall n={num} size="xl" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            로또 {num}번 통계
          </h1>
          <p className="mt-1 text-sm text-muted">
            1회 ~ {latestDraw.round}회 누적 분석
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        {num}번은 지금까지 <strong className="text-fg">{s.count}회</strong>{" "}
        당첨번호에 포함되어 출현 순위{" "}
        <strong className="text-fg">{s.rank}위</strong>입니다. 전체 회차의{" "}
        {pct(s.rate)}에 해당하며, 균등 분포에서 기대되는{" "}
        {comma(expected)}회와 비교하면 {diff >= 0 ? "+" : ""}
        {comma(diff)}회{diff >= 0 ? " 많습니다" : " 적습니다"}.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="출현 횟수" value={`${s.count}회`} hint={`${s.rank}위`} />
        <Stat label="출현율" value={pct(s.rate)} />
        <Stat
          label="마지막 출현"
          value={`${s.lastRound}회`}
          hint={`${s.gap}회째 미출현`}
        />
        <Stat label="평균 출현 간격" value={`${s.avgGap.toFixed(1)}회`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub={`${num}번과 같은 회차에 함께 나온 횟수`}>
          {num}번 궁합수 TOP 10
        </SectionTitle>
        <Card>
          <ul className="space-y-2">
            {partners.map((p) => (
              <li key={p.number} className="flex items-center gap-3">
                <Link
                  href={`/stats/number/${p.number}`}
                  aria-label={`${p.number}번 통계`}
                >
                  <LottoBall n={p.number} size="sm" />
                </Link>
                <Bar value={p.count} max={maxPartner} label={`${p.count}회`} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            반대로 {num}번과 가장 적게 만난 번호는{" "}
            {rare.map((r) => `${r.number}번(${r.count}회)`).join(", ")}입니다.
            전체 궁합수 순위는{" "}
            <Link href="/stats/pairs" className="text-accent hover:underline">
              궁합수 분석
            </Link>
            에서 볼 수 있습니다.
          </p>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub={`${num}번이 나온 최근 10개 회차`}>
          최근 출현 회차
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <ul className="divide-y divide-line">
            {recentAppearances.map((round) => {
              const d = getDraw(round)!;
              return (
                <li key={round}>
                  <Link
                    href={`/results/${round}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 hover:bg-surface-2 sm:px-6"
                  >
                    <div className="w-20 shrink-0">
                      <span className="block text-sm font-bold">{round}회</span>
                      <span className="block text-[11px] text-muted">
                        {d.date}
                      </span>
                    </div>
                    <BallRow numbers={d.numbers} bonus={d.bonus} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      <section className="mt-8">
        <SectionTitle>{num}번 상세 지표</SectionTitle>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="보너스 출현" value={`${s.bonusCount}회`} />
          <Stat label="최근 100회 출현" value={`${recent100}회`} />
          <Stat label="역대 최장 미출현" value={`${s.maxGap}회`} />
          <Stat
            label="첫 출현"
            value={s.rounds.length ? `${s.rounds[0]}회` : "-"}
          />
        </dl>
      </section>

      <nav
        aria-label="번호 이동"
        className="mt-8 flex items-center justify-between gap-3"
      >
        {prevNum ? (
          <Link
            href={`/stats/number/${prevNum}`}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-2"
          >
            <span aria-hidden>←</span>
            <LottoBall n={prevNum} size="sm" />
            <span>{prevNum}번</span>
          </Link>
        ) : (
          <span />
        )}
        <Link href="/stats" className="text-sm text-accent hover:underline">
          전체 번호
        </Link>
        {nextNum ? (
          <Link
            href={`/stats/number/${nextNum}`}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-2"
          >
            <span>{nextNum}번</span>
            <LottoBall n={nextNum} size="sm" />
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section className="mt-8">
        <SectionTitle>번호 바로가기</SectionTitle>
        <Card>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5">
            {ALL_NUMBERS.map((x) => (
              <li key={x}>
                <Link
                  href={`/stats/number/${x}`}
                  aria-label={`${x}번 통계`}
                  className={`flex aspect-square items-center justify-center rounded-full ${
                    x === num ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <LottoBall n={x} size="md" />
                </Link>
              </li>
            ))}
          </ul>
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
            <h2 className="mt-0!">로또 {num}번 정리</h2>
            <p>
              {num}번은 전체 {comma(totalRounds)}회차 가운데 {s.count}회
              당첨번호에 포함되었습니다. 45개 번호가 완전히 균등하게 나온다면 각
              번호는 약 {comma(expected)}회 나오게 되는데, {num}번은 그보다{" "}
              {Math.abs(Math.round(diff))}회 {diff >= 0 ? "많이" : "적게"} 나온
              셈입니다. 이 정도 차이는 무작위 추첨에서 흔히 나타나는 범위입니다.
            </p>
            <p>
              최근 100회 기준으로는 {recent100}회 나왔고, 현재 {s.gap}회째 쉬고
              있습니다. {num}번의 역대 최장 미출현 기록은 {s.maxGap}회입니다.
              다만 얼마나 쉬었든 다음 회차에 {num}번이 뽑힐 확률은 항상 6/45(약
              13.3%)로 같습니다.
            </p>
            <p>
              {num}번을 넣어 조합을 만들고 싶다면{" "}
              <Link href="/recommend">번호 추천</Link>에서 고정수로 지정할 수
              있습니다.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
