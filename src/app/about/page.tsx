import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, Card, Prose } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { firstDraw, latestDraw, totalRounds } from "@/lib/draws";
import { comma } from "@/lib/format";
import { absoluteUrl, siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: `${siteConfig.name}는 동행복권이 공개한 로또 6/45 회차별 당첨번호를 정리해 통계로 보여주는 비공식 정보 사이트입니다. 데이터 출처와 갱신 주기, 운영 원칙을 안내합니다.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "사이트 소개" }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        사이트 소개
      </h1>

      <Card className="mt-6">
        <Prose>
          <h2 className="mt-0!">무엇을 하는 사이트인가요</h2>
          <p>
            {siteConfig.name}는 로또 6/45의 회차별 당첨번호를 모아 통계로
            정리해 보여주는 사이트입니다. 1회차({firstDraw.date})부터{" "}
            {latestDraw.round}회차({latestDraw.date})까지 총{" "}
            {comma(totalRounds)}개 회차의 데이터를 담고 있습니다.
          </p>
          <ul>
            <li>
              <Link href="/results">회차별 당첨번호</Link> — 전 회차 당첨번호와
              등수별 당첨금
            </li>
            <li>
              <Link href="/stats">통계</Link> — 번호별 출현 횟수, 미출현 기간,
              궁합수, 조합 패턴
            </li>
            <li>
              <Link href="/recommend">번호 추천</Link> — 통계 기반 자동 번호 생성
            </li>
            <li>
              <Link href="/guide">가이드</Link> — 확률, 당첨금 수령, 세금 안내
            </li>
          </ul>

          <h2>데이터 출처와 갱신</h2>
          <p>
            모든 당첨번호와 당첨금 정보는 동행복권이 공개한 회차별 추첨 결과를
            가져와 정리한 것입니다. 데이터는 매주 토요일 추첨이 끝난 뒤
            갱신됩니다. 원본 정보는 언제나{" "}
            <a
              href="https://www.dhlottery.co.kr"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              동행복권 공식 사이트
            </a>
            를 기준으로 확인해 주세요.
          </p>
          <p>
            데이터 정리 과정에서 오류가 있을 수 있습니다. 당첨금 수령 등 실제
            권리 행사와 관련된 사안은 반드시 공식 사이트나 판매점에서 다시
            확인하시기 바랍니다.
          </p>

          <h2>운영 원칙</h2>
          <ul>
            <li>
              <strong>복권을 팔지 않습니다.</strong> 이 사이트는 복권을
              판매하거나 구매를 대행하지 않으며, 그런 서비스로 연결하지도
              않습니다.
            </li>
            <li>
              <strong>당첨을 보장하지 않습니다.</strong> 번호 추천은 통계를
              바탕으로 조합을 만들어 줄 뿐이며, 어떤 조합도 당첨 확률
              8,145,060분의 1을 바꾸지 못합니다.
            </li>
            <li>
              <strong>유료 서비스가 없습니다.</strong> 모든 통계와 추천 기능은
              무료이며 회원가입도 필요 없습니다.
            </li>
            <li>
              <strong>번호를 수집하지 않습니다.</strong> 번호 추천과 당첨 확인은
              모두 브라우저 안에서 계산되며 서버로 전송되지 않습니다.
            </li>
          </ul>

          <h2>건전한 이용을 위한 안내</h2>
          <p>
            복권은 여가 활동입니다. 감당할 수 있는 범위 안에서만 구매하시고,
            잃은 금액을 되찾으려 구매를 늘리는 것은 위험한 신호입니다. 복권이나
            도박으로 어려움을 겪고 있다면 한국도박문제예방치유원(국번 없이{" "}
            <strong>1336</strong>)에서 무료로 상담받을 수 있습니다. 만 19세
            미만은 복권을 구매할 수 없습니다.
          </p>

          <h2>동행복권과의 관계</h2>
          <p>
            {siteConfig.name}는 동행복권, 기획재정부 복권위원회를 비롯한 어떤
            공공기관과도 관련이 없는 개인 운영 사이트입니다. 공식 기관을
            사칭하지 않으며, 공식 정보가 필요할 때는 동행복권 홈페이지를
            이용해 주세요.
          </p>
        </Prose>
      </Card>
    </>
  );
}
