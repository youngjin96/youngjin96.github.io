import Link from "next/link";
import type { Store } from "@/lib/stores";
import { getDraw } from "@/lib/draws";

/** 명당 랭킹 표. 지역 페이지들이 공유한다. */
export function StoreTable({
  stores,
  showRegion = false,
  startRank = 1,
}: {
  stores: Store[];
  /** 전국 랭킹처럼 지역이 섞여 있을 때 지역 열을 보여준다 */
  showRegion?: boolean;
  startRank?: number;
}) {
  if (!stores.length) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted sm:px-6">
        1등을 배출한 판매점이 아직 없습니다.
      </p>
    );
  }

  return (
    <div className="scroll-x">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">1등 배출 판매점 순위</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th scope="col" className="px-4 py-3 font-medium">
              순위
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              판매점
            </th>
            {showRegion && (
              <th scope="col" className="px-4 py-3 font-medium">
                지역
              </th>
            )}
            <th scope="col" className="px-4 py-3 text-right font-medium">
              1등
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              2등
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              최근 1등 배출
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {stores.map((s, i) => {
            const draw = s.lastFirstRound ? getDraw(s.lastFirstRound) : undefined;
            return (
              <tr key={s.id} className="hover:bg-surface-2">
                <td className="px-4 py-3 align-top tabular-nums text-muted">
                  {startRank + i}
                </td>
                <th scope="row" className="px-4 py-3 text-left align-top">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="mt-0.5 block text-[11px] font-normal leading-relaxed text-muted">
                    {s.addr}
                  </span>
                  {s.tel && (
                    <a
                      href={`tel:${s.tel}`}
                      className="mt-0.5 block text-[11px] font-normal text-accent hover:underline"
                    >
                      {s.tel}
                    </a>
                  )}
                </th>
                {showRegion && (
                  <td className="px-4 py-3 align-top whitespace-nowrap text-muted">
                    <Link
                      href={`/stores/${encodeURIComponent(s.sido)}/${encodeURIComponent(s.sigungu)}`}
                      className="hover:text-accent hover:underline"
                    >
                      {s.sido} {s.sigungu}
                    </Link>
                  </td>
                )}
                <td className="px-4 py-3 text-right align-top font-bold tabular-nums">
                  {s.first}회
                </td>
                <td className="px-4 py-3 text-right align-top tabular-nums text-muted">
                  {s.second}회
                </td>
                <td className="px-4 py-3 text-right align-top whitespace-nowrap tabular-nums">
                  {s.lastFirstRound ? (
                    <>
                      <Link
                        href={`/results/${s.lastFirstRound}`}
                        className="text-accent hover:underline"
                      >
                        {s.lastFirstRound}회
                      </Link>
                      {draw && (
                        <span className="block text-[11px] text-muted">
                          {draw.date}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
