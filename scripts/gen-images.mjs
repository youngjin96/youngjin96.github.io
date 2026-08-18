/**
 * OG 이미지 · 파비콘 · 웹앱 매니페스트를 public/ 에 만들어 둔다.
 *
 * Next 의 opengraph-image.tsx / icon.tsx 파일 규칙을 쓰면 output:"export" 에서
 * 확장자 없는 파일(out/opengraph-image)로 떨어져 GitHub Pages 가 image/png 대신
 * octet-stream 으로 서빙하고, basePath 도 일부 태그에 붙지 않는다.
 * 그래서 빌드 전에 직접 파일을 만들고 metadata 에서 절대경로로 참조한다.
 *
 * OG 는 회차와 무관한 고정 이미지 한 장이다. 회차별로 굽지 않으므로
 * 여기에 특정 회차 당첨번호를 넣지 않는다. (공은 색 구간을 보여주는 장식)
 *
 * 실행: node scripts/gen-images.mjs  (npm run prebuild 에 연결됨)
 */
import { createRequire } from "node:module";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";

const require = createRequire(import.meta.url);
// next/og 는 ESM exports 맵이 없어 require 로 가져온다.
const { ImageResponse } = require("next/og");

const PUBLIC = path.join(process.cwd(), "public");

// src/site.config.ts 와 맞춘 값. (스크립트에서 TS 를 못 읽어 이름만 중복해 둔다)
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "로또리포트";
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

const ACCENT = "#1f63dd";
const ACCENT_DARK = "#12224a";
const BALL_YELLOW = "#fbc400";
const INK = "#1a1a1a";

const BALL_HEX = (n) =>
  n <= 10
    ? BALL_YELLOW
    : n <= 20
      ? "#69c8f2"
      : n <= 30
        ? "#ff7272"
        : n <= 40
          ? "#aaaaaa"
          : "#b0d840";

// 색 구간 5개를 하나씩 보여주는 장식용 번호.
// 6개(= 실제 조합 크기)를 쓰면 고정 이미지가 당첨번호처럼 읽힐 수 있어 5개만 쓴다.
const SHOWCASE = [6, 13, 25, 34, 45];

/** OG 이미지 1200x630 (고정) */
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
      background: `linear-gradient(135deg, ${ACCENT_DARK} 0%, ${ACCENT} 100%)`,
      color: "#ffffff",
    },
  },
  h(
    "div",
    { style: { display: "flex", fontSize: 34, opacity: 0.85 } },
    SITE_NAME,
  ),
  h(
    "div",
    { style: { display: "flex", fontSize: 76, fontWeight: 800, marginTop: 8 } },
    "로또 6/45 당첨번호 통계",
  ),
  h(
    "div",
    { style: { display: "flex", gap: 20, marginTop: 44 } },
    ...SHOWCASE.map((n) =>
      h(
        "div",
        {
          key: n,
          style: {
            width: 112,
            height: 112,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BALL_HEX(n),
            color: INK,
            fontSize: 50,
            fontWeight: 800,
          },
        },
        String(n),
      ),
    ),
  ),
  h(
    "div",
    { style: { display: "flex", fontSize: 30, opacity: 0.85, marginTop: 44 } },
    "번호별 출현 횟수 · 미출현 회차 · 궁합수 · 번호 추천",
  ),
);

/** 파비콘용: 화면을 꽉 채운 로또 공. 16px 에서도 형태가 남는다. */
const ballElement = (size) =>
  h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BALL_YELLOW,
        borderRadius: "50%",
        color: INK,
        fontSize: Math.round(size * 0.68),
        fontWeight: 800,
      },
    },
    "6",
  );

/**
 * 홈화면 아이콘용: 배경을 채우고 공을 안쪽에 둔다.
 * iOS 는 투명 배경을 검게 깔고, 안드로이드 maskable 은 가장자리를 잘라내므로
 * 여백(safe zone)이 있는 이 형태를 both 로 쓴다.
 */
const appElement = (size) =>
  h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ACCENT,
      },
    },
    h(
      "div",
      {
        style: {
          width: Math.round(size * 0.6),
          height: Math.round(size * 0.6),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BALL_YELLOW,
          borderRadius: "50%",
          color: INK,
          fontSize: Math.round(size * 0.38),
          fontWeight: 800,
        },
      },
      "6",
    ),
  );

async function png(element, size) {
  const res = new ImageResponse(element, { width: size, height: size });
  return Buffer.from(await res.arrayBuffer());
}

async function write(file, buf) {
  await writeFile(path.join(PUBLIC, file), buf);
  console.log(`${file}: ${Math.round(buf.length / 1024)}KB`);
}

/**
 * PNG 여러 장을 .ico 컨테이너로 묶는다.
 * ICO 는 256px 이하 항목에 PNG 를 그대로 담을 수 있고(Vista+),
 * 요즘 브라우저는 모두 이 형식을 읽는다.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const dirSize = 16 * images.length;
  let offset = header.length + dirSize;

  const entries = images.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // 팔레트 색 수 (트루컬러라 0)
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

/**
 * 웹앱 매니페스트.
 * .webmanifest 는 GitHub Pages 가 MIME 을 못 잡을 수 있어 .json 으로 낸다.
 * basePath 배포에서도 맞도록 경로에 basePath 를 붙인다.
 */
function manifest() {
  const p = (file) => `${BASE_PATH}/${file}`;
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    lang: "ko",
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: ACCENT,
    icons: [
      {
        src: p("icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: p("icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

await mkdir(PUBLIC, { recursive: true });

await write(
  "og.png",
  Buffer.from(
    await new ImageResponse(ogElement, {
      width: 1200,
      height: 630,
    }).arrayBuffer(),
  ),
);

// 애플 터치 아이콘 겸 일반 아이콘
await write("icon.png", await png(appElement(180), 180));
await write("icon-192.png", await png(appElement(192), 192));
await write("icon-512.png", await png(appElement(512), 512));

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, buf: await png(ballElement(size), size) });
}
await write("favicon.ico", buildIco(icoImages));

await write(
  "manifest.json",
  Buffer.from(`${JSON.stringify(manifest(), null, 2)}\n`, "utf8"),
);
