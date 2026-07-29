/**
 * OG 이미지와 파비콘을 public/ 에 PNG 파일로 만들어 둔다.
 *
 * Next 의 opengraph-image.tsx / icon.tsx 파일 규칙을 쓰면 output:"export" 에서
 * 확장자 없는 파일(out/opengraph-image)로 떨어져 GitHub Pages 가 image/png 대신
 * octet-stream 으로 서빙하고, basePath 도 일부 태그에 붙지 않는다.
 * 그래서 빌드 전에 직접 PNG 를 만들고 metadata 에서 절대경로로 참조한다.
 *
 * 실행: node scripts/gen-images.mjs  (npm run prebuild 에 연결됨)
 */
import { createRequire } from "node:module";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";

const require = createRequire(import.meta.url);
// next/og 는 ESM exports 맵이 없어 require 로 가져온다.
const { ImageResponse } = require("next/og");

const PUBLIC = path.join(process.cwd(), "public");
const draws = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "draws.json"), "utf8"),
);
const latest = draws[draws.length - 1];

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "로또리포트";

const BALL_HEX = (n) =>
  n <= 10 ? "#fbc400" : n <= 20 ? "#69c8f2" : n <= 30 ? "#ff7272" : n <= 40 ? "#aaaaaa" : "#b0d840";

const ogElement = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "80px",
      background: "linear-gradient(135deg, #1b3c74 0%, #1f63dd 100%)",
      color: "#ffffff",
    },
  },
  h("div", { style: { fontSize: 34, opacity: 0.85 } }, SITE_NAME),
  h(
    "div",
    { style: { fontSize: 76, fontWeight: 800, marginTop: 8 } },
    `${latest.round}회 로또 당첨번호`,
  ),
  h(
    "div",
    { style: { display: "flex", gap: 18, marginTop: 44 } },
    ...latest.numbers.map((n) =>
      h(
        "div",
        {
          key: n,
          style: {
            width: 108,
            height: 108,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BALL_HEX(n),
            color: "#1a1a1a",
            fontSize: 48,
            fontWeight: 800,
          },
        },
        String(n),
      ),
    ),
  ),
  h(
    "div",
    { style: { fontSize: 30, opacity: 0.85, marginTop: 44 } },
    `${latest.date} 추첨 · 보너스 ${latest.bonus} · 전 회차 통계와 번호 추천`,
  ),
);

const iconElement = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fbc400",
      borderRadius: "50%",
      color: "#1a1a1a",
      fontSize: 128,
      fontWeight: 800,
    },
  },
  "6",
);

async function render(element, size, file) {
  const res = new ImageResponse(element, size);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(PUBLIC, file), buf);
  console.log(`${file}: ${size.width}x${size.height}, ${Math.round(buf.length / 1024)}KB`);
}

await mkdir(PUBLIC, { recursive: true });
await render(ogElement, { width: 1200, height: 630 }, "og.png");
await render(iconElement, { width: 180, height: 180 }, "icon.png");
