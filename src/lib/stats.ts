import { draws, latestDraw } from "./draws";
import { ALL_NUMBERS, RANGE_BUCKETS, analyzeDraw } from "./patterns";
import type { Draw, Prize } from "./types";

// 순수 계산 함수는 patterns.ts 에 있고 여기서 다시 내보낸다.
// (클라이언트 컴포넌트는 patterns.ts 에서 직접 가져가야 데이터가 번들에 안 들어간다.)
export {
  ALL_NUMBERS,
  ballColor,
  RANGE_BUCKETS,
  acValue,
  consecutivePairs,
  sumOf,
  oddCount,
  lowCount,
  tailSum,
  analyzeDraw,
} from "./patterns";
export type { DrawPattern } from "./patterns";

/* ------------------------------------------------------------------ */
/* 번호별 기본 통계                                                     */
/* ------------------------------------------------------------------ */

export type NumberStat = {
  number: number;
  /** 본번호로 나온 횟수 */
  count: number;
  /** 보너스로 나온 횟수 */
  bonusCount: number;
  /** 본번호 출현 비율(%) */
  rate: number;
  /** 출현 횟수 기준 순위 (1위 = 가장 많이 나옴) */
  rank: number;
  /** 마지막으로 나온 회차 (없으면 0) */
  lastRound: number;
  /** 마지막 출현 이후 지난 회차 수 */
  gap: number;
  /** 평균 출현 간격 */
  avgGap: number;
  /** 역대 최대 미출현 간격 */
  maxGap: number;
  /** 출현한 회차 목록 */
  rounds: number[];
};

function buildNumberStats(): NumberStat[] {
  const counts = new Array(46).fill(0);
  const bonusCounts = new Array(46).fill(0);
  const rounds: number[][] = Array.from({ length: 46 }, () => []);

  for (const d of draws) {
    for (const n of d.numbers) {
      counts[n]++;
      rounds[n].push(d.round);
    }
    bonusCounts[d.bonus]++;
  }

  const total = draws.length;
  const base = ALL_NUMBERS.map((n) => {
    const rs = rounds[n];
    const lastRound = rs.length ? rs[rs.length - 1] : 0;

    // 첫 출현 전 구간과 마지막 출현 후 구간도 미출현 간격으로 함께 센다.
    let maxGap = 0;
    let prev = 0;
    for (const r of rs) {
      maxGap = Math.max(maxGap, r - prev - 1);
      prev = r;
    }
    maxGap = Math.max(maxGap, latestDraw.round - prev);

    return {
      number: n,
      count: counts[n],
      bonusCount: bonusCounts[n],
      rate: total ? (counts[n] / total) * 100 : 0,
      rank: 0,
      lastRound,
      gap: lastRound ? latestDraw.round - lastRound : latestDraw.round,
      avgGap: rs.length ? total / rs.length : total,
      maxGap,
      rounds: rs,
    } satisfies NumberStat;
  });

  // 동점이면 같은 순위를 준다.
  const sorted = [...base].sort((a, b) => b.count - a.count);
  let rank = 0;
  let prevCount = -1;
  sorted.forEach((s, i) => {
    if (s.count !== prevCount) {
      rank = i + 1;
      prevCount = s.count;
    }
    s.rank = rank;
  });

  return base;
}

/** index 0 == 1번. 배열 순서는 번호 오름차순. */
export const numberStats: NumberStat[] = buildNumberStats();

export function getNumberStat(n: number): NumberStat | undefined {
  return numberStats[n - 1];
}

/** 출현 횟수 내림차순 */
export const hotNumbers = [...numberStats].sort(
  (a, b) => b.count - a.count || a.number - b.number,
);
/** 출현 횟수 오름차순 */
export const coldNumbers = [...numberStats].sort(
  (a, b) => a.count - b.count || a.number - b.number,
);
/** 오래 안 나온 순 */
export const overdueNumbers = [...numberStats].sort(
  (a, b) => b.gap - a.gap || a.number - b.number,
);

