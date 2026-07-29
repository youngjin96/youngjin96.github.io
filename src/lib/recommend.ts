import {
  ALL_NUMBERS,
  RANGE_BUCKETS,
  acValue,
  consecutivePairs,
  lowCount,
  oddCount,
  sumOf,
} from "./patterns";

/**
 * 번호 추천 엔진.
 *
 * draws.json 을 직접 import 하지 않는다. 통계가 필요한 전략은 서버가 넘겨주는
 * NumberSummary 45건(수백 바이트)만 사용하므로 클라이언트 번들이 가볍다.
 */

export type Strategy = "random" | "hot" | "cold" | "overdue" | "balanced";

/** 추천에 필요한 번호별 최소 통계 */
export type NumberSummary = { n: number; count: number; gap: number };

export const STRATEGIES: {
  id: Strategy;
  label: string;
  short: string;
  description: string;
}[] = [
  {
    id: "balanced",
    label: "통계 밸런스",
    short: "역대 당첨 조합에서 가장 흔한 형태로",
    description:
      "번호 합계 100~175, 홀짝 2:4~4:2, 저고 균형, 연속번호 1쌍 이하, AC값 7 이상, 한 구간에 4개 이상 몰리지 않기 — 역대 당첨 조합에서 가장 자주 나타난 조건을 모두 만족하는 조합만 골라냅니다.",
  },
  {
    id: "hot",
    label: "많이 나온 번호",
    short: "출현 횟수 상위 번호에 가중치",
    description:
      "지금까지 출현 횟수가 많은 번호일수록 뽑힐 확률을 높게 잡아 추출합니다. 흐름을 따라가는 이른바 '핫넘버' 전략입니다.",
  },
  {
    id: "cold",
    label: "적게 나온 번호",
    short: "출현 횟수 하위 번호에 가중치",
    description:
      "지금까지 적게 나온 번호에 가중치를 둡니다. 언젠가 평균으로 돌아올 것이라 보는 '콜드넘버' 전략입니다.",
  },
  {
    id: "overdue",
    label: "오래 안 나온 번호",
    short: "미출현 기간이 긴 번호 위주",
    description:
      "마지막으로 당첨번호에 포함된 뒤 지난 회차가 오래된 번호일수록 높은 가중치를 줍니다.",
  },
  {
    id: "random",
    label: "완전 무작위",
    short: "45개 번호 동일 확률",
    description:
      "어떤 가중치도 주지 않고 1~45를 같은 확률로 뽑습니다. 확률적으로는 이 방식과 다른 방식의 당첨 기대값이 완전히 동일합니다.",
  },
];

/* ------------------------------------------------------------------ */
/* 시드 기반 난수 (서버·클라이언트가 같은 결과를 내야 할 때)             */
/* ------------------------------------------------------------------ */

/** mulberry32 — 작고 빠른 시드 PRNG */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* 가중치                                                              */
/* ------------------------------------------------------------------ */

/** index 0 은 쓰지 않는다 (번호는 1~45) */
export function buildWeights(
  strategy: Strategy,
  summaries: NumberSummary[],
): number[] {
  const w = new Array(46).fill(1);
  if (strategy === "random" || strategy === "balanced" || !summaries.length) {
    return w;
  }

  const counts = summaries.map((s) => s.count);
  const minC = Math.min(...counts);
  const maxC = Math.max(...counts);
  const maxG = Math.max(...summaries.map((s) => s.gap), 1);

  for (const s of summaries) {
    const normCount = maxC === minC ? 0.5 : (s.count - minC) / (maxC - minC);
    if (strategy === "hot") w[s.n] = 0.5 + normCount * 1.5;
    else if (strategy === "cold") w[s.n] = 0.5 + (1 - normCount) * 1.5;
    else if (strategy === "overdue") w[s.n] = 0.4 + (s.gap / maxG) * 1.8;
  }
  return w;
}

