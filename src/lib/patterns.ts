/**
 * 데이터에 의존하지 않는 순수 계산 함수들.
 *
 * 이 파일은 draws.json 을 import 하지 않는다.
 * 클라이언트 컴포넌트가 여기서만 가져다 쓰면 1,200회차 데이터가
 * 브라우저 번들에 딸려 들어가지 않는다.
 */

export const ALL_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

/** 번호가 속한 색 구간 (동행복권 공식 볼 색상 기준) */
export function ballColor(
  n: number,
): "yellow" | "blue" | "red" | "gray" | "green" {
  if (n <= 10) return "yellow";
  if (n <= 20) return "blue";
  if (n <= 30) return "red";
  if (n <= 40) return "gray";
  return "green";
}

export const RANGE_BUCKETS = [
  { label: "1~10", min: 1, max: 10 },
  { label: "11~20", min: 11, max: 20 },
  { label: "21~30", min: 21, max: 30 },
  { label: "31~40", min: 31, max: 40 },
  { label: "41~45", min: 41, max: 45 },
];

/** AC값: 번호쌍 차이의 종류 수 - 5 (0~10, 높을수록 고르게 흩어진 조합) */
export function acValue(nums: number[]): number {
  const diffs = new Set<number>();
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      diffs.add(Math.abs(nums[i] - nums[j]));
    }
  }
  return diffs.size - (nums.length - 1);
}

/** 연속된 번호쌍 개수 (예: 12,13,14 → 2) */
export function consecutivePairs(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  let c = 0;
  for (let i = 1; i < s.length; i++) if (s[i] - s[i - 1] === 1) c++;
  return c;
}

export function sumOf(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function oddCount(nums: number[]): number {
  return nums.filter((n) => n % 2 === 1).length;
}

/** 저번호(1~22) 개수 */
export function lowCount(nums: number[]): number {
  return nums.filter((n) => n <= 22).length;
}

/** 끝수(1의 자리) 합 */
export function tailSum(nums: number[]): number {
  return nums.reduce((a, b) => a + (b % 10), 0);
}

export type DrawPattern = {
  sum: number;
  odd: number;
  even: number;
  low: number;
  high: number;
  ac: number;
  consecutive: number;
  tailSum: number;
  rangeCounts: number[];
};

export function analyzeDraw(nums: number[]): DrawPattern {
  const odd = oddCount(nums);
  const low = lowCount(nums);
  return {
    sum: sumOf(nums),
    odd,
    even: nums.length - odd,
    low,
    high: nums.length - low,
    ac: acValue(nums),
    consecutive: consecutivePairs(nums),
    tailSum: tailSum(nums),
    rangeCounts: RANGE_BUCKETS.map(
      (b) => nums.filter((n) => n >= b.min && n <= b.max).length,
    ),
  };
}
