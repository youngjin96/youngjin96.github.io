/**
 * 로또 6/45 당첨 판매점(명당) 수집기.
 *
 * GET /wnprchsplcsrch/selectLtWnShp.do?srchWnShpRnk={1|2}&srchLtEpsd={회차}
 *   → 해당 회차에서 그 등수를 배출한 판매점 목록.
 *     같은 판매점이 2건을 배출했으면 같은 항목이 2번 들어온다(= 2회 배출).
 *
 * 판매점 정보는 262회 전후부터 공개된다. 그 이전 회차는 빈 배열이 온다.
 *
 * 저장 형식(data/stores.json) — 판매점 마스터와 배출 이력을 분리해 용량을 줄인다.
 *   { stores: [{ id, name, tel, sido, sigungu, addr, lat, lng }],
 *     wins:   [[회차, stores 인덱스, 등수, 구매방식]] }
 *
 * 사용법:
 *   node scripts/fetch-stores.mjs          # 없는 회차만 증분 수집
 *   node scripts/fetch-stores.mjs --full   # 전 회차 다시 수집
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://www.dhlottery.co.kr";
const API = `${ORIGIN}/wnprchsplcsrch/selectLtWnShp.do`;
const OUT = path.join(process.cwd(), "data", "stores.json");
const DRAWS = path.join(process.cwd(), "data", "draws.json");

/** 판매점 정보가 공개되기 시작하는 회차 (그 이전은 요청해도 빈 배열) */
const FIRST_ROUND_WITH_STORES = 250;
/** 최근 회차는 매번 다시 받아 갱신한다 (추첨 직후엔 판매점이 늦게 올라온다) */
const REFRESH_RECENT = 4;
/** 동시 요청 수 */
const CONCURRENCY = 4;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Referer: `${ORIGIN}/wnprchsplcsrch/home`,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchStores(round, rank, tries = 3) {
  const url = `${API}?srchWnShpRnk=${rank}&srchLtEpsd=${round}`;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = JSON.parse(await res.text());
      return json?.data?.list ?? [];
    } catch (err) {
      if (i === tries - 1) {
        console.warn(`  ${round}회 ${rank}등 수집 실패: ${err.message}`);
        return null; // null = 실패 (빈 배열과 구분)
      }
      await sleep(700 * (i + 1));
    }
  }
}

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

/** 구매 방식: A 자동 / M 수동 / S 반자동 */
function purchaseType(row) {
  const raw = clean(row.atmtPsvYn).toUpperCase();
  if (raw === "A" || raw === "M" || raw === "S") return raw;
  const txt = clean(row.atmtPsvYnTxt);
  if (txt.includes("반자동")) return "S";
  if (txt.includes("자동")) return "A";
  if (txt.includes("수동")) return "M";
  return "";
}

function toStore(row) {
  const sido = clean(row.tm1ShpLctnAddr) || clean(row.region);
  return {
    id: clean(row.ltShpId) || `${clean(row.shpNm)}|${clean(row.shpAddr)}`,
    name: clean(row.shpNm),
    tel: clean(row.shpTelno),
    sido,
    sigungu: clean(row.tm2ShpLctnAddr),
    addr: clean(row.shpAddr),
    lat: Number(row.shpLat) || 0,
    lng: Number(row.shpLot) || 0,
  };
}

async function loadExisting(full) {
  if (full) return { stores: [], wins: [] };
  try {
    const parsed = JSON.parse(await readFile(OUT, "utf8"));
    return {
      stores: Array.isArray(parsed.stores) ? parsed.stores : [],
      wins: Array.isArray(parsed.wins) ? parsed.wins : [],
    };
  } catch {
    return { stores: [], wins: [] };
  }
}

/** 동시성 제한 실행 */
async function pool(items, worker, size) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await worker(items[i]);
        await sleep(100);
      }
    }),
  );
  return results;
}

async function main() {
  const full = process.argv.includes("--full");
  const draws = JSON.parse(await readFile(DRAWS, "utf8"));
  const latest = draws[draws.length - 1].round;

  const prev = await loadExisting(full);

  // 판매점 마스터: id 기준으로 합친다 (주소·상호가 바뀌면 최신 값으로 갱신)
  const storeIndex = new Map();
  const stores = [];
  for (const s of prev.stores) {
    storeIndex.set(s.id, stores.length);
    stores.push(s);
  }

  // 회차별 배출 이력. 재수집한 회차는 통째로 교체한다.
  const winsByRound = new Map();
  for (const w of prev.wins) {
    const [round] = w;
    if (!winsByRound.has(round)) winsByRound.set(round, []);
    winsByRound.get(round).push(w);
  }

  const refreshFrom = Math.max(FIRST_ROUND_WITH_STORES, latest - REFRESH_RECENT + 1);
  for (let r = refreshFrom; r <= latest; r++) winsByRound.delete(r);

  const targets = [];
  for (let r = FIRST_ROUND_WITH_STORES; r <= latest; r++) {
    if (!winsByRound.has(r)) targets.push(r);
  }

  if (!targets.length) {
    console.log("이미 최신입니다. 받을 회차가 없습니다.");
    return;
  }
  console.log(
    `수집 대상: ${targets.length}회차 × 2등급 = ${targets.length * 2}건 요청`,
  );

  let done = 0;
  let failed = 0;
  await pool(
    targets,
    async (round) => {
      const rows = [];
      for (const rank of [1, 2]) {
        const list = await fetchStores(round, rank);
        if (list === null) {
          failed++;
          continue;
        }
        for (const row of list) {
          const store = toStore(row);
          if (!store.name) continue;
          let idx = storeIndex.get(store.id);
          if (idx === undefined) {
            idx = stores.length;
            storeIndex.set(store.id, idx);
            stores.push(store);
          } else {
            stores[idx] = store; // 최신 정보로 갱신
          }
          rows.push([round, idx, rank, purchaseType(row)]);
        }
      }
      winsByRound.set(round, rows);
      done++;
      if (done % 50 === 0 || done === targets.length) {
        console.log(`  ${done}/${targets.length} 회차 완료`);
      }
    },
    CONCURRENCY,
  );

  if (failed) console.warn(`⚠️  ${failed}건 요청 실패 — 다시 실행하면 보완됩니다.`);

  const wins = [...winsByRound.values()]
    .flat()
    .sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1]);

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ stores, wins }), "utf8");

  const first = wins.filter((w) => w[2] === 1).length;
  const second = wins.length - first;
  console.log(
    `저장 완료: ${OUT}\n  판매점 ${stores.length.toLocaleString("ko-KR")}곳 / 1등 배출 ${first.toLocaleString("ko-KR")}건 / 2등 배출 ${second.toLocaleString("ko-KR")}건`,
  );
}

main().catch((err) => {
  console.error("수집 실패:", err.message);
  process.exit(1);
});
