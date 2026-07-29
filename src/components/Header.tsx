import Link from "next/link";
import { siteConfig } from "@/site.config";

const NAV = [
  { href: "/results", label: "당첨번호" },
  { href: "/stats", label: "통계" },
  { href: "/recommend", label: "번호추천" },
  { href: "/stores", label: "명당" },
  { href: "/guide", label: "가이드" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-full bg-ball-yellow text-sm font-black text-black/80"
          >
            6
          </span>
          <span className="text-[15px]">{siteConfig.name}</span>
        </Link>

        <nav aria-label="주요 메뉴" className="ml-auto">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg sm:px-3 sm:text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
