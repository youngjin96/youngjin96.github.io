import Link from "next/link";
import type { Metadata } from "next";
import { BallRow, LottoBall } from "@/components/LottoBall";
import { Bar, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, faqJsonLd, websiteJsonLd } from "@/components/JsonLd";
import { latestDraw, nextDrawDate, recentDraws, totalRounds } from "@/lib/draws";
import {
  analyzeDraw,
  firstPrize,
  hotNumbers,
  numberSummaries,
  overdueNumbers,
  patternStats,
} from "@/lib/stats";
import { weeklyPicks, weeklyStrategyLabels } from "@/lib/recommend";
import { comma, koreanDate, koreanMoney } from "@/lib/format";
import { siteConfig, pageMetadata } from "@/site.config";

export const metadata: Metadata = pageMetadata({
  title: `${latestDraw.round}회 로또 당첨번호 및 전 회차 통계`,
  description: `${latestDraw.round}회 로또 당첨번호는 ${latestDraw.numbers.join(", ")} + 보너스 ${latestDraw.bonus}. 전 회차 통계와 무료 번호 추천도 함께 제공합니다.`,
  path: "/",
});

const FAQS = [
  {
    q: "로또 당첨번호는 언제 발표되나요?",
    a: "로또 6/45 추첨은 매주 토요일 저녁 8시 35분에 진행되며, 추첨 방송이 끝나는 8시 45분경 당첨번호가 확정 발표됩니다. 등수별 당첨자 수와 당첨금은 같은 날 밤 늦게 확정 공개됩니다.",
  },
  {
    q: "가장 많이 나온 로또 번호는 무엇인가요?",
    a: `1회부터 ${latestDraw.round}회까지 집계하면 ${hotNumbers[0].number}번이 ${hotNumbers[0].count}회로 가장 많이 나왔습니다. 다만 회차마다 추첨은 독립적이어서 많이 나온 번호가 다음 회차에 다시 나올 확률이 높아지지는 않습니다.`,
  },
  {
    q: "로또 1등 당첨 확률은 얼마인가요?",
    a: "45개 번호 중 6개를 고르는 조합은 8,145,060가지이므로 1게임당 1등 확률은 814만분의 1(약 0.0000123%)입니다. 2등은 1/1,357,510, 3등은 1/35,724, 4등은 1/733, 5등은 1/45입니다.",
  },
  {
    q: "통계로 뽑은 번호가 당첨 확률을 높여주나요?",
    a: "아닙니다. 로또 추첨은 매번 독립적인 무작위 시행이므로 어떤 방식으로 번호를 고르든 1등 확률은 814만분의 1로 같습니다. 통계와 추천 기능은 번호를 고르는 재미를 위한 참고 자료로만 이용해 주세요.",
  },
];

const STAT_CARDS = [
  {
    href: "/stats/frequency",
    title: "번호별 출현 횟수",
    desc: "1~45번 전체 출현 횟수와 순위",
  },
  {
    href: "/stats/overdue",
    title: "미출현 회차",
    desc: "오래 안 나온 번호와 평균 출현 간격",
  },
  {
    href: "/stats/pairs",
    title: "궁합수 분석",
    desc: "함께 자주 나오는 번호 조합",
  },
  {
    href: "/stats/patterns",
    title: "조합 패턴",
    desc: "홀짝·고저·합계·AC값·연속번호",
  },
  {
    href: "/stats/prize",
    title: "당첨금 통계",
    desc: "역대 1등 당첨금과 당첨자 수",
  },
  {
    href: "/results/search",
    title: "내 번호 당첨 확인",
    desc: "고른 번호가 과거에 몇 등이었는지",
  },
];

