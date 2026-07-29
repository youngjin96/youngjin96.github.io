import Link from "next/link";
import type { Metadata } from "next";
import { BallRow } from "@/components/LottoBall";
import { Breadcrumbs, Card, Prose, SectionTitle } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { Recommender } from "@/components/Recommender";
import { latestDraw, nextDrawDate, totalRounds } from "@/lib/draws";
import { hotNumbers, numberSummaries, overdueNumbers } from "@/lib/stats";
import { STRATEGIES, weeklyPicks, weeklyStrategyLabels } from "@/lib/recommend";
import { comma, koreanDate } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

const next = nextDrawDate();

export const metadata: Metadata = {
  title: `로또 번호 추천 - ${next.round}회 통계 기반 자동 번호 생성기`,
  description: `${comma(totalRounds)}회차 당첨 통계를 바탕으로 로또 번호를 자동으로 뽑아드립니다. 많이 나온 번호, 오래 안 나온 번호, 통계 밸런스 등 5가지 방식과 고정수·제외수 설정을 지원합니다. 회원가입 없이 무료로 이용하세요.`,
  alternates: { canonical: absoluteUrl("/recommend") },
};

const FAQS = [
  {
    q: "로또 번호 추천은 무료인가요?",
    a: "네, 회원가입이나 로그인 없이 무제한으로 이용할 수 있습니다. 번호는 브라우저에서 바로 생성되며 서버에 저장되지 않습니다.",
  },
  {
    q: "어떤 추천 방식을 고르는 게 좋나요?",
    a: "확률적으로는 모든 방식이 동일합니다. 굳이 고르자면 역대 당첨 조합에서 흔한 형태를 따라가는 '통계 밸런스'가 무난하고, 남들이 잘 안 고르는 번호를 원하면 '오래 안 나온 번호'를 써보세요.",
  },
  {
    q: "추천받은 번호가 당첨될 확률이 더 높나요?",
    a: "아닙니다. 로또 추첨은 매 회차 독립적인 무작위 시행이라 어떤 방식으로 고르든 1등 확률은 8,145,060분의 1로 같습니다. 이 기능은 번호를 고르는 수고를 덜어주는 도구입니다.",
  },
  {
    q: "고정수와 제외수는 어떻게 쓰나요?",
    a: "'고정수'는 반드시 포함할 번호로 최대 5개까지 지정할 수 있고, 나머지 자리를 선택한 방식으로 채웁니다. '제외수'는 뽑지 않을 번호로, 지난 회차 번호를 빼고 싶을 때 유용합니다.",
  },
];

export default function RecommendPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "번호 추천" }];
  const picks = weeklyPicks(next.round, numberSummaries, 5);
  const labels = weeklyStrategyLabels(5);

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 번호 추천
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        1회차부터 {latestDraw.round}회차까지 {comma(totalRounds)}개 회차 통계를
        바탕으로 번호를 뽑아드립니다. 다음 추첨은 {next.round}회,{" "}
        {koreanDate(next.date)}입니다.
      </p>

      <div className="mt-6">
        <Recommender nextRound={next.round} summaries={numberSummaries} />
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      {/* 서버에서 미리 만든 고정 추천 — 자바스크립트 없이도 보이고 색인된다 */}
      <section className="mt-8">
        <SectionTitle sub="회차마다 고정되어 매주 새로 바뀝니다">
          {next.round}회 오늘의 추천 번호
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
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="각 방식이 번호를 고르는 기준">
          추천 방식 설명
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2">
          {STRATEGIES.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <h3 className="font-bold">{s.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {s.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionTitle sub="추천에 반영되는 실제 통계">참고 통계</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-bold">많이 나온 번호 TOP 6</h3>
            <BallRow numbers={hotNumbers.slice(0, 6).map((s) => s.number).sort((a, b) => a - b)} />
            <p className="mt-3 text-xs text-muted">
              {hotNumbers
                .slice(0, 6)
                .map((s) => `${s.number}번 ${s.count}회`)
                .join(" · ")}
            </p>
            <Link
              href="/stats/frequency"
              className="mt-3 inline-block text-xs text-accent hover:underline"
            >
              전체 출현 횟수 보기 →
            </Link>
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-bold">오래 안 나온 번호 TOP 6</h3>
            <BallRow
              numbers={overdueNumbers
                .slice(0, 6)
                .map((s) => s.number)
                .sort((a, b) => a - b)}
            />
            <p className="mt-3 text-xs text-muted">
              {overdueNumbers
                .slice(0, 6)
                .map((s) => `${s.number}번 ${s.gap}회째`)
                .join(" · ")}
            </p>
            <Link
              href="/stats/overdue"
              className="mt-3 inline-block text-xs text-accent hover:underline"
            >
              전체 미출현 현황 보기 →
            </Link>
          </Card>
        </div>
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
            <h2 className="mt-0!">번호를 고를 때 알아두면 좋은 것</h2>
            <p>
              먼저 분명히 해둘 것이 있습니다. 어떤 통계를 쓰든 1등 당첨 확률은
              8,145,060분의 1로 똑같습니다. 로또 추첨기는 지난 회차를 기억하지
              않으므로 &lsquo;나올 때가 된 번호&rsquo;라는 것도 존재하지 않습니다.
            </p>
            <p>
              다만 확률이 아니라 <strong>기대 수령액</strong>은 조금 달라질 수
              있습니다. 1등 당첨금은 당첨자 수로 나누기 때문에, 남들이 많이 고르는
              번호로 당첨되면 그만큼 적게 받습니다. 실제로 사람들이 몰리는 조합은
              이런 것들입니다.
            </p>
            <ul>
              <li>생일에서 온 1~31번에만 몰린 조합</li>
              <li>1·2·3·4·5·6 같은 연속 조합</li>
              <li>용지에 대각선·일직선으로 마킹한 조합</li>
              <li>지난 회차 당첨번호를 그대로 쓴 조합</li>
            </ul>
            <p>
              이 사이트의 &lsquo;통계 밸런스&rsquo; 방식은 32~45번까지 고르게
              포함하고 연속번호를 1쌍 이하로 제한해, 이런 인기 패턴에서 자연스럽게
              벗어난 조합을 만듭니다.
            </p>
            <p>
              마지막으로, 로또는 여가로 즐길 때 가장 재미있습니다. 감당할 수 있는
              금액만 쓰시고, 관련 통계는{" "}
              <Link href="/stats">로또 통계 종합</Link>에서, 확률 계산은{" "}
              <Link href="/guide/probability">로또 당첨 확률</Link>에서 자세히
              확인하세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
