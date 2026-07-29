import Link from "next/link";
import { siteConfig } from "@/site.config";
import { latestDraw } from "@/lib/draws";

const LINKS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "당첨번호",
    items: [
      { href: "/results", label: "회차별 당첨번호" },
      { href: `/results/${latestDraw.round}`, label: `${latestDraw.round}회 당첨결과` },
      { href: "/results/search", label: "내 번호 당첨 확인" },
    ],
  },
  {
    title: "통계",
    items: [
      { href: "/stats/frequency", label: "번호별 출현 횟수" },
      { href: "/stats/overdue", label: "미출현 회차" },
      { href: "/stats/pairs", label: "궁합수" },
      { href: "/stats/patterns", label: "조합 패턴" },
      { href: "/stats/prize", label: "당첨금 통계" },
    ],
  },
  {
    title: "로또 명당",
    items: [
      { href: "/stores", label: "전국 명당 순위" },
      { href: "/stores/서울", label: "서울 명당" },
      { href: "/stores/경기", label: "경기 명당" },
      { href: "/stores/부산", label: "부산 명당" },
    ],
  },
  {
    title: "가이드",
    items: [
      { href: "/recommend", label: "번호 추천" },
      { href: "/guide/probability", label: "당첨 확률" },
      { href: "/guide/claim", label: "당첨금 수령 방법" },
      { href: "/guide/tax", label: "로또 세금" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="mb-2 text-sm font-bold">{group.title}</h2>
              <ul className="space-y-1.5">
                {group.items.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-muted hover:text-fg hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          <p>
            <strong className="font-semibold text-fg">면책 안내</strong> ·{" "}
            {siteConfig.name}는 동행복권이 공개한 회차별 당첨번호를 정리해 보여주는
            비공식 통계 정보 사이트입니다. 동행복권 및 기획재정부 복권위원회와
            아무런 관련이 없으며, 복권을 판매하거나 구매를 대행하지 않습니다.
          </p>
          <p>
            로또 6/45 추첨은 매 회차 독립적으로 이뤄집니다. 과거 통계는 참고
            자료일 뿐이며 어떤 번호도 당첨 확률(1등 1/8,145,060)을 높여주지
            않습니다. 복권 구매는 여가 범위 안에서만 하시고, 과몰입이 의심되면
            한국도박문제예방치유원(국번없이 <strong>1336</strong>)에 상담하실 수
            있습니다. 미성년자는 복권을 구매할 수 없습니다.
          </p>
          <p className="pt-2">
            <Link href="/about" className="hover:underline">
              사이트 소개
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            {" · "}
            <a
              href="https://www.dhlottery.co.kr"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:underline"
            >
              동행복권 공식 사이트
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
