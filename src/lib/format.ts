/** 1,234,567 형식 */
export function comma(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

/** 큰 금액을 억/만 단위 한글로 */
export function koreanMoney(n: number): string {
  const v = Math.round(n);
  if (v === 0) return "0원";
  const eok = Math.floor(v / 100_000_000);
  const man = Math.floor((v % 100_000_000) / 10_000);
  const rest = v % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${comma(eok)}억`);
  if (man) parts.push(`${comma(man)}만`);
  if (rest && !eok) parts.push(comma(rest));
  return `${parts.join(" ")}원`;
}

/** 2026-07-25 → 2026년 7월 25일 (토) */
export function koreanDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const day = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}
