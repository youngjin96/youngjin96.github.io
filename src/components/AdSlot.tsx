import { siteConfig } from "@/site.config";

/**
 * 애드센스 광고 자리.
 *
 * NEXT_PUBLIC_ADSENSE_CLIENT_ID 가 비어 있으면 아무것도 렌더하지 않는다.
 * (승인 전에는 빈 회색 박스가 노출되지 않도록 — 애드센스 심사에 불리하다.)
 *
 * 승인 후에는 .env 에 클라이언트 ID 를 넣고, 각 자리의 slot 값을 애드센스에서
 * 발급받은 광고 단위 ID 로 바꿔주면 됩니다.
 */
export function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = true,
}: {
  slot?: string;
  format?: "auto" | "fluid" | "horizontal";
  className?: string;
  label?: boolean;
}) {
  if (!siteConfig.adsenseClientId || !slot) return null;

  return (
    <div className={`my-6 ${className}`}>
      {label && (
        <p className="mb-1 text-center text-[11px] text-muted">광고</p>
      )}
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={siteConfig.adsenseClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
        }}
      />
    </div>
  );
}
