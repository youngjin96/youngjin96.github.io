"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LottoBall } from "@/components/LottoBall";

/** [회차, n1..n6, 보너스] 압축 배열 */
export type CompactDraw = number[];

const RANK_LABEL: Record<number, string> = {
  1: "1등",
  2: "2등",
  3: "3등",
  4: "4등",
  5: "5등",
};

function rankOf(match: number, bonusHit: boolean): number | null {
  if (match === 6) return 1;
  if (match === 5 && bonusHit) return 2;
  if (match === 5) return 3;
  if (match === 4) return 4;
  if (match === 3) return 5;
  return null;
}

export function NumberChecker({ data }: { data: CompactDraw[] }) {
  const [picked, setPicked] = useState<number[]>([]);

  const toggle = (n: number) => {
    setPicked((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length >= 6
          ? prev
          : [...prev, n].sort((a, b) => a - b),
    );
  };

  const result = useMemo(() => {
    if (picked.length !== 6) return null;
    const set = new Set(picked);
    const hits: { round: number; rank: number; matched: number[] }[] = [];
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const row of data) {
      const round = row[0];
      const nums = row.slice(1, 7);
      const bonus = row[7];
      const matched = nums.filter((n) => set.has(n));
      const rank = rankOf(matched.length, set.has(bonus));
      if (rank) {
        counts[rank]++;
        if (rank <= 3) hits.push({ round, rank, matched });
      }
    }
    return { hits: hits.sort((a, b) => a.rank - b.rank || b.round - a.round), counts };
  }, [picked, data]);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">
            번호 6개를 선택하세요
            <span className="ml-2 font-normal text-muted">
              ({picked.length}/6)
            </span>
          </h2>
          {picked.length > 0 && (
            <button
              type="button"
              onClick={() => setPicked([])}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
            >
              초기화
            </button>
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
            const on = picked.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(n)}
                className={`flex aspect-square items-center justify-center rounded-full text-sm font-bold transition ${
                  on
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-[var(--surface)]"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <LottoBall n={n} size="md" />
              </button>
            );
          })}
        </div>
      </div>

      {picked.length === 6 && result && (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-bold">
            {picked.join(", ")} — 과거 당첨 이력
          </h2>

          <dl className="mt-4 grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div
                key={rank}
                className="rounded-xl border border-line bg-surface-2 px-2 py-3"
              >
                <dt className="text-[11px] text-muted">{RANK_LABEL[rank]}</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums">
                  {result.counts[rank]}
                </dd>
              </div>
            ))}
          </dl>

          {result.hits.length > 0 ? (
            <ul className="mt-4 divide-y divide-line">
              {result.hits.slice(0, 30).map((h) => (
                <li
                  key={`${h.round}-${h.rank}`}
                  className="flex flex-wrap items-center gap-3 py-2.5 text-sm"
                >
                  <Link
                    href={`/results/${h.round}`}
                    className="w-16 shrink-0 font-bold text-accent hover:underline"
                  >
                    {h.round}회
                  </Link>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                    {RANK_LABEL[h.rank]}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {h.matched.map((n) => (
                      <LottoBall key={n} n={n} size="sm" />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              3등 이상으로 당첨된 회차는 없습니다.
            </p>
          )}

          <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
            과거 회차에 이 번호를 샀다면 몇 등이었을지 계산한 결과입니다. 로또
            추첨은 매 회차 독립적이므로 과거 성적이 앞으로의 당첨 가능성을
            말해주지는 않습니다.
          </p>
        </div>
      )}

      {picked.length > 0 && picked.length < 6 && (
        <p className="mt-4 text-center text-sm text-muted">
          {6 - picked.length}개를 더 선택하면 결과가 나옵니다.
        </p>
      )}
    </div>
  );
}
