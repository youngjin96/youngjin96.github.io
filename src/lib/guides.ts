/**
 * 가이드 문서 목록.
 * sitemap 과 목록 페이지가 이 배열을 공유한다.
 * 새 글을 추가하려면 여기에 slug 를 넣고 app/guide/[slug]/ 에 본문을 작성한다.
 */
export type Guide = {
  slug: string;
  title: string;
  /** 메타 설명문. 80자 이내로 쓴다 (네이버 서치어드바이저 권장) */
  description: string;
  /** 목록에 보여줄 한 줄 요약 */
  summary: string;
  /** ISO 날짜 — sitemap lastModified 와 Article 구조화 데이터에 쓰임 */
  updated: string;
};

export const guides: Guide[] = [
  {
    slug: "probability",
    title: "로또 당첨 확률 완전 정리 (1등부터 5등까지)",
    description:
      "로또 1등 확률은 왜 814만분의 1일까요? 등수별 당첨 확률을 조합 계산으로 하나씩 풀어 설명합니다.",
    summary:
      "1등 814만분의 1은 어떻게 나온 숫자일까. 등수별 확률을 조합식으로 계산합니다.",
    updated: "2026-07-25",
  },
  {
    slug: "claim",
    title: "로또 당첨금 수령 방법과 준비물 (등수별 절차)",
    description:
      "1·2등은 농협은행 본점, 3등 이하는 은행·판매점. 등수별 수령 장소와 준비물, 지급 기한을 정리했습니다.",
    summary:
      "1등은 어디로? 등수별 수령 장소, 준비물, 지급 기한까지 한 번에.",
    updated: "2026-07-25",
  },
  {
    slug: "tax",
    title: "로또 당첨금 세금 계산 (실수령액은 얼마?)",
    description:
      "로또 당첨금에는 기타소득세 20%(3억 초과분 30%)와 지방소득세가 붙습니다. 당첨금별 실수령액을 표로 정리했습니다.",
    summary:
      "20억에 당첨되면 실제로 얼마를 받을까. 세율과 계산법, 실수령액 표.",
    updated: "2026-07-25",
  },
  {
    slug: "how-to-buy",
    title: "로또 구매 방법 - 판매점, 인터넷, 자동·수동 차이",
    description:
      "판매점·인터넷 구매 방법과 자동·수동·반자동의 차이, 1인당 구매 한도와 구매 마감 시간을 정리했습니다.",
    summary:
      "판매점과 인터넷 구매의 차이, 자동·수동·반자동, 구매 한도와 마감 시간.",
    updated: "2026-07-25",
  },
  {
    slug: "myths",
    title: "로또에 대한 흔한 오해 7가지",
    description:
      "오래 안 나온 번호가 나올 때가 됐다? 자동이 더 잘 맞는다? 대표적인 로또 속설을 확률로 검증했습니다.",
    summary:
      "도박사의 오류부터 자동 vs 수동 논쟁까지, 근거 없는 속설을 확률로 검증합니다.",
    updated: "2026-07-25",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
