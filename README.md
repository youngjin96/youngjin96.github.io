# 로또리포트 — 로또 6/45 통계 & 번호 추천

동행복권이 공개한 로또 6/45 전 회차 당첨번호를 모아 통계로 보여주고, 통계 기반
번호 추천을 제공하는 사이트입니다. **검색 유입 극대화**를 전제로 만들었습니다.

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **정적 export** — 서버 없이 GitHub Pages 로 배포. 현재 **1,604 페이지**
- 런타임 DB·API 호출 없음 (데이터는 `data/draws.json` 하나)

## 현재 배포

| | |
| --- | --- |
| 사이트 | https://youngjin96.github.io/ |
| 저장소 | `youngjin96/youngjin96.github.io` (사용자 Pages 저장소 → basePath 없음) |
| 배포 | `main` 푸시 / 매주 토요일 추첨 후 자동 / 수동 실행 |
| 등록된 Variables | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` |

> 사용자 Pages 저장소(`<username>.github.io`)를 쓰는 이유가 있습니다. 프로젝트
> 저장소로 두면 사이트가 `/저장소명/` 하위에 놓이는데, **네이버 서치어드바이저는
> 호스트 단위 URL 만 등록**을 받고 **애드센스 `ads.txt` 도 도메인 루트에서만**
> 읽힙니다. 둘 다 하위 경로에서는 막힙니다.

## 빠른 시작

```bash
npm install
npm run update-data   # 최신 회차까지 수집 (증분)
npm run dev           # http://localhost:3000
```

정적 결과물을 그대로 확인하려면:

```bash
npm run build && npm run preview   # out/ 을 정적 서버로 서빙
```

## GitHub Pages 배포

### 1. 저장소 만들고 푸시

```bash
git add -A
git commit -m "로또 통계 사이트"
gh repo create lotto-stats --public --source=. --push
```

### 2. Pages 활성화

저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions**
로 바꿉니다. (기본값인 "Deploy from a branch" 가 아닙니다)

### 3. 배포 주소 변수 등록

**Settings → Secrets and variables → Actions → Variables** 탭에서 등록합니다.
`Secrets` 가 아니라 **`Variables`** 입니다 (빌드 시 HTML 에 박히는 공개 값).

| 배포 형태 | `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_BASE_PATH` |
| --- | --- | --- |
| 커스텀 도메인 | `https://내도메인.kr` | (비움) |
| `username.github.io` 저장소 | `https://username.github.io` | (비움) |
| 프로젝트 저장소 | `https://username.github.io` | `/lotto-stats` |

> **이 값을 안 넣으면** canonical 과 sitemap 이 `https://example.github.io` 로
> 나가서 색인이 통째로 어긋납니다. 배포 전에 반드시 채우세요.

프로젝트 저장소로 배포할 때 `NEXT_PUBLIC_BASE_PATH` 를 빠뜨리면 CSS·JS 경로가
전부 깨져서 스타일 없는 페이지가 뜹니다.

### 4. 커스텀 도메인 (선택, 권장)

Settings → Pages → Custom domain 에 도메인을 넣으면 GitHub 이 `CNAME` 파일을
자동으로 관리합니다. 도메인을 쓰면 basePath 가 필요 없어지고 URL 도 짧아집니다.

### 5. 브랜드명 변경

`src/site.config.ts` 의 `name` / `title` / `description` 을 바꿉니다.

### 배포 워크플로

`.github/workflows/deploy.yml` 하나가 세 가지 경우에 돕니다.

1. `main` 에 푸시할 때 → 빌드 & 배포
2. 매주 토요일 추첨 직후(KST 일요일 00:20) → **새 회차 수집 → 커밋 → 빌드 & 배포**
3. Actions 탭에서 수동 실행

