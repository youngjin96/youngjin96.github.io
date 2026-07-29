import { ballColor } from "@/lib/patterns";

const COLOR_CLASS: Record<ReturnType<typeof ballColor>, string> = {
  yellow: "bg-ball-yellow text-black/80",
  blue: "bg-ball-blue text-black/80",
  red: "bg-ball-red text-white",
  gray: "bg-ball-gray text-white",
  green: "bg-ball-green text-black/80",
};

const SIZE_CLASS = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-lg",
  xl: "size-14 text-xl sm:size-16 sm:text-2xl",
} as const;

export function LottoBall({
  n,
  size = "md",
  dim = false,
}: {
  n: number;
  size?: keyof typeof SIZE_CLASS;
  dim?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums shadow-sm ${
        COLOR_CLASS[ballColor(n)]
      } ${SIZE_CLASS[size]} ${dim ? "opacity-30" : ""}`}
    >
      {n}
    </span>
  );
}

/** 당첨번호 6개 + 보너스 */
export function BallRow({
  numbers,
  bonus,
  size = "md",
  className = "",
}: {
  numbers: number[];
  bonus?: number;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      {numbers.map((n) => (
        <LottoBall key={n} n={n} size={size} />
      ))}
      {bonus != null && (
        <>
          <span
            aria-hidden
            className="px-0.5 text-muted select-none"
          >
            +
          </span>
          <span className="sr-only">보너스 번호</span>
          <LottoBall n={bonus} size={size} />
        </>
      )}
    </div>
  );
}
