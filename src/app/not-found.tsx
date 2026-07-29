import Link from "next/link";
import { BallRow } from "@/components/LottoBall";
import { Card } from "@/components/ui";
import { latestDraw } from "@/lib/draws";

export default function NotFound() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="mt-2 text-sm text-muted">
        주소가 바뀌었거나 아직 추첨하지 않은 회차일 수 있습니다.
      </p>

      <Card className="mx-auto mt-8 max-w-md text-left">
        <p className="text-xs text-muted">최신 {latestDraw.round}회 당첨번호</p>
        <BallRow
          numbers={latestDraw.numbers}
          bonus={latestDraw.bonus}
          size="md"
          className="mt-3 justify-center"
        />
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href="/"
            className="rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
          >
            홈으로
          </Link>
          <Link
            href="/results"
            className="rounded-xl border border-line px-4 py-2.5 text-center text-sm font-semibold hover:bg-surface-2"
          >
            회차별 당첨번호
          </Link>
        </div>
      </Card>
    </div>
  );
}
