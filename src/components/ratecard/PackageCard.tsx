import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { PlatformBubble } from "@/components/ui/PlatformIcon"
import { PackageTermsBadge } from "@/components/ratecard/PackageTermsBadge"
import type { RateCardPackage } from "@/lib/types"

export function PackageCard({ pkg, platformLogos }: { pkg: RateCardPackage; platformLogos?: Record<string, string> }) {
  const saving = pkg.original_price && pkg.price ? pkg.original_price - pkg.price : null
  const isPerPlatform = pkg.category === "per_platform"
  const hasPlatforms = pkg.platforms && pkg.platforms.length > 0
  return (
    <div className={[
      "group relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden",
      "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
      pkg.is_featured
        ? "border-primary shadow-md shadow-orange-100"
        : isPerPlatform
          ? "border-[hsl(35,25%,75%)] shadow-md"
          : "border-border hover:border-[hsl(24,85%,55%)]",
    ].join(" ")}>
      {pkg.is_featured && (
        <div className="bg-gradient-to-r from-[hsl(24,85%,50%)] to-[hsl(35,85%,55%)] px-3 pt-1.5 pb-2 sm:px-3 sm:pt-1.5 sm:pb-2 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 w-full justify-center">
            <span className="text-xs font-black text-white tracking-wide">🔥 All Platforms</span>
            {saving && (
              <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                ประหยัด {formatCurrency(saving)}
              </span>
            )}
          </div>
          {hasPlatforms && (
            <div className="flex items-center justify-center gap-1.5">
              {pkg.platforms!.map(p => {
                const logo = platformLogos?.[p]
                return logo ? (
                  <div key={p} className="w-6 h-6 rounded-full overflow-hidden bg-white border border-white/30 flex items-center justify-center shrink-0">
                    <Image src={logo} alt={p} width={24} height={24} className="object-cover" />
                  </div>
                ) : (
                  <PlatformBubble key={p} platform={p} size={24} noHover />
                )
              })}
              {pkg.content_type === "video" && <span className="text-sm leading-none">🎬</span>}
              {pkg.content_type === "photo" && <span className="text-sm leading-none">📷</span>}
            </div>
          )}
        </div>
      )}
      {isPerPlatform && (
        <div className={`px-3 py-1.5 flex items-center justify-center gap-2 ${hasPlatforms ? "bg-foreground" : "bg-[hsl(25,20%,20%)]"}`}>
          {hasPlatforms ? (
            <>
              <div className="flex items-center gap-1.5">
                {pkg.platforms!.map(p => {
                  const logo = platformLogos?.[p]
                  return logo ? (
                    <div key={p} className="w-6 h-6 rounded-full overflow-hidden bg-white border border-white/30 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo} alt={p} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <PlatformBubble key={p} platform={p} size={24} noHover />
                  )
                })}
                {pkg.content_type === "video" && (
                  <span className="text-base leading-none" title="VDO">🎬</span>
                )}
                {pkg.content_type === "photo" && (
                  <span className="text-base leading-none" title="Photo">📷</span>
                )}
              </div>
              {saving && (
                <span className="text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full ml-auto">
                  ประหยัด {formatCurrency(saving)}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-xs font-black text-white tracking-wide">📦 Single Platform</span>
              {saving && (
                <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                  ประหยัด {formatCurrency(saving)}
                </span>
              )}
            </>
          )}
        </div>
      )}
      {pkg.sub_items && pkg.sub_items.length > 0 ? (
        <div className="p-3 flex flex-col gap-1 flex-1">
          <h3 className="font-black text-foreground text-sm leading-snug">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{pkg.description}</p>
          )}
          <div className="mt-1 pt-2 border-t border-border space-y-1">
            {pkg.sub_items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-brand-tx">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 flex items-center gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-foreground text-sm leading-snug">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{pkg.description}</p>
            )}
          </div>
          <div className="shrink-0 text-right pl-3 border-l border-border">
            {pkg.price != null ? (
              <>
                {pkg.original_price && (
                  <div className="text-[9px] text-ink-dim line-through leading-tight">{formatCurrency(pkg.original_price)}</div>
                )}
                <div className="text-lg font-black text-brand-tx leading-tight">{formatCurrency(pkg.price)}</div>
                {pkg.unit && <div className="text-[9px] text-muted-foreground leading-tight">{pkg.unit}</div>}
              </>
            ) : (
              <div className="text-xs font-bold text-foreground whitespace-nowrap">ติดต่อสอบถาม →</div>
            )}
          </div>
        </div>
      )}
      {pkg.terms && (
        <div className="border-t border-border px-3 flex items-center justify-center min-h-[44px]">
          <PackageTermsBadge name={pkg.name} terms={pkg.terms} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-orange-50/30 to-transparent" />
    </div>
  )
}
