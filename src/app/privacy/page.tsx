import type { Metadata } from "next";
import { Breadcrumbs, Card, Prose } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { absoluteUrl, siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${siteConfig.name}의 개인정보처리방침입니다. 수집하는 정보, 쿠키와 광고 사용, 제3자 제공에 대해 안내합니다.`,
  alternates: { canonical: absoluteUrl("/privacy") },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const crumbs = [{ name: "홈", href: "/" }, { name: "개인정보처리방침" }];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        개인정보처리방침
      </h1>

      <Card className="mt-6">
        <Prose>
          <h2 className="mt-0!">1. 수집하는 개인정보</h2>
          <p>
            {siteConfig.name}는 회원가입 절차가 없으며, 이름·연락처·이메일 등
            개인을 식별할 수 있는 정보를 직접 수집하지 않습니다. 번호 추천이나
            당첨 확인 기능에서 이용자가 선택한 번호는 브라우저 안에서만
            처리되며 서버로 전송하거나 저장하지 않습니다.
          </p>

          <h2>2. 쿠키 및 자동 수집 정보</h2>
          <p>
            서비스 개선과 광고 게재를 위해 다음과 같은 정보가 자동으로 수집될 수
            있습니다.
          </p>
          <ul>
            <li>접속 브라우저 종류와 운영체제</li>
            <li>방문한 페이지와 체류 시간</li>
            <li>유입 경로(검색어, 참조 페이지)</li>
            <li>IP 주소를 통해 추정한 대략적인 지역</li>
          </ul>

          <h2>3. 광고 및 제3자 서비스</h2>
          <p>
            이 사이트는 광고 게재를 위해 Google AdSense를 비롯한 제3자 광고
            서비스를 이용할 수 있습니다. Google을 포함한 제3자 공급업체는 쿠키를
            사용해 이 웹사이트나 다른 웹사이트 방문 기록을 바탕으로 광고를
            게재합니다.
          </p>
          <p>
            Google이 광고 쿠키를 사용하면 이용자가 해당 사이트나 인터넷의 다른
            사이트를 방문한 기록을 근거로 광고를 게재할 수 있습니다. 이용자는{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 해제할 수 있으며,{" "}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              www.aboutads.info
            </a>
            에서 제3자 공급업체의 쿠키 사용을 거부할 수도 있습니다.
          </p>
          <p>
            방문 통계 확인을 위해 Google Analytics를 사용할 수 있습니다. 수집된
            정보는 익명 통계 형태로만 활용됩니다. 브라우저 설정에서 쿠키를
            차단하면 이러한 수집을 거부할 수 있으며, 이 경우에도 사이트의 모든
            기능을 이용할 수 있습니다.
          </p>

          <h2>4. 개인정보의 제3자 제공</h2>
          <p>
            {siteConfig.name}는 이용자의 개인정보를 제3자에게 판매하거나
            제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로
            요구하는 경우에는 예외로 합니다.
          </p>

          <h2>5. 보유 기간</h2>
          <p>
            직접 수집하는 개인정보가 없으므로 별도의 보유 기간이 없습니다.
            쿠키를 통해 수집되는 정보는 각 서비스 제공자의 정책에 따릅니다.
          </p>

          <h2>6. 이용자의 권리</h2>
          <p>
            이용자는 언제든지 브라우저 설정을 통해 쿠키 저장을 거부하거나 이미
            저장된 쿠키를 삭제할 수 있습니다.
          </p>

          <h2>7. 아동의 개인정보</h2>
          <p>
            이 사이트는 만 19세 미만 이용자를 대상으로 하지 않으며, 아동의
            개인정보를 의도적으로 수집하지 않습니다.
          </p>

          <h2>8. 방침 변경</h2>
          <p>
            이 방침이 변경될 경우 변경 내용을 이 페이지에 게시합니다. 문의
            사항이 있으면 사이트 운영자에게 연락해 주세요.
          </p>
        </Prose>
      </Card>
    </>
  );
}
