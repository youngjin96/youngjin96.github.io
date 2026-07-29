/**
 * 동행복권 로또 6/45 전 회차 데이터 수집기.
 *
 * 2026년 개편된 동행복권 사이트의 회차 조회 엔드포인트를 사용한다.
 * GET /lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=N
 *   → 선택 회차 기준 [N-5, N+4] 범위의 10건을 JSON 으로 반환.
 *
 * 사용법:
 *   node scripts/fetch-draws.mjs          # data/draws.json 없는 회차만 증분 수집
 *   node scripts/fetch-draws.mjs --full   # 1회차부터 전부 다시 수집
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://www.dhlottery.co.kr";
const RESULT_PAGE = `${ORIGIN}/lt645/result`;
const API = `${ORIGIN}/lt645/selectPstLt645InfoNew.do`;
const OUT = path.join(process.cwd(), "data", "draws.json");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const HEADERS = {
  "User-Agent": UA,
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: RESULT_PAGE,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(800 * (i + 1));
    }
  }
}

/** 추첨결과 페이지의 회차 드롭다운에서 최신 회차를 읽는다. */
async function fetchLatestRound() {
  const html = await getText(RESULT_PAGE);
  const rounds = [...html.matchAll(/data-value=["'](\d{1,5})["']/g)].map((m) =>
    Number(m[1]),
  );
  const fromOptions = Math.max(0, ...rounds);
  if (fromOptions > 0) return fromOptions;

  // 드롭다운 파싱 실패 시 "1234회" 형태의 텍스트에서 추출
  const fallback = [...html.matchAll(/(\d{3,4})회/g)].map((m) => Number(m[1]));
  const max = Math.max(0, ...fallback);
  if (!max) throw new Error("최신 회차를 확인하지 못했습니다.");
  return max;
}

/** 한 요청으로 최대 10회차를 받아온다. */
async function fetchChunk(center) {
  const url = `${API}?srchDir=center&srchLtEpsd=${center}`;
  const raw = await getText(url);
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`JSON 파싱 실패 (center=${center}): ${raw.slice(0, 120)}`);
  }
  return json?.data?.list ?? [];
}

const num = (v) => (v == null || v === "" ? 0 : Number(v));

/** API 응답 1건을 우리 스키마로 변환. */
function normalize(row) {
  const numbers = [
    row.tm1WnNo,
    row.tm2WnNo,
    row.tm3WnNo,
    row.tm4WnNo,
    row.tm5WnNo,
    row.tm6WnNo,
  ]
    .map(Number)
    .sort((a, b) => a - b);

  const ymd = String(row.ltRflYmd ?? "");
  const date =
    ymd.length === 8
      ? `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`
      : "";

  return {
    round: Number(row.ltEpsd),
    date,
    numbers,
    bonus: Number(row.bnsWnNo),
    // 등수별 [당첨자 수, 1인당 당첨금, 총 당첨금]
    prizes: [1, 2, 3, 4, 5].map((rank) => ({
      rank,
      winners: num(row[`rnk${rank}WnNope`]),
      perWinner: num(row[`rnk${rank}WnAmt`]),
      total: num(row[`rnk${rank}SumWnAmt`]),
    })),
    // 1등 당첨 유형 (자동/수동/반자동) — winType1: 자동, winType2: 수동, winType3: 반자동
    firstPrizeTypes: {
      auto: num(row.winType1),
      manual: num(row.winType2),
      semiAuto: num(row.winType3),
    },
    totalWinners: num(row.sumWnNope),
    sales: num(row.rlvtEpsdSumNtslAmt),
  };
}

const isValid = (d) =>
  Number.isInteger(d.round) &&
  d.round > 0 &&
  d.numbers.length === 6 &&
  d.numbers.every((n) => n >= 1 && n <= 45) &&
  d.bonus >= 1 &&
  d.bonus <= 45 &&
  /^\d{4}-\d{2}-\d{2}$/.test(d.date);

async function loadExisting() {
  try {
    const raw = await readFile(OUT, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const full = process.argv.includes("--full");
  const existing = full ? [] : await loadExisting();
  const byRound = new Map(existing.map((d) => [d.round, d]));

  const latest = await fetchLatestRound();
  const haveMax = existing.length ? Math.max(...byRound.keys()) : 0;
  console.log(
    `최신 회차: ${latest}회 / 보유: ${byRound.size}건 (최대 ${haveMax}회)`,
  );

  // 없는 회차만 모아 10개 단위 청크의 중심 회차로 변환
  const missing = [];
  for (let r = 1; r <= latest; r++) if (!byRound.has(r)) missing.push(r);

  if (missing.length === 0) {
    console.log("이미 최신입니다. 받을 회차가 없습니다.");
    return;
  }
  console.log(`수집 대상: ${missing.length}회차`);

  // 존재하지 않는 회차를 중심으로 요청하면 빈 배열이 오므로 [6, latest-4] 로 clamp 한다.
  const maxCenter = Math.max(6, latest - 4);
  const centers = new Set();
  for (const r of missing) {
    const raw = Math.floor((r - 1) / 10) * 10 + 6;
    centers.add(Math.min(Math.max(raw, 6), maxCenter));
  }
  const centerList = [...centers].sort((a, b) => a - b);

  let done = 0;
  for (const center of centerList) {
    const list = await fetchChunk(center);
    for (const row of list) {
      const d = normalize(row);
      if (isValid(d)) byRound.set(d.round, d);
    }
    done++;
    if (done % 10 === 0 || done === centerList.length) {
      console.log(`  ${done}/${centerList.length} 청크 완료 (${byRound.size}건)`);
    }
    await sleep(120); // 서버 부하 배려
  }

  const draws = [...byRound.values()].sort((a, b) => a.round - b.round);

  // 무결성 검사: 1회차부터 빠짐없이 이어지는지
  const gaps = [];
  for (let i = 0; i < draws.length; i++) {
    if (draws[i].round !== i + 1) {
      gaps.push(i + 1);
      break;
    }
  }
  if (gaps.length) {
    console.warn(`⚠️  회차 누락 감지: ${gaps[0]}회 부근을 확인하세요.`);
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(draws), "utf8");
  console.log(
    `저장 완료: ${OUT} (${draws.length}건, 1~${draws[draws.length - 1].round}회)`,
  );
}

main().catch((err) => {
  console.error("수집 실패:", err.message);
  process.exit(1);
});
