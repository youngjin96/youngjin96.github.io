import raw from "../../data/stores.json";
import { getDraw, latestDraw } from "./draws";

/**
 * 당첨 판매점(명당) 데이터.
 *
 * 원본은 판매점 마스터 + 배출 이력으로 나뉘어 있고, 여기서 지역명을 정리하고
 * 판매점별로 집계한다. 원본을 그대로 두고 코드에서 정규화하므로 규칙이 바뀌어도
 * 다시 수집할 필요가 없다.
 */

type RawStore = {
  id: string;
  name: string;
  tel: string;
  sido: string;
  sigungu: string;
  addr: string;
  lat: number;
  lng: number;
};

/** [회차, 판매점 인덱스, 등수, 구매방식] */
type RawWin = [number, number, number, string];

const data = raw as { stores: RawStore[]; wins: RawWin[] };

/** 동행복권 인터넷 구매 채널. 실물 판매점이 아니라 랭킹에서 제외한다. */
const INTERNET_STORE_ID = "51100000";

/** 광주광역시 자치구 — '전남광주' 통합 표기를 쪼갤 때 쓴다. */
const GWANGJU_GU = new Set(["동구", "서구", "남구", "북구", "광산구"]);

/**
 * 시도 표기 정리.
 *
 * 원본에 '전남광주' 라는 옛 통합 표기가 남아 있다. 시군구가 '구' 로 끝나면
 * 광주광역시, 아니면 전라남도다. (전남에는 자치구가 없다)
 */
function normalizeSido(sido: string, sigungu: string): string {
  if (sido === "전남광주") {
    return GWANGJU_GU.has(sigungu) ? "광주" : "전남";
  }
  return sido;
}

/** 세종특별자치시처럼 시군구가 없는 곳은 시도명을 그대로 쓴다. */
function normalizeSigungu(sido: string, sigungu: string): string {
  return sigungu || sido;
}

export type Store = {
  id: string;
  name: string;
  tel: string;
  sido: string;
  sigungu: string;
  addr: string;
  lat: number;
  lng: number;
  /** 1등 배출 횟수 */
  first: number;
  /** 2등 배출 횟수 */
  second: number;
  /** 1등을 배출한 회차 (오름차순) */
  firstRounds: number[];
  /** 마지막으로 1등을 배출한 회차 (없으면 0) */
  lastFirstRound: number;
  /** 1등 배출 중 자동 선택 건수 */
  auto: number;
  /** 1등 배출 중 수동 선택 건수 */
  manual: number;
  isInternet: boolean;
};

const stores: Store[] = data.stores.map((s) => {
  const sido = normalizeSido(s.sido, s.sigungu);
  return {
    ...s,
    sido,
    sigungu: normalizeSigungu(sido, s.sigungu),
    first: 0,
    second: 0,
    firstRounds: [],
    lastFirstRound: 0,
    auto: 0,
    manual: 0,
    isInternet: s.id === INTERNET_STORE_ID,
  };
});

for (const [round, idx, rank, type] of data.wins) {
  const s = stores[idx];
  if (!s) continue;
  if (rank === 1) {
    s.first++;
    s.firstRounds.push(round);
    if (round > s.lastFirstRound) s.lastFirstRound = round;
    if (type === "A") s.auto++;
    else if (type === "M") s.manual++;
  } else {
    s.second++;
  }
}
for (const s of stores) s.firstRounds.sort((a, b) => a - b);

/** 실물 판매점만 (인터넷 채널 제외) */
export const allStores: Store[] = stores.filter((s) => !s.isInternet);

export const internetStore: Store | undefined = stores.find((s) => s.isInternet);

/** 판매점 데이터가 존재하는 첫 회차 */
export const storeDataFromRound: number = data.wins.length
  ? Math.min(...data.wins.map((w) => w[0]))
  : 0;

export const totalFirstWins = allStores.reduce((a, s) => a + s.first, 0);
export const totalSecondWins = allStores.reduce((a, s) => a + s.second, 0);

/** 1등 배출 횟수 순 (동수면 2등 → 최근 배출 순) */
function rankStores(list: Store[]): Store[] {
  return [...list].sort(
    (a, b) =>
      b.first - a.first ||
      b.second - a.second ||
      b.lastFirstRound - a.lastFirstRound,
  );
}

/** 1등을 한 번이라도 배출한 판매점, 랭킹 순 */
export const rankedStores: Store[] = rankStores(
  allStores.filter((s) => s.first > 0),
);

