import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({
  children,
  sub,
  href,
  linkLabel = "더 보기",
  as: Tag = "h2",
}: {
  children: ReactNode;
  sub?: ReactNode;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <Tag className="text-lg font-bold tracking-tight sm:text-xl">
          {children}
        </Tag>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-accent hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums sm:text-xl">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** 값 비율만큼 채우는 가로 막대. 차트 라이브러리 없이 SSR 로 렌더된다. */
export function Bar({
  value,
  max,
  label,
  color = "var(--accent)",
}: {
  value: number;
  max: number;
  label?: ReactNode;
  color?: string;
}) {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    // min-w-0 flex-1: flex 부모(목록 행) 안에서 폭이 0으로 눌리지 않게
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      {label != null && (
        <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">
          {label}
        </span>
      )}
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-fg [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-bold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      {children}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="현재 위치" className="mb-4 text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-fg hover:underline">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