export default function HomePage() {
  const next = nextDrawDate();
  const first = firstPrize(latestDraw);
  const pattern = analyzeDraw(latestDraw.numbers);
  const picks = weeklyPicks(next.round, numberSummaries, 5);
  const labels = weeklyStrategyLabels(5);
  const recent = recentDraws(6);
  const top10 = hotNumbers.slice(0, 10);
  const overdue10 = overdueNumbers.slice(0, 10);
  const mostCommonOdd = [...patternStats.odd].sort((a, b) => b.count - a.count)[0];

  return (
    <>
      <JsonLd data={[websiteJsonLd(), faqJsonLd(FAQS)]} />

      {/* ── 최신 회차 ─────────────────────────────────────────── */}
      <section aria-labelledby="latest-heading">
        <Card className="bg-gradient-to-br from-accent-soft to-surface">
          <p className="text-sm font-medium text-accent">
            {koreanDate(latestDraw.date)} 추첨
          </p>
          <h1
            id="latest-heading"
            className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {latestDraw.round}회 로또 당첨번호
          </h1>

          <BallRow
            numbers={latestDraw.numbers}
            bonus={latestDraw.bonus}
            size="xl"
            className="mt-5"
          />

          <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="1등 당첨자" value={`${comma(first?.winners ?? 0)}명`} />
            <Stat label="1등 당첨금" value={koreanMoney(first?.perWinner ?? 0)} />
            <Stat label="번호 합계" value={comma(pattern.sum)} />
            <Stat label="홀짝 비율" value={`${pattern.odd} : ${pattern.even}`} />
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/results/${latestDraw.round}`}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {latestDraw.round}회 상세 보기
            </Link>
            <Link
              href="/results"
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-2"
            >
              전 회차 당첨번호
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted">
            다음 <strong className="text-fg">{next.round}회</strong> 추첨:{" "}
            {koreanDate(next.date)} 오후 8시 35분
          </p>
        </Card>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      {/* ── 이번 주 추천 번호 ───────────────────────────────────── */}
      <section aria-labelledby="picks-heading" className="mt-8">
        <SectionTitle
          sub={`${comma(totalRounds)}회차 통계로 뽑은 ${next.round}회 추천 5조합`}
          href="/recommend"
          linkLabel="직접 뽑아보기"
        >
          <span id="picks-heading">{next.round}회 추천 번호</span>
        </SectionTitle>

        <Card>
          <ol className="divide-y divide-line">
            {picks.map((set, i) => (
              <li
                key={set.join("-")}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="w-14 shrink-0 text-xs font-semibold text-muted">
                  {String.fromCharCode(65 + i)}조합
                </span>
                <BallRow numbers={set} size="md" />
                <span className="ml-auto rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                  {labels[i]}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
            추천 번호는 회차별로 고정되어 매주 추첨 이후 새로 바뀝니다. 통계를
            바탕으로 뽑았을 뿐 당첨을 보장하지 않으며, 어떤 조합이든 1등 확률은
            8,145,060분의 1로 동일합니다.
          </p>
        </Card>
      </section>

      {/* ── 핫/콜드 ───────────────────────────────────────────── */}
      <section aria-labelledby="freq-heading" className="mt-8">
        <SectionTitle sub="1회차부터 지금까지 누적 집계" href="/stats/frequency">
          <span id="freq-heading">많이 나온 번호 · 오래 안 나온 번호</span>
        </SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-bold">최다 출현 번호 TOP 10</h3>
            <ul className="space-y-2">
              {top10.map((s) => (
                <li key={s.number} className="flex items-center gap-3">
                  <Link
                    href={`/stats/number/${s.number}`}
                    aria-label={`${s.number}번 통계 보기`}
                  >
                    <LottoBall n={s.number} size="sm" />
                  </Link>
                  <Bar value={s.count} max={top10[0].count} label={`${s.count}회`} />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-bold">오래 안 나온 번호 TOP 10</h3>
            <ul className="space-y-2">
              {overdue10.map((s) => (
                <li key={s.number} className="flex items-center gap-3">
                  <Link
                    href={`/stats/number/${s.number}`}
                    aria-label={`${s.number}번 통계 보기`}
                  >
                    <LottoBall n={s.number} size="sm" />
                  </Link>
                  <Bar
                    value={s.gap}
                    max={overdue10[0].gap}
                    label={`${s.gap}회째`}
                    color="var(--color-ball-red)"
                  />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              마지막으로 당첨번호에 포함된 뒤 지난 회차 수입니다.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 최근 회차 ─────────────────────────────────────────── */}
      <section aria-labelledby="recent-heading" className="mt-8">
        <SectionTitle sub="최근 6회차 당첨번호" href="/results">
          <span id="recent-heading">최근 당첨번호</span>
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <ul className="divide-y divide-line">
            {recent.map((d) => (
              <li key={d.round}>
                <Link
                  href={`/results/${d.round}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 hover:bg-surface-2 sm:px-6"
                >
                  <div className="w-20 shrink-0">
                    <span className="block text-sm font-bold">{d.round}회</span>
                    <span className="block text-[11px] text-muted">{d.date}</span>
                  </div>
                  <BallRow numbers={d.numbers} bonus={d.bonus} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      {/* ── 통계 요약 ─────────────────────────────────────────── */}
      <section aria-labelledby="summary-heading" className="mt-8">
        <SectionTitle sub="전 회차를 한눈에" href="/stats">
          <span id="summary-heading">로또 통계 한눈에 보기</span>
        </SectionTitle>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="누적 회차" value={`${comma(totalRounds)}회`} />
          <Stat
            label="평균 번호 합계"
            value={comma(patternStats.sumAvg)}
            hint={`${patternStats.sumMin}~${patternStats.sumMax} 분포`}
          />
          <Stat
            label="가장 흔한 홀짝"
            value={`${mostCommonOdd.key} : ${6 - mostCommonOdd.key}`}
            hint={`${mostCommonOdd.count}회`}
          />
          <Stat
            label="최다 출현"
            value={`${hotNumbers[0].number}번`}
            hint={`${hotNumbers[0].count}회`}
          />
        </dl>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
            >
              <h3 className="text-sm font-bold">{c.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ (구조화 데이터와 짝) ────────────────────────────── */}
      <section aria-labelledby="faq-heading" className="mt-10">
        <SectionTitle>
          <span id="faq-heading">자주 묻는 질문</span>
        </SectionTitle>
        <Card>
          <dl className="divide-y divide-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="mt-10">
        <Card>
          <Prose>
            <h2 className="mt-0!">{siteConfig.name}는 어떤 사이트인가요?</h2>
            <p>
              {siteConfig.name}는 동행복권이 공개한 로또 6/45 회차별 당첨번호를
              1회차부터 {latestDraw.round}회차까지 모두 모아 정리한 통계
              사이트입니다. 번호마다 몇 번 나왔는지, 마지막으로 나온 지 몇 회차가
              지났는지, 어떤 번호와 자주 짝을 이뤘는지를 한곳에서 확인할 수
              있습니다.
            </p>
            <p>
              데이터는 매주 토요일 추첨 직후 갱신됩니다. 회차별 상세 페이지에서는
              1등부터 5등까지 당첨자 수와 당첨금, 해당 회차 판매액, 1등 자동·수동
              비율까지 확인할 수 있습니다.
            </p>
            <p>
              번호 추천 기능은 누적 통계를 바탕으로 조합을 만들어주지만, 로또
              추첨은 매 회차 완전히 독립적인 무작위 시행입니다. 통계는 참고용일
              뿐 당첨 확률을 바꾸지 못한다는 점을 꼭 기억해 주세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
