import Link from "next/link"
import { CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS, CONTENT_TYPES } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { ContentItem } from "@/lib/types"

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#000000",
  youtube: "#FF0000",
  lemon8: "#D4A017",
  shopee: "#EE4D2D",
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "FB", instagram: "IG", tiktok: "TT",
  youtube: "YT", lemon8: "L8", shopee: "SP",
}

export function ContentCard({ item }: { item: ContentItem }) {
  const typeLabel = CONTENT_TYPES.find(t => t.value === item.content_type)?.label ?? item.content_type

  return (
    <Link href={`/content/${item.id}`} className="block bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 hover:shadow-md transition-all hover:border-[hsl(24,85%,70%)]">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTENT_STATUS_COLORS[item.status]}`}>
          {CONTENT_STATUS_LABELS[item.status]}
        </span>
        {item.is_sponsored && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">สปอนเซอร์</span>
        )}
      </div>
      <h3 className="font-semibold text-[hsl(25,20%,15%)] line-clamp-2 mb-2">{item.title}</h3>
      <p className="text-xs text-[hsl(25,10%,50%)] mb-3">{typeLabel}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {item.platforms.map(p => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: PLATFORM_COLORS[p] ?? "#6b7280" }}>
              {PLATFORM_LABELS[p] ?? p}
            </span>
          ))}
        </div>
        {item.planned_date && (
          <p className="text-xs text-[hsl(25,10%,50%)]">📅 {formatDate(item.planned_date)}</p>
        )}
      </div>
    </Link>
  )
}
