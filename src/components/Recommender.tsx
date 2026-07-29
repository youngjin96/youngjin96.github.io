"use client";

import { useCallback, useState } from "react";
import { LottoBall } from "@/components/LottoBall";
import {
  STRATEGIES,
  generateSets,
  type NumberSummary,
  type Strategy,
} from "@/lib/recommend";
import { analyzeDraw } from "@/lib/patterns";

const COUNTS = [1, 3, 5, 10];

export function Recommender({
  nextRound,
  summaries,
}: {
  nextRound: number;
  summaries: NumberSummary[];
}) {
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [count, setCount] = useState(5);
  const [include, setInclude] = useState<number[]>([]);
  const [exclude, setExclude] = useState<number[]>([]);
  const [mode, setMode] = useState<"include" | "exclude" | null>(null);
  const [sets, setSets] = useState<number[][]>([]);
  const [copied, setCopied] = useState(false);

  const toggleNumber = (n: number) => {
    if (mode === "include") {
      setInclude((prev) =>
        prev.includes(n)
          ? prev.filter((x) => x !== n)
          : prev.length >= 5
            ? prev
            : [...prev, n].sort((a, b) => a - b),
      );
      setExclude((prev) => prev.filter((x) => x !== n));
    } else if (mode === "exclude") {
      setExclude((prev) =>
        prev.includes(n)
          ? prev.filter((x) => x !== n)
          : [...prev, n].sort((a, b) => a - b),
      );
      setInclude((prev) => prev.filter((x) => x !== n));
    }
  };

  const generate = useCallback(() => {
    setSets(generateSets(count, { strategy, summaries, include, exclude }));
    setCopied(false);
  }, [count, strategy, summaries, include, exclude]);

  const copyAll = async () => {
    const text = sets.map((s) => s.join(", ")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const active = STRATEGIES.find((s) => s.id === strategy)!;

  return (
    <div>
      {/* 전략 선택 */}
      <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <legend className="px-1 text-sm font-bold">추천 방식</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={strategy === s.id}
              onClick={() => setStrategy(s.id)}
              className={`rounded-xl border p-3 text-left transition ${
                strategy === s.id
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface-2 hover:border-accent/40"
              }`}
            >
              <span className="block text-sm font-bold">{s.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {s.short}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
          {active.description}
        </p>
      </fieldset>

      {/* 개수 + 고정/제외 */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="mb-1.5 block text-sm font-bold">생성 개수</span>
            <div className="flex gap-1.5">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={count === c}
                  onClick={() => setCount(c)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                    count === c
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line hover:bg-surface-2"
                  }`}
                >
                  {c}조합
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-bold">번호 지정</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-pressed={mode === "include"}
                onClick={() => setMode(mode === "include" ? null : "include")}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  mode === "include"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line hover:bg-surface-2"
                }`}
              >
                고정수 {include.length > 0 && `(${include.length})`}
              </button>
              <button
                type="button"
                aria-pressed={mode === "exclude"}
                onClick={() => setMode(mode === "exclude" ? null : "exclude")}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                  mode === "exclude"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line hover:bg-surface-2"
                }`}
              >
                제외수 {exclude.length > 0 && `(${exclude.length})`}
              </button>
              {(include.length > 0 || exclude.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setInclude([]);
                    setExclude([]);
                  }}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-2"
                >
                  해제
                </button>
              )}
            </div>
          </div>
        </div>

        {mode && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted">
              {mode === "include"
                ? "반드시 포함할 번호를 최대 5개까지 선택하세요."
                : "빼고 싶은 번호를 선택하세요."}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5">
              {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
                const isInc = include.includes(n);
                const isExc = exclude.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNumber(n)}
                    aria-pressed={isInc || isExc}
                    className={`flex aspect-square items-center justify-center rounded-full transition ${
                      isInc
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-[var(--surface)]"
                        : isExc
                          ? "opacity-25"
                          : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <LottoBall n={n} size="md" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(include.length > 0 || exclude.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            {include.length > 0 && (
              <span className="flex items-center gap-1.5">
                고정수:
                {include.map((n) => (
                  <LottoBall key={n} n={n} size="sm" />
                ))}
              </span>
            )}
            {exclude.length > 0 && (
              <span className="flex items-center gap-1.5">
                제외수:
                {exclude.map((n) => (
                  <LottoBall key={n} n={n} size="sm" dim />
                ))}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={generate}
          className="mt-5 w-full rounded-xl bg-accent px-5 py-3.5 text-base font-bold text-white transition hover:opacity-90 active:scale-[0.99]"
        >
          번호 {count}조합 뽑기
        </button>
      </div>

      {/* 결과 */}
      {sets.length > 0 && (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold">
              {nextRound}회 추천 번호 {sets.length}조합
            </h2>
            <button
              type="button"
              onClick={copyAll}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
            >
              {copied ? "복사됨" : "전체 복사"}
            </button>
          </div>

          <ol className="divide-y divide-line">
            {sets.map((set, i) => {
              const p = analyzeDraw(set);
              return (
                <li key={set.join("-")} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-12 shrink-0 text-xs font-semibold text-muted">
                      {String.fromCharCode(65 + i)}조합
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {set.map((n) => (
                        <LottoBall key={n} n={n} size="lg" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 pl-12 text-[11px] tabular-nums text-muted">
                    합계 {p.sum} · 홀짝 {p.odd}:{p.even} · 저고 {p.low}:{p.high} ·
                    AC {p.ac}
                    {p.consecutive > 0 && ` · 연속 ${p.consecutive}쌍`}
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
            어떤 방식으로 뽑든 1등 당첨 확률은 8,145,060분의 1로 같습니다. 이
            기능은 번호를 고르는 수고를 덜어줄 뿐 당첨을 보장하지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
}
