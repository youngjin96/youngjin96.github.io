import rawDraws from "../../data/draws.json";
import type { Draw } from "./types";

/**
 * 전 회차 데이터. 빌드 시점에 JSON 이 번들에 포함되므로 런타임 I/O 가 없다.
 * 회차 오름차순으로 정렬되어 있다고 가정하지 않고 여기서 한 번 정렬한다.
 */
export const draws: Draw[] = (rawDraws as Draw[])
  .slice()
  .sort((a, b) => a.round - b.round);

export const latestDraw: Draw = draws[draws.length - 1];
export const firstDraw: Draw = draws[0];
export const totalRounds = draws.length;

const byRound = new Map<number, Draw>(draws.map((d) => [d.round, d]));

export function getDraw(round: number): Draw | undefined {
  return byRound.get(round);
}

/** 최신 회차부터 n개 */
export function recentDraws(n: number): Draw[] {
  return draws.slice(Math.max(0, draws.length - n)).reverse();
}

/** 다음 추첨일(매주 토요일 20:45 KST)을 ISO 날짜 문자열로 반환 */
export function nextDrawDate(): { round: number; date: string } {
  // 날짜 계산만 하므로 UTC 자정 기준으로 다뤄 타임존 영향을 없앤다.
  const last = new Date(`${latestDraw.date}T00:00:00Z`);
  const next = new Date(last.getTime() + 7 * 24 * 60 * 60 * 1000);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return { round: latestDraw.round + 1, date: `${y}-${m}-${d}` };
}
