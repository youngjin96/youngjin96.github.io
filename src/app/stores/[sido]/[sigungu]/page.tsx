import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { StoreTable } from "@/components/StoreTable";
import { latestDraw } from "@/lib/draws";
import {
  allSigunguPairs,
  rankedInSigungu,
  sidoList,
  sigunguList,
  storeDataFromRound,
} from "@/lib/stores";
import { comma, pct } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export function generateStaticParams() {
  return allSigunguPairs.map(({ sido, sigungu }) => ({ sido, sigungu }));
}

export const dynamicParams = false;

function lookup(sidoRaw: string, sigunguRaw: string) {
  const sido = decodeURIComponent(sidoRaw);
  const sigungu = decodeURIComponent(sigunguRaw);
  const summary = sigunguList(sido).find((d) => d.name === sigungu);
  return { sido, sigungu, summary };
}

export async function generateMetadata({
  params,
}: PageProps<"/stores/[sido]/[sigungu]">): Promise<Metadata> {
  const p = await params;
  const { sido, sigungu, summary } = lookup(p.sido, p.sigungu);
  if (!summary) return { title: "지역을 찾을 수 없습니다" };

  return {
    title: `${sido} ${sigungu} 로또 명당 - 1등 배출 판매점`,
    description: `${sido} ${sigungu}에서 로또 1등을 배출한 판매점 ${comma(summary.storeCount)}곳입니다. 1등 총 ${comma(summary.first)}건${summary.topStore ? `, 최다 배출은 ${summary.topStore.name}(${summary.topStore.first}회)` : ""}. 주소와 전화번호를 함께 확인하세요.`,
    alternates: {
      canonical: absoluteUrl(
        `/stores/${encodeURIComponent(sido)}/${encodeURIComponent(sigungu)}`,
      ),
    },
  };
}

export default async function SigunguPage({
  params,
}: PageProps<"/stores/[sido]/[sigungu]">) {
  const p = await params;
  const { sido, sigungu, summary } = lookup(p.sido, p.sigungu);
  if (!summary) notFound();

  const ranked = rankedInSigungu(sido, sigungu);
  const sidoSummary = sidoList.find((s) => s.name === sido);
  const siblings = sigunguList(sido).filter((d) => d.first > 0);
  const rankInSido = siblings.findIndex((d) => d.name === sigungu) + 1;
  const share = sidoSummary?.first
    ? (summary.first / sidoSummary.first) * 100
    : 0;

  const crumbs = [
    { name: "홈", href: "/" },
    { name: "로또 명당", href: "/stores" },
    { name: sido, href: `/stores/${encodeURIComponent(sido)}` },
    { name: sigungu },
  ];

  const FAQS = [
    {
      q: `${sido} ${sigungu}에서 로또 1등이 나온 판매점은 어디인가요?`,
      a: summary.topStore
        ? `${summary.storeCount}곳에서 1등이 나왔고, 가장 많이 배출한 곳은 '${summary.topStore.name}'(${summary.topStore.first}회)입니다. 주소는 ${summary.topStore.addr}이며 전화번호는 ${summary.topStore.tel || "공개되지 않았습니다"}입니다.`
        : `${sido} ${sigungu}에는 아직 1등 배출 기록이 없습니다.`,
    },
    {
      q: `${sigungu}에서 1등이 몇 번 나왔나요?`,
      a: `${storeDataFromRound}회부터 ${latestDraw.round}회까지 ${comma(summary.first)}건입니다. ${sido} 전체 1등의 ${pct(share)}이며 ${sido} 내 ${rankInSido}위입니다.`,
    },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {sido} {sigungu} 로또 명당
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {sido} {sigungu}에서 로또 1등을 배출한 판매점입니다. 주소와 전화번호를
        함께 정리했습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="1등 배출"
          value={`${comma(summary.first)}건`}
          hint={`${sido} 내 ${rankInSido}위`}
        />
        <Stat label="배출 판매점" value={`${comma(summary.storeCount)}곳`} />
        <Stat label={`${sido} 대비`} value={pct(share)} />
        <Stat label="2등 배출" value={`${comma(summary.second)}건`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="1등 배출 횟수 기준">
          {sigungu} 명당 순위
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <StoreTable stores={ranked} />
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub={`${sido}의 다른 지역`}>주변 지역</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {siblings.map((d) => (
            <li key={d.name}>
              <Link
                href={`/stores/${encodeURIComponent(sido)}/${encodeURIComponent(d.name)}`}
                className={`flex items-baseline gap-1.5 rounded-xl border px-3.5 py-2 text-sm ${
                  d.name === sigungu
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-surface hover:bg-surface-2"
                }`}
              >
                <span className="font-semibold">{d.name}</span>
                <span className="text-xs tabular-nums opacity-70">{d.first}</span>
              </Link>
            </li>
          ))}
        </ul>
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
        <Card>
          <Prose>
            <h2 className="mt-0!">
              {sido} {sigungu} 명당 정리
            </h2>
            <p>
              {sido} {sigungu}에서는 {storeDataFromRound}회 이후 판매점{" "}
              {comma(summary.storeCount)}곳에서 1등이 {comma(summary.first)}건
              나왔습니다.
              {summary.topStore && (
                <>
                  {" "}
                  그중 <strong>{summary.topStore.name}</strong>이{" "}
                  {summary.topStore.first}회로 가장 많고, 가장 최근 배출은{" "}
                  <Link href={`/results/${summary.topStore.lastFirstRound}`}>
                    {summary.topStore.lastFirstRound}회
                  </Link>
                  였습니다.
                </>
              )}
            </p>
            <p>
              판매점 주소와 전화번호는 동행복권 공개 자료를 정리한 것입니다.
              폐업하거나 이전한 곳이 있을 수 있으니 방문 전에 확인해 주세요.
              명당이라고 해서 당첨 확률이 높아지지는 않는다는 점도 기억해
              두시면 좋겠습니다 —{" "}
              <Link href="/stores">왜 그런지는 여기</Link>에 설명해 두었습니다.
            </p>
            <p>
              <Link href={`/stores/${encodeURIComponent(sido)}`}>
                {sido} 전체 명당 순위
              </Link>
              도 함께 확인해 보세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
