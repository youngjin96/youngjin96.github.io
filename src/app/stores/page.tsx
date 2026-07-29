import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, Card, Prose, SectionTitle, Stat } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/JsonLd";
import { StoreTable } from "@/components/StoreTable";
import { latestDraw } from "@/lib/draws";
import {
  internetStore,
  purchaseLabel,
  purchaseTypeTotals,
  rankedStores,
  recentFirstWinners,
  sidoList,
  storeDataFromRound,
  totalFirstWins,
  totalSecondWins,
} from "@/lib/stores";
import { comma, pct } from "@/lib/format";
import { absoluteUrl } from "@/site.config";

export const metadata: Metadata = {
  title: "로또 명당 - 1등 배출 판매점 전국 순위",
  description: `로또 6/45 1등을 가장 많이 배출한 판매점 순위입니다. ${storeDataFromRound}회부터 ${latestDraw.round}회까지 1등 ${comma(totalFirstWins)}건의 배출 판매점을 지역별로 정리했습니다. 우리 동네 명당도 찾아보세요.`,
  alternates: { canonical: absoluteUrl("/stores") },
};

const FAQS = [
  {
    q: "로또 1등을 가장 많이 배출한 판매점은 어디인가요?",
    a: `${rankedStores[0].sido} ${rankedStores[0].sigungu}의 '${rankedStores[0].name}'이 1등 ${rankedStores[0].first}회로 가장 많습니다. 다음은 '${rankedStores[1].name}'(${rankedStores[1].sido}, ${rankedStores[1].first}회), '${rankedStores[2].name}'(${rankedStores[2].sido}, ${rankedStores[2].first}회) 순입니다.`,
  },
  {
    q: "명당에서 사면 당첨 확률이 높아지나요?",
    a: "높아지지 않습니다. 특정 판매점에서 1등이 많이 나오는 것은 대부분 그 판매점의 판매량이 많기 때문입니다. 유동인구가 많은 곳에서 복권을 많이 팔면 당첨자도 비례해서 많이 나옵니다. 어느 판매점에서 사든 1게임의 1등 확률은 8,145,060분의 1로 같습니다.",
  },
  {
    q: "당첨 판매점 정보는 언제부터 공개되나요?",
    a: `동행복권은 ${storeDataFromRound}회차부터 1·2등 배출 판매점을 공개하고 있습니다. 그 이전 회차는 판매점 정보가 제공되지 않습니다.`,
  },
  {
    q: "인터넷으로 산 로또도 명당 순위에 들어가나요?",
    a: internetStore
      ? `동행복권 인터넷 구매는 별도 채널로 집계되며, 지금까지 1등 ${internetStore.first}건이 나왔습니다. 실물 판매점이 아니라서 명당 순위에서는 제외하고 따로 표시하고 있습니다.`
      : "인터넷 구매는 별도 채널로 집계되며 명당 순위에서는 제외합니다.",
  },
];