> 수집과 배포를 한 워크플로에 합친 이유가 있습니다. `GITHUB_TOKEN` 으로 푸시하면
> 다른 워크플로가 트리거되지 않아서, 수집과 배포를 나누면 데이터만 갱신되고
> 사이트는 영영 재배포되지 않습니다.

## 데이터

`scripts/fetch-draws.mjs` 가 동행복권의 회차 조회 엔드포인트
(`/lt645/selectPstLt645InfoNew.do`)에서 10회차씩 받아 `data/draws.json` 에
저장합니다.

```bash
npm run update-data        # 없는 회차만 증분 수집 (평소엔 이것만)
npm run update-data:full   # 1회차부터 전부 다시 수집
```

회차당 저장 항목: 당첨번호 6개, 보너스, 추첨일, 1~5등 당첨자 수·당첨금,
1등 자동/수동/반자동 건수, 회차 판매액.

> 동행복권 사이트가 개편되면 엔드포인트가 바뀔 수 있습니다. 워크플로가 실패하면
> `scripts/fetch-draws.mjs` 상단의 API 경로부터 확인하세요. (2026년 개편으로
> 기존 `common.do?method=getLottoNumber` 는 이미 동작하지 않습니다)

## 페이지 구성

| 경로 | 페이지 수 | 노리는 검색어 |
| --- | --- | --- |
| `/` | 1 | 로또 당첨번호, 로또 |
| `/results` | 1 | 회차별 당첨번호 |
| `/results/[round]` | 1,234 | `1234회 로또 당첨번호` (회차별 롱테일) |
| `/results/year/[year]` | 25 | `2026년 로또 당첨번호` |
| `/results/search` | 1 | 로또 당첨 확인 |
| `/stats` | 1 | 로또 통계 |
| `/stats/frequency` | 1 | 많이 나온 로또 번호 |
| `/stats/overdue` | 1 | 오래 안 나온 로또 번호 |
| `/stats/pairs` | 1 | 로또 궁합수 |
| `/stats/patterns` | 1 | 로또 홀짝, 번호 합계, AC값 |
| `/stats/prize` | 1 | 역대 로또 1등 당첨금 |
| `/stats/number/[n]` | 45 | `로또 7번 통계` |
| `/recommend` | 1 | 로또 번호 추천, 로또 번호 생성기 |
| `/guide/[slug]` | 5 | 로또 세금, 당첨금 수령 방법, 당첨 확률 |
| `/stores` | 1 | 로또 명당, 1등 배출 판매점 |
| `/stores/[sido]` | 17 | `서울 로또 명당`, `경기 로또 명당` |
| `/stores/[sido]/[sigungu]` | 260 | `강남구 로또 명당` (지역 롱테일) |

## SEO 구현 내용

- 페이지별 `title` / `description` / `canonical` — 회차·번호별로 전부 다름
- `sitemap.xml` 자동 생성 (1,600 URL, 최신 회차 우선순위 상향)
- `robots.txt` — Mediapartners-Google / AdsBot-Google 명시 허용
- 구조화 데이터: `WebSite`, `BreadcrumbList`, `Article`, `FAQPage`
- OG 이미지 — 최신 당첨번호가 그려진 카드를 빌드 때 `public/og.png` 로 생성
- 내부 링크: 회차 ↔ 번호 ↔ 통계 ↔ 가이드 상호 연결
- 전 페이지 정적 HTML + 시스템 폰트 → LCP/CLS 유리
- 클라이언트 번들에 데이터셋 미포함 (`src/lib/patterns.ts` 로 순수 로직 분리)

**basePath 주의:** canonical·OG·구조화 데이터 URL 은 전부
`site.config.ts` 의 `absoluteUrl()` / `assetUrl()` 로 만듭니다. Next 의
`metadataBase` 에 상대경로를 넘기면 basePath 가 날아가기 때문입니다. 새 페이지를
추가할 때도 이 함수를 쓰세요.

### 색인 등록