/* ------------------------------------------------------------------ */
/* 지역별 집계                                                          */
/* ------------------------------------------------------------------ */

export type RegionSummary = {
  name: string;
  storeCount: number;
  first: number;
  second: number;
  /** 1등을 가장 많이 배출한 판매점 */
  topStore?: Store;
};

function summarize(name: string, list: Store[]): RegionSummary {
  const withFirst = list.filter((s) => s.first > 0);
  return {
    name,
    storeCount: withFirst.length,
    first: list.reduce((a, s) => a + s.first, 0),
    second: list.reduce((a, s) => a + s.second, 0),
    topStore: rankStores(withFirst)[0],
  };
}

const bySido = new Map<string, Store[]>();
for (const s of allStores) {
  if (!bySido.has(s.sido)) bySido.set(s.sido, []);
  bySido.get(s.sido)!.push(s);
}

/** 시도 목록 (1등 배출 많은 순) */
export const sidoList: RegionSummary[] = [...bySido.entries()]
  .map(([name, list]) => summarize(name, list))
  .sort((a, b) => b.first - a.first);

export const sidoNames: string[] = sidoList.map((s) => s.name);

export function storesInSido(sido: string): Store[] {
  return bySido.get(sido) ?? [];
}

export function rankedInSido(sido: string): Store[] {
  return rankStores(storesInSido(sido).filter((s) => s.first > 0));
}

/** 특정 시도의 시군구 목록 (1등 배출 많은 순) */
export function sigunguList(sido: string): RegionSummary[] {
  const map = new Map<string, Store[]>();
  for (const s of storesInSido(sido)) {
    if (!map.has(s.sigungu)) map.set(s.sigungu, []);
    map.get(s.sigungu)!.push(s);
  }
  return [...map.entries()]
    .map(([name, list]) => summarize(name, list))
    .sort((a, b) => b.first - a.first || a.name.localeCompare(b.name, "ko"));
}

export function rankedInSigungu(sido: string, sigungu: string): Store[] {
  return rankStores(
    storesInSido(sido).filter((s) => s.sigungu === sigungu && s.first > 0),
  );
}

/** 전체 (시도, 시군구) 조합 — 정적 경로 생성용 */
export const allSigunguPairs: { sido: string; sigungu: string }[] = (() => {
  const seen = new Set<string>();
  const out: { sido: string; sigungu: string }[] = [];
  for (const s of allStores) {
    if (s.first === 0) continue; // 1등 배출이 없는 지역은 페이지를 만들지 않는다
    const key = `${s.sido}/${s.sigungu}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ sido: s.sido, sigungu: s.sigungu });
  }
  return out;
})();

/* ------------------------------------------------------------------ */
/* 회차별 배출 판매점                                                   */
/* ------------------------------------------------------------------ */

const firstWinnersByRound = new Map<number, { store: Store; type: string }[]>();
for (const [round, idx, rank, type] of data.wins) {
  if (rank !== 1) continue;
  const store = stores[idx];
  if (!store) continue;
  if (!firstWinnersByRound.has(round)) firstWinnersByRound.set(round, []);
  firstWinnersByRound.get(round)!.push({ store, type });
}

/** 해당 회차 1등 배출 판매점 (인터넷 채널 포함) */
export function firstWinnersOf(round: number): { store: Store; type: string }[] {
  return firstWinnersByRound.get(round) ?? [];
}

/** 최근 1등 배출 판매점 (최신 회차부터) */
export function recentFirstWinners(limit = 20) {
  const out: { round: number; date: string; store: Store; type: string }[] = [];
  for (let r = latestDraw.round; r >= storeDataFromRound && out.length < limit; r--) {
    const draw = getDraw(r);
    for (const w of firstWinnersOf(r)) {
      if (out.length >= limit) break;
      out.push({ round: r, date: draw?.date ?? "", ...w });
    }
  }
  return out;
}

/** 구매 방식 라벨 */
export function purchaseLabel(type: string): string {
  if (type === "A") return "자동";
  if (type === "M") return "수동";
  if (type === "S") return "반자동";
  return "-";
}

/** 자동/수동 누적 (1등 기준, 실물 판매점만) */
export const purchaseTypeTotals = allStores.reduce(
  (acc, s) => {
    acc.auto += s.auto;
    acc.manual += s.manual;
    return acc;
  },
  { auto: 0, manual: 0 },
);