export default function StoresPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "로또 명당" }];
  const top20 = rankedStores.slice(0, 20);
  const recent = recentFirstWinners(12);
  const typeTotal = purchaseTypeTotals.auto + purchaseTypeTotals.manual;

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(FAQS)]} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        로또 명당 (1등 배출 판매점)
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {storeDataFromRound}회부터 {latestDraw.round}회까지 로또 6/45 1등을
        배출한 판매점을 모두 모아 순위를 매겼습니다. 지역별로도 찾아볼 수
        있습니다.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="집계된 1등" value={`${comma(totalFirstWins)}건`} />
        <Stat label="1등 배출 판매점" value={`${comma(rankedStores.length)}곳`} />
        <Stat
          label="최다 배출"
          value={`${rankedStores[0].first}회`}
          hint={rankedStores[0].name}
        />
        <Stat label="집계된 2등" value={`${comma(totalSecondWins)}건`} />
      </dl>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

      <section className="mt-6">
        <SectionTitle sub="1등 배출 횟수 기준 전국 순위">
          전국 명당 TOP 20
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <StoreTable stores={top20} showRegion />
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle sub="지역을 선택하면 해당 지역 명당을 볼 수 있습니다">
          지역별 명당
        </SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sidoList.map((r) => (
            <li key={r.name}>
              <Link
                href={`/stores/${encodeURIComponent(r.name)}`}
                className="flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <span>
                  <span className="block font-bold">{r.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {r.topStore ? `최다 ${r.topStore.name}` : "배출 없음"}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-lg font-bold tabular-nums">
                    {comma(r.first)}
                  </span>
                  <span className="block text-[11px] text-muted">1등 배출</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

      <section className="mt-8">
        <SectionTitle sub="가장 최근에 1등이 나온 판매점">
          최근 1등 배출 판매점
        </SectionTitle>
        <Card className="p-0! sm:p-0!">
          <div className="scroll-x">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    회차
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    판매점
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    지역
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    구매방식
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((w, i) => (
                  <tr key={`${w.round}-${w.store.id}-${i}`} className="hover:bg-surface-2">
                    <th scope="row" className="px-4 py-3 text-left align-top">
                      <Link
                        href={`/results/${w.round}`}
                        className="font-bold text-accent hover:underline"
                      >
                        {w.round}회
                      </Link>
                      <span className="block text-[11px] font-normal text-muted">
                        {w.date}
                      </span>
                    </th>
                    <td className="px-4 py-3 align-top">
                      <span className="block font-medium">{w.store.name}</span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {w.store.addr}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-muted">
                      {w.store.isInternet ? (
                        "인터넷"
                      ) : (
                        <Link
                          href={`/stores/${encodeURIComponent(w.store.sido)}/${encodeURIComponent(w.store.sigungu)}`}
                          className="hover:text-accent hover:underline"
                        >
                          {w.store.sido} {w.store.sigungu}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-top whitespace-nowrap text-muted">
                      {purchaseLabel(w.type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {internetStore && (
        <section className="mt-8">
          <SectionTitle sub="실물 판매점이 아니라 순위에서는 제외했습니다">
            인터넷 구매 채널
          </SectionTitle>
          <Card>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="인터넷 1등" value={`${internetStore.first}건`} />
              <Stat
                label="전체 1등 중 비중"
                value={pct(
                  (internetStore.first /
                    (totalFirstWins + internetStore.first)) *
                    100,
                )}
              />
              <Stat label="인터넷 2등" value={`${comma(internetStore.second)}건`} />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              동행복권 홈페이지에서 구매한 복권의 당첨 건수입니다. 판매점 한
              곳이 아니라 채널 전체의 합계라 다른 판매점과 직접 비교할 수는
              없습니다.
            </p>
          </Card>
        </section>
      )}

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
            <h2 className="mt-0!">명당은 정말 명당일까</h2>
            <p>
              1등을 여러 번 배출한 판매점을 흔히 &lsquo;명당&rsquo;이라고
              부릅니다. 그런데 왜 특정 가게에서 1등이 반복해서 나올까요? 답은
              단순합니다. <strong>많이 팔기 때문입니다.</strong>
            </p>
            <p>
              전국에서 로또를 파는 곳은 6천 곳이 넘지만 판매량은 균등하지
              않습니다. 유동인구가 많은 역세권이나 시장 앞 판매점은 외곽 가게보다
              수십 배를 팝니다. 복권을 열 배 많이 팔면 당첨자도 열 배 많이 나오는
              게 자연스럽습니다. 게다가 한번 명당으로 소문나면 사람이 더 몰려
              판매량이 늘고, 그래서 당첨자가 또 나오는 순환이 생깁니다.
            </p>
            <p>
              실제로 이 순위 상위권은 대부분 대도시 번화가나 고속도로 휴게소
              근처에 있습니다. 특별한 기운이 아니라 위치와 판매량의 결과입니다.
              어느 판매점에서 사든 1게임의 1등 확률은{" "}
              <Link href="/guide/probability">8,145,060분의 1</Link>로 같습니다.
            </p>
            <h2>그래도 명당을 찾는다면</h2>
            <p>
              확률은 같지만 명당을 찾아가는 일 자체가 로또의 재미이기도 합니다.
              가는 김에 알아두면 좋은 것들입니다.
            </p>
            <ul>
              <li>
                1등 배출 판매점 중 자동 선택이{" "}
                {typeTotal
                  ? `${pct((purchaseTypeTotals.auto / typeTotal) * 100, 0)}`
                  : "대부분"}
                를 차지합니다. 자동이 유리해서가 아니라 자동으로 사는 사람이 훨씬
                많기 때문입니다.
              </li>
              <li>
                판매점 정보는 회차마다 갱신되니, 최근 배출 회차가 오래된 곳은
                지금은 예전만큼 팔지 않는 곳일 수 있습니다.
              </li>
              <li>
                주소와 전화번호는 동행복권 공개 자료 기준입니다. 폐업하거나
                이전한 곳이 있을 수 있으니 방문 전에 확인해 보세요.
              </li>
            </ul>
            <p>
              번호를 고르는 게 고민이라면{" "}
              <Link href="/recommend">번호 추천</Link>을, 통계가 궁금하다면{" "}
              <Link href="/stats">로또 통계 종합</Link>을 참고하세요.
            </p>
          </Prose>
        </Card>
      </section>
    </>
  );
}
