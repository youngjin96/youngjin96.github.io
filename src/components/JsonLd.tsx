import { absoluteUrl, assetUrl, ogImage, siteConfig } from "@/site.config";

/** 구조화 데이터 삽입. 검색결과 리치 스니펫(FAQ, 사이트링크, 빵부스러기)용. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 결과에 </script> 가 들어갈 여지를 막는다.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "ko-KR",
    description: siteConfig.description,
  };
}

export function breadcrumbJsonLd(items: { name: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: "ko-KR",
    mainEntityOfPage: absoluteUrl(path),
    // 구글 Article 권장 필드. 회차별 이미지는 굽지 않으므로 공용 OG 를 쓴다.
    image: [ogImage.url],
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: assetUrl("/icon-512.png") },
    },
  };
}