1. [구글 서치콘솔](https://search.google.com/search-console) 속성 등록 →
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 변수에 값 입력 → 재배포 → 소유권 확인
   (네이버는 `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`)
2. 서치콘솔에서 `sitemap.xml` 제출
3. [네이버 서치어드바이저](https://searchadvisor.naver.com) 에도 등록
   (국내 로또 검색은 네이버 비중이 큽니다)
4. [빙 웹마스터](https://www.bing.com/webmasters) 등록

## 애드센스

`NEXT_PUBLIC_ADSENSE_CLIENT_ID` 변수를 넣으면 자동 적용됩니다.

- 값이 비어 있으면 광고 스크립트도, 빈 광고 자리도, `ads.txt` 도 만들어지지
  않습니다 (심사 중 빈 회색 박스는 감점 요인)
- `ads.txt` 는 빌드 때 클라이언트 ID 로부터 `public/ads.txt` 로 생성됩니다
- 광고 자리는 `<AdSlot slot={...} />` — 홈/회차/통계/가이드 상단·중단에 배치

**중요:** 구글 애드센스는 도박·복권 관련 콘텐츠에 제한을 둡니다. 로또 통계
사이트가 승인되는 사례는 많지만 거절되거나 광고 제한이 걸릴 수도 있습니다.
승인 가능성을 높이려고 이 사이트는 이렇게 만들어져 있습니다.

- 복권 판매·구매 대행·구매 링크 없음
- 당첨 보장 표현 없음 (모든 추천 옆에 확률 고지)
- 정보성 콘텐츠(가이드 5편) 비중 확보
- 전 페이지 하단에 면책 고지, 도박문제 상담 안내(1336), 미성년자 구매 불가 명시
- 개인정보처리방침 · 사이트 소개 페이지 구비 (애드센스 심사 사실상 필수)

대안 광고로는 카카오 애드핏, 데이블 등이 있습니다.

## 구조

```
data/draws.json          # 전 회차 당첨번호 (커밋 대상)
data/stores.json         # 당첨 판매점 마스터 + 배출 이력 (커밋 대상)
scripts/
  fetch-draws.mjs        # 동행복권 회차 수집기
  fetch-stores.mjs       # 당첨 판매점(명당) 수집기
  gen-images.mjs         # public/og.png, public/icon.png 생성 (prebuild)
  gen-ads-txt.mjs        # public/ads.txt 생성 (prebuild)
src/site.config.ts       # 도메인·basePath·브랜드·광고 ID + URL 헬퍼
src/lib/
  draws.ts               # 데이터 로드
  patterns.ts            # 순수 계산 (데이터 import 없음 → 클라이언트 안전)
  stats.ts               # 데이터 기반 통계 (서버 전용)
  recommend.ts           # 번호 추천 엔진
  guides.ts              # 가이드 문서 메타
  stores.ts              # 명당 집계 + 지역명 정규화
src/components/          # UI
src/app/                 # 라우트
```

## 알아둘 점

- `out/` 산출물은 약 250MB 입니다. 대부분 Next 가 만드는 클라이언트 내비게이션용
  `.txt` 프리페치 파일이고, 실제 전송은 gzip 되어 페이지당 10KB 수준입니다.
  GitHub Pages 용량 제한(1GB) 안이지만, 회차가 계속 쌓이므로 언젠가 오래된 회차
  페이지를 가볍게 만드는 작업이 필요할 수 있습니다.
- `next start` 는 쓸 수 없습니다 (`output: "export"`). `npm run preview` 를 쓰세요.

## 콘텐츠 늘리기

검색 유입은 페이지 수와 내용의 질에 비례합니다. 이어 붙이면 좋은 것:

- **가이드 추가** — `src/lib/guides.ts` 에 항목을 넣고
  `src/app/guide/[slug]/content.tsx` 에 본문을 추가하면 sitemap까지 자동 반영
- **연금복권 720+** — 같은 구조로 복제 가능