/** 최근 n회차 기준 출현 횟수 (번호 오름차순) */
export function frequencyInRecent(n: number): { number: number; count: number }[] {
  const slice = draws.slice(Math.max(0, draws.length - n));
  const counts = new Array(46).fill(0);
  for (const d of slice) for (const x of d.numbers) counts[x]++;
  return ALL_NUMBERS.map((num) => ({ number: num, count: counts[num] }));
}

/** 추천 엔진에 넘길 최소 요약 (클라이언트로 직렬화해도 가벼움) */
export type NumberSummary = { n: number; count: number; gap: number };

export const numberSummaries: NumberSummary[] = numberStats.map((s) => ({
  n: s.number,
  count: s.count,
  gap: s.gap,
}));

/* ------------------------------------------------------------------ */
/* 궁합수 (동시 출현)                                                   */
/* ------------------------------------------------------------------ */

const pairMatrix: number[][] = Array.from({ length: 46 }, () =>
  new Array(46).fill(0),
);
for (const d of draws) {
  for (let i = 0; i < d.numbers.length; i++) {
    for (let j = i + 1; j < d.numbers.length; j++) {
      const a = d.numbers[i];
      const b = d.numbers[j];
      pairMatrix[a][b]++;
      pairMatrix[b][a]++;
    }
  }
}

export function pairCount(a: number, b: number): number {
  return pairMatrix[a]?.[b] ?? 0;
}

/** 특정 번호와 가장 자주 함께 나온 번호 */
export function bestPartners(n: number, limit = 10) {
  return ALL_NUMBERS.filter((x) => x !== n)
    .map((x) => ({ number: x, count: pairMatrix[n][x] }))
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, limit);
}

/** 특정 번호와 가장 적게 함께 나온 번호 */
export function worstPartners(n: number, limit = 10) {
  return ALL_NUMBERS.filter((x) => x !== n)
    .map((x) => ({ number: x, count: pairMatrix[n][x] }))
    .sort((a, b) => a.count - b.count || a.number - b.number)
    .slice(0, limit);
}

