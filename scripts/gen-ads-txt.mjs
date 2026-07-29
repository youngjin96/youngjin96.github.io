/**
 * public/ads.txt 를 환경변수에서 만들어 낸다.
 *
 * 정적 export 에서는 라우트 핸들러로 조건부 응답을 만들 수 없어서,
 * 빌드 직전에 파일을 생성하는 방식으로 처리한다.
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID 가 없으면 기존 파일을 지운다.
 */
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "ads.txt");
const clientId = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim();

if (!clientId) {
  await unlink(OUT).catch(() => {});
  console.log("ads.txt: 애드센스 ID 없음 — 생성하지 않음");
} else {
  // ca-pub-1234567890123456 → pub-1234567890123456
  const publisherId = clientId.replace(/^ca-/, "");
  await writeFile(
    OUT,
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    "utf8",
  );
  console.log(`ads.txt: ${publisherId} 로 생성`);
}