/** 가중치 기반 비복원 추출 */
function weightedPick(
  count: number,
  weights: number[],
  pool: number[],
  rnd: () => number,
): number[] {
  const available = [...pool];
  const picked: number[] = [];
  while (picked.length < count && available.length > 0) {
    const total = available.reduce((a, n) => a + weights[n], 0);
    let r = rnd() * total;
    let idx = available.length - 1;
    for (let i = 0; i < available.length; i++) {
      r -= weights[available[i]];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(available[idx]);
    available.splice(idx, 1);
  }
  return picked.sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ */
/* 통계 밸런스 필터                                                     */
/* ------------------------------------------------------------------ */

/** 역대 당첨 조합에서 가장 흔한 구간에 들어오는 조합인지 */
export function passesBalanceFilter(nums: number[]): boolean {
  const sum = sumOf(nums);
  if (sum < 100 || sum > 175) return false;

  const odd = oddCount(nums);
  if (odd < 2 || odd > 4) return false;

  const low = lowCount(nums);
  if (low < 2 || low > 4) return false;

  if (consecutivePairs(nums) > 1) return false;
  if (acValue(nums) < 7) return false;

  // 10단위 한 구간에 4개 이상 몰리지 않도록
  for (const b of RANGE_BUCKETS) {
    const c = nums.filter((n) => n >= b.min && n <= b.max).length;
    if (c >= 4) return false;
  }
  return true;
}

export type GenerateOptions = {
  strategy?: Strategy;
  /** 번호별 요약 통계 (hot/cold/overdue 전략에 필요) */
  summaries?: NumberSummary[];
  /** 반드시 포함할 번호 */
  include?: number[];
  /** 제외할 번호 */
  exclude?: number[];
  rnd?: () => number;
};

/** 6개 번호 1세트 생성 */
export function generateSet({
  strategy = "balanced",
  summaries = [],
  include = [],
  exclude = [],
  rnd = Math.random,
}: GenerateOptions = {}): number[] {
  const fixed = [...new Set(include)]
    .filter((n) => n >= 1 && n <= 45)
    .slice(0, 6);
  const excluded = new Set(exclude.filter((n) => !fixed.includes(n)));
  const pool = ALL_NUMBERS.filter((n) => !fixed.includes(n) && !excluded.has(n));
  const need = 6 - fixed.length;

  if (pool.length < need) {
    // 제외 조건이 과해 뽑을 수 없으면 제외를 풀고 채운다.
    const fallback = ALL_NUMBERS.filter((n) => !fixed.includes(n));
    const flat = new Array(46).fill(1);
    return [...fixed, ...weightedPick(need, flat, fallback, rnd)].sort(
      (a, b) => a - b,
    );
  }

  const weights = buildWeights(strategy, summaries);

  if (strategy === "balanced") {
    // 필터를 통과하는 조합이 나올 때까지 재시도 (실패하면 마지막 후보 반환)
    let last: number[] = [];
    for (let i = 0; i < 300; i++) {
      const candidate = [...fixed, ...weightedPick(need, weights, pool, rnd)].sort(
        (a, b) => a - b,
      );
      last = candidate;
      if (passesBalanceFilter(candidate)) return candidate;
    }
    return last;
  }

  return [...fixed, ...weightedPick(need, weights, pool, rnd)].sort(
    (a, b) => a - b,
  );
}

/** n세트 생성 (중복 조합 제거) */
export function generateSets(
  n: number,
  options: GenerateOptions = {},
): number[][] {
  const out: number[][] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard < n * 60) {
    guard++;
    const set = generateSet(options);
    const key = set.join("-");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(set);
  }
  return out;
}

const WEEKLY_ORDER: Strategy[] = [
  "balanced",
  "hot",
  "overdue",
  "cold",
  "random",
];

/**
 * 회차별로 고정된 추천 번호.
 * 시드를 회차 번호로 고정해 누가 언제 보든 같은 번호가 나온다.
 * (매주 새로 바뀌는 크롤링 가능한 콘텐츠가 되고, 공유해도 결과가 같다.)
 */
export function weeklyPicks(
  round: number,
  summaries: NumberSummary[],
  count = 5,
): number[][] {
  const rnd = seededRandom(round * 7919 + 104729);
  const out: number[][] = [];
  const seen = new Set<string>();
  let i = 0;
  let guard = 0;
  while (out.length < count && guard < count * 80) {
    guard++;
    const strategy = WEEKLY_ORDER[i % WEEKLY_ORDER.length];
    const set = generateSet({ strategy, summaries, rnd });
    const key = set.join("-");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(set);
    i++;
  }
  return out;
}

/** weeklyPicks 결과와 짝을 이루는 전략 라벨 */
export function weeklyStrategyLabels(count = 5): string[] {
  return Array.from(
    { length: count },
    (_, i) =>
      STRATEGIES.find((s) => s.id === WEEKLY_ORDER[i % WEEKLY_ORDER.length])!
        .label,
  );
}