/** 전체에서 가장 많이 함께 나온 번호쌍 */
export function topPairs(limit = 20) {
  const out: { a: number; b: number; count: number }[] = [];
  for (let a = 1; a <= 45; a++) {
    for (let b = a + 1; b <= 45; b++) {
      out.push({ a, b, count: pairMatrix[a][b] });
    }
  }
  return out.sort((x, y) => y.count - x.count || x.a - y.a).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* 조합 패턴 분포                                                       */
/* ------------------------------------------------------------------ */

function distribution(values: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

const patterns = draws.map((d) => analyzeDraw(d.numbers));

export const patternStats = {
  total: draws.length,
  /** 홀수 개수 분포: 0~6 */
  odd: Array.from({ length: 7 }, (_, k) => ({
    key: k,
    count: patterns.filter((p) => p.odd === k).length,
  })),
  /** 저번호(1~22) 개수 분포 */
  low: Array.from({ length: 7 }, (_, k) => ({
    key: k,
    count: patterns.filter((p) => p.low === k).length,
  })),
  /** AC값 분포 0~10 */
  ac: Array.from({ length: 11 }, (_, k) => ({
    key: k,
    count: patterns.filter((p) => p.ac === k).length,
  })),
  /** 연속번호쌍 개수 분포 */
  consecutive: Array.from({ length: 6 }, (_, k) => ({
    key: k,
    count: patterns.filter((p) => p.consecutive === k).length,
  })),
  /** 번호 합계 구간 분포 (20 단위) */
  sumBuckets: (() => {
    const buckets: { label: string; min: number; max: number; count: number }[] =
      [];
    for (let start = 20; start <= 260; start += 20) {
      const end = start + 19;
      buckets.push({
        label: `${start}~${end}`,
        min: start,
        max: end,
        count: patterns.filter((p) => p.sum >= start && p.sum <= end).length,
      });
    }
    return buckets;
  })(),
  sumAvg: patterns.reduce((a, p) => a + p.sum, 0) / patterns.length,
  sumMin: Math.min(...patterns.map((p) => p.sum)),
  sumMax: Math.max(...patterns.map((p) => p.sum)),
  /** 구간별 번호 총 출현 수 */
  ranges: RANGE_BUCKETS.map((b, i) => ({
    ...b,
    count: patterns.reduce((a, p) => a + p.rangeCounts[i], 0),
  })),
  tailSumDist: distribution(patterns.map((p) => p.tailSum)),
};

/* ------------------------------------------------------------------ */
/* 회차 / 당첨금 통계                                                   */
/* ------------------------------------------------------------------ */

export function firstPrize(d: Draw) {
  return d.prizes.find((p) => p.rank === 1);
}

export const prizeStats = (() => {
  const first = draws
    .map((d) => firstPrize(d))
    .filter((p): p is Prize => Boolean(p));
  const withWinners = draws.filter((d) => (firstPrize(d)?.winners ?? 0) > 0);
  const amounts = withWinners.map((d) => firstPrize(d)!.perWinner);
  const maxDraw = withWinners.reduce((best, d) =>
    firstPrize(d)!.perWinner > firstPrize(best)!.perWinner ? d : best,
  );
  const minDraw = withWinners.reduce((best, d) =>
    firstPrize(d)!.perWinner < firstPrize(best)!.perWinner ? d : best,
  );
  const winnerCounts = first.map((p) => p.winners);
  return {
    avgFirstPrize: amounts.reduce((a, b) => a + b, 0) / amounts.length,
    maxFirstPrize: { amount: firstPrize(maxDraw)!.perWinner, draw: maxDraw },
    minFirstPrize: { amount: firstPrize(minDraw)!.perWinner, draw: minDraw },
    avgFirstWinners:
      winnerCounts.reduce((a, b) => a + b, 0) / winnerCounts.length,
    maxFirstWinners: Math.max(...winnerCounts),
    // 자동/수동/반자동 1등 누적
    types: draws.reduce(
      (acc, d) => {
        acc.auto += d.firstPrizeTypes.auto;
        acc.manual += d.firstPrizeTypes.manual;
        acc.semiAuto += d.firstPrizeTypes.semiAuto;
        return acc;
      },
      { auto: 0, manual: 0, semiAuto: 0 },
    ),
  };
})();

/** 연도별 요약 (최신 연도 우선) */
export const yearlyStats = (() => {
  const map = new Map<
    string,
    { year: string; rounds: number; sales: number; firstWinners: number }
  >();
  for (const d of draws) {
    const y = d.date.slice(0, 4);
    const cur = map.get(y) ?? { year: y, rounds: 0, sales: 0, firstWinners: 0 };
    cur.rounds++;
    cur.sales += d.sales;
    cur.firstWinners += firstPrize(d)?.winners ?? 0;
    map.set(y, cur);
  }
  return [...map.values()].sort((a, b) => Number(b.year) - Number(a.year));
})();

/** 같은 6개 번호 조합이 과거에 나온 적 있는지 */
const seenCombos = new Map<string, number>();
for (const d of draws) seenCombos.set(d.numbers.join("-"), d.round);

export function findDuplicateCombo(nums: number[]): number | undefined {
  return seenCombos.get([...nums].sort((a, b) => a - b).join("-"));
}

/** 직전 회차와 겹친 번호 개수의 역대 분포 */
export const carryOverStats = (() => {
  const dist = new Map<number, number>();
  for (let i = 1; i < draws.length; i++) {
    const prev = new Set(draws[i - 1].numbers);
    const overlap = draws[i].numbers.filter((n) => prev.has(n)).length;
    dist.set(overlap, (dist.get(overlap) ?? 0) + 1);
  }
  return [...dist.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => a.key - b.key);
})();
