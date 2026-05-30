import Link from "next/link"
import { getContentItems } from "@/actions/content.actions"
import { DeleteContentButton } from "@/components/content/DeleteContentButton"
import { Button } from "@/components/ui/button"
import {
  Plus, Pencil, ExternalLink,
  Clapperboard, Film, ImageIcon, Layers, Video, FileText,
} from "lucide-react"
import { CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS } from "@/lib/constants"
import { formatDate, cn } from "@/lib/utils"
import { PlatformChip } from "@/components/ui/PlatformIcon"
import type { ContentItem, ContentStatus } from "@/lib/types"

// ── Content type config ─────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeText: string
}> = {
  short_video: { label: "คลิปสั้น",  Icon: Clapperboard, iconBg: "bg-blue-100",   iconColor: "text-blue-600",   badgeBg: "bg-blue-50",   badgeText: "text-blue-600" },
  long_video:  { label: "คลิปยาว",   Icon: Film,         iconBg: "bg-purple-100", iconColor: "text-purple-600", badgeBg: "bg-purple-50", badgeText: "text-purple-600" },
  photo:       { label: "รูปภาพ",    Icon: ImageIcon,    iconBg: "bg-pink-100",   iconColor: "text-pink-600",   badgeBg: "bg-pink-50",   badgeText: "text-pink-600" },
  story:       { label: "สตอรี่",    Icon: Layers,       iconBg: "bg-orange-100", iconColor: "text-orange-600", badgeBg: "bg-orange-50", badgeText: "text-orange-600" },
  reel:        { label: "รีล",       Icon: Video,        iconBg: "bg-indigo-100", iconColor: "text-indigo-600", badgeBg: "bg-indigo-50", badgeText: "text-indigo-600" },
  blog:        { label: "บล็อก",     Icon: FileText,     iconBg: "bg-teal-100",   iconColor: "text-teal-600",   badgeBg: "bg-teal-50",   badgeText: "text-teal-600" },
}


const STATUS_FILTERS = [
  { value: "all",       label: "ทั้งหมด" },
  { value: "idea",      label: "ไอเดีย" },
  { value: "scripting", label: "เขียนสคริปต์" },
  { value: "shooting",  label: "ถ่ายทำ" },
  { value: "editing",   label: "ตัดต่อ" },
  { value: "ready",     label: "พร้อมโพส" },
  { value: "posted",    label: "โพสแล้ว" },
]

// ── Row component ───────────────────────────────────────────

function ContentListRow({ item }: { item: ContentItem }) {
  const cfg = TYPE_CONFIG[item.content_type] ?? {
    label: item.content_type, Icon: FileText,
    iconBg: "bg-gray-100", iconColor: "text-gray-500",
    badgeBg: "bg-gray-50", badgeText: "text-gray-600",
  }
  const { Icon } = cfg
  const thumb = item.images?.[0]

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(35,30%,98%)] transition-colors group">

      {/* Thumbnail / type icon */}
      <div className={cn("w-12 h-12 rounded-lg shrink-0 overflow-hidden flex items-center justify-center", cfg.iconBg)}>
        {thumb
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          : <Icon className={cn("w-5 h-5", cfg.iconColor)} />
        }
      </div>

      {/* Info — title section (flex-1) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md", cfg.badgeBg, cfg.badgeText)}>
            <Icon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium", CONTENT_STATUS_COLORS[item.status as ContentStatus])}>
            {CONTENT_STATUS_LABELS[item.status as ContentStatus]}
          </span>
          {item.is_sponsored && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium">สปอนเซอร์</span>
          )}
        </div>
        <Link href={`/content/${item.id}`} className="block">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)] truncate hover:text-[hsl(24,85%,50%)] transition-colors">
            {item.title}
          </h3>
        </Link>
      </div>

      {/* Platforms + date — own column, matches header w-32 */}
      <div className="hidden md:flex flex-col items-end gap-1 w-32 shrink-0">
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {item.platforms.map(p => (
            <PlatformChip key={p} platform={p} size="xs" showLabel={false} />
          ))}
        </div>
        {item.planned_date && (
          <span className="text-[11px] text-[hsl(25,10%,55%)]">
            📅 {formatDate(item.planned_date)}
          </span>
        )}
      </div>

      {/* Actions — own column, matches header w-24 */}
      <div className="flex items-center justify-end gap-0.5 w-24 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <Link href={`/content/${item.id}/edit`} title="แก้ไข">
          <button className="p-1.5 rounded-lg text-[hsl(25,10%,55%)] hover:text-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </Link>
        <a href={`/content/${item.id}/brief`} target="_blank" rel="noopener" title="ดู Preview Brief">
          <button className="p-1.5 rounded-lg text-[hsl(25,10%,55%)] hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </a>
        <DeleteContentButton id={item.id} />
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const items = await getContentItems({ status: params.status })
  const activeStatus = params.status ?? "all"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">วางแผนคอนเทนต์</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">จัดการไอเดียและตารางคอนเทนต์</p>
        </div>
        <Link href="/content/new">
          <Button><Plus className="w-4 h-4 mr-1" />สร้างคอนเทนต์</Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/content" : `/content?status=${s.value}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeStatus === s.value
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[hsl(35,20%,88%)]">
          <p className="text-[hsl(25,10%,50%)] mb-4">ยังไม่มีคอนเทนต์</p>
          <Link href="/content/new">
            <Button variant="outline" size="sm">สร้างคอนเทนต์แรก</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden divide-y divide-[hsl(35,20%,93%)]">
          {/* Column header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[hsl(35,25%,96%)] text-[10px] font-semibold uppercase tracking-wider text-[hsl(25,10%,50%)]">
            <div className="w-12 shrink-0" />
            <div className="flex-1">ชื่อคอนเทนต์</div>
            <div className="w-32 text-right">แพลตฟอร์ม / วันโพส</div>
            <div className="w-24 text-right">การจัดการ</div>
          </div>

          {items.map(item => (
            <ContentListRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
