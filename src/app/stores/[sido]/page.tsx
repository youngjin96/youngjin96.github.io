import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { StoreTable } from "@/components/StoreTable";
import { latestDraw } from "@/lib/draws";
import {
  rankedInSido,
  sidoList,
  sidoNames,
  sigunguList,
  storeDataFromRound,
  totalFirstWins,
} from "@/lib/stores";
import { comma, pct } from "@/lib/format";
import { pageMetadata } from "@/site.config";

/**
 * 시도 페이지에 실을 판매점 수 상한.
 *
 * 경기처럼 1등 배출 판매점이 1,100곳 넘는 시도는 표를 통째로 그리면 HTML 이
 * 2MB 를 넘어 모바일 렌더링과 크롤링에 부담이 된다. 잘려나간 판매점은 전부
 * 아래 시·군·구 페이지에 그대로 있으므로 색인되는 내용은 줄지 않는다.
 */
const TOP_LIMIT = 100;

export function generateStaticParams() {
  return sidoNames.map((sido) => ({ sido }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/stores/[sido]">): Promise<Metadata> {
  const { sido } = await params;
  const name = decodeURIComponent(sido);
  const summary = sidoList.find((s) => s.name === name);
  if (!summary) return { title: "지역을 찾을 수 없습니다" };

  return pageMetadata({
    title: `${name} 로또 명당 - 1등 배출 판매점 순위`,
    // 판매점 이름은 길이를 예측할 수 없어 설명문에 넣지 않는다 (80자 유지).
    description: `${name}에서 로또 1등을 배출한 판매점 ${comma(summary.storeCount)}곳의 순위입니다. 1등 총 ${comma(summary.first)}건, 시·군·구별로도 확인하세요.`,
    path: `/stores/${encodeURIComponent(name)}`,
  });
}

export default async function SidoPage({ params }: PageProps<"/stores/[sido]">) {
  const { sido } = await params;
  const name = decodeURIComponent(sido);
  const summary = sidoList.find((s) => s.name === name);
  if (!summary) notFound();

  const ranked = rankedInSido(name);
  const listed = ranked.slice(0, TOP_LIMIT);
  const hidden = ranked.length - listed.length;
  const districts = sigunguList(name).filter((d) => d.first > 0);
  const share = totalFirstWins ? (summary.first / totalFirstWins) * 100 : 0;
  const rank = sidoList.findIndex((s) => s.name === name) + 1;

  const crumbs = [
    { name: "홈", href: "/" },
    { name: "로또 명당", href: "/stores" },
    { name },
  ];

  const FAQS = [
    {
      q: `${name}에서 로또 1등이 가장 많이 나온 판매점은?`,
      a: summary.topStore
        ? `${summary.topStore.sigungu}의 '${summary.topStore.name}'으로 1등을 ${summary.topStore.first}회 배출했습니다. 주소는 ${summary.topStore.addr}입니다.`
        : `${name}에서는 아직 1등 배출 기록이 없습니다.`,
    },
    {
      q: `${name}에서 1등이 몇 번이나 나왔나요?`,
      a: `${storeDataFromRound}회부터 ${latestDraw.round}회까지 ${name}에서는 1등이 ${comma(summary.first)}건 나왔습니다. 전국 1등의 ${pct(share)}에 해당하며 시도 중 ${rank}위입니다.`,
    },
    {
      q: "명당에서 사면 더 잘 당첨되나요?",
      a: "아닙니다. 판매량이 많은 곳에서 당첨자도 많이 나오는 것뿐입니다. 어느 판매점에서 사든 1게임의 1등 확률은 8,145,060분의 1로 동일합니다.",
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {name} 로또 명당
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {storeDataFromRound}회부터 {latestDraw.round}회까지 {name}에서 로또 1등을
        배출한 판매점 순위입니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="1등 배출" value={`${comma(summary.first)}건`} hint={`전국 ${rank}위`} />
        <Stat label="배출 판매점" value={`${comma(summary.storeCount)}곳`} />
        <Stat label="전국 대비" value={pct(share)} />
        <Stat label="2등 배출" value={`${comma(summary.second)}건`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      {districts.length > 1 && (
        <section id="sigungu" className="mt-6 scroll-mt-20">
          <SectionTitle sub="시·군·구를 선택하면 더 자세히 볼 수 있습니다">
            {name} 시·군·구별 1등 배출
          </SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {districts.map((d) => (
              <li key={d.name}>
                <Link
                  href={`/stores/${encodeURIComponent(name)}/${encodeURIComponent(d.name)}`}
                  className="flex items-baseline gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm hover:bg-surface-2"
                >
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-xs tabular-nums text-muted">
                    {d.first}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <SectionTitle
          sub={
            hidden
              ? `1등 배출 횟수 기준 상위 ${TOP_LIMIT}곳 (전체 ${comma(ranked.length)}곳)`
              : `1등 배출 횟수 기준 ${name} 전체 순위`
          }
        >
          {name} 명당 {hidden ? `TOP ${TOP_LIMIT}` : "순위"}
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <StoreTable stores={listed} />
        </Card>
        {hidden > 0 && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {TOP_LIMIT + 1}위 아래 {comma(hidden)}곳은{" "}
            {districts.length > 1 ? (
              <>
                위의{" "}
                <a href="#sigungu" className="text-accent hover:underline">
                  시·군·구별 목록
                </a>
                에서 지역을 골라 확인할 수 있습니다.
              </>
            ) : (
              "시·군·구별 페이지에서 확인할 수 있습니다."
            )}
          </p>
        )}
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

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
        <SectionTitle sub="다른 지역도 확인해 보세요">지역 이동</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {sidoList.map((r) => (
            <li key={r.name}>
              <Link
                href={`/stores/${encodeURIComponent(r.name)}`}
                className={`block rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                  r.name === name
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface hover:bg-surface-2"
                }`}
              >
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <Card>
          <Prose>
            <h2 className="mt-0!">{name} 명당 정리</h2>
            <p>
              {name}에서는 {storeDataFromRound}회 이후 1등이 {comma(summary.first)}
              건 나왔습니다. 전국 1등 {comma(totalFirstWins)}건의 {pct(share)}로,
              시도 가운데 {rank}위입니다.
              {summary.topStore && (
                <>
                  {" "}
                  가장 많이 배출한 곳은 {summary.topStore.sigungu}의{" "}
                  <strong>{summary.topStore.name}</strong>으로 {summary.topStore.first}
                  회를 기록했습니다.
                </>
              )}
            </p>
            <p>
              다만 1등을 많이 배출한 판매점이 당첨 확률이 높은 곳은 아닙니다.
              사람이 많이 오가는 자리라 복권을 많이 팔고, 그래서 당첨자도 비례해
              많이 나오는 것입니다. 자세한 설명은{" "}
              <Link href="/stores">로또 명당 안내</Link>에 정리해 두었습니다.
            </p>
            <p>
              최신 당첨번호는{" "}
              <Link href={`/results/${latestDraw.round}`}>
                {latestDraw.round}회 당첨결과
              </Link>
              에서, 번호 조합은 <Link href="/recommend">번호 추천</Link>에서
              확인하세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
