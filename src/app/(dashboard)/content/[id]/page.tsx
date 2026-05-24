import { notFound } from "next/navigation"
import Link from "next/link"
import { getContentItem, deleteContentItem } from "@/actions/content.actions"
import { CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS, CONTENT_TYPES } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil, FileDown } from "lucide-react"
import { DeleteContentButton } from "@/components/content/DeleteContentButton"

const VIDEO_TYPES = ["short_video", "long_video", "story", "reel"]

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getContentItem(id)
  if (!item) notFound()

  const typeLabel = CONTENT_TYPES.find(t => t.value === item.content_type)?.label ?? item.content_type
  const isVideo = VIDEO_TYPES.includes(item.content_type)
  const isPhoto = item.content_type === "photo"
  const hasBrief = isPhoto ? (item.images?.length ?? 0) > 0 || !!item.caption : !!item.script

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">{item.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CONTENT_STATUS_COLORS[item.status]}`}>
              {CONTENT_STATUS_LABELS[item.status]}
            </span>
            {item.is_sponsored && <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">สปอนเซอร์</span>}
          </div>
          <p className="text-[hsl(25,10%,50%)] mt-1">{typeLabel}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {hasBrief && (
            <Link href={`/content/${id}/brief`}>
              <Button variant="outline" size="sm" className="text-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)]">
                <FileDown className="w-3.5 h-3.5 mr-1" />Brief / PDF
              </Button>
            </Link>
          )}
          <Link href={`/content/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />แก้ไข</Button>
          </Link>
          <DeleteContentButton id={id} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-[hsl(25,10%,50%)]">วันที่วางแผนโพส</dt><dd className="font-medium mt-0.5">{item.planned_date ? formatDate(item.planned_date) : "-"}</dd></div>
          <div><dt className="text-[hsl(25,10%,50%)]">วันถ่าย/ผลิต</dt><dd className="font-medium mt-0.5">{item.shoot_date ? formatDate(item.shoot_date) : "-"}</dd></div>
          <div><dt className="text-[hsl(25,10%,50%)]">แพลตฟอร์ม</dt><dd className="font-medium mt-0.5">{item.platforms.join(", ") || "-"}</dd></div>
          <div><dt className="text-[hsl(25,10%,50%)]">สร้างเมื่อ</dt><dd className="font-medium mt-0.5">{formatDate(item.created_at)}</dd></div>
        </dl>
        {item.hashtags && (
          <div className="mt-4 pt-4 border-t border-[hsl(35,20%,88%)]">
            <dt className="text-[hsl(25,10%,50%)] text-sm mb-1">Hashtags</dt>
            <dd className="text-sm text-[hsl(24,85%,50%)]">{item.hashtags}</dd>
          </div>
        )}
      </div>

      {item.idea_notes && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <h3 className="font-semibold mb-3">ไอเดีย / โน้ต</h3>
          <p className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap">{item.idea_notes}</p>
        </div>
      )}

      {/* VIDEO: Story + Scene */}
      {isVideo && item.script && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Story + Scene</h3>
            <Link href={`/content/${id}/brief`} className="text-xs text-[hsl(24,85%,50%)] hover:underline flex items-center gap-1">
              <FileDown className="w-3 h-3" />Preview &amp; PDF
            </Link>
          </div>
          <div
            className="brief-print text-sm text-[hsl(25,20%,20%)]"
            dangerouslySetInnerHTML={{ __html: item.script }}
          />
        </div>
      )}

      {/* PHOTO: Image grid */}
      {isPhoto && item.images && item.images.length > 0 && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">ภาพ Draft ({item.images.length} ภาพ)</h3>
            <Link href={`/content/${id}/brief`} className="text-xs text-[hsl(24,85%,50%)] hover:underline flex items-center gap-1">
              <FileDown className="w-3 h-3" />Preview &amp; PDF
            </Link>
          </div>
          <div className="columns-3 sm:columns-4 gap-1.5">
            {item.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={i} className="mb-1.5 break-inside-avoid rounded-lg overflow-hidden border border-[hsl(35,20%,88%)]">
                <img src={src} alt={`ภาพที่ ${i + 1}`} className="w-full h-auto block" style={{ maxHeight: "160px", objectFit: "contain", background: "hsl(35,30%,97%)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOG: script */}
      {!isVideo && !isPhoto && item.script && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">เนื้อหา / Script</h3>
            <Link href={`/content/${id}/brief`} className="text-xs text-[hsl(24,85%,50%)] hover:underline flex items-center gap-1">
              <FileDown className="w-3 h-3" />Preview &amp; PDF
            </Link>
          </div>
          <div
            className="brief-print text-sm text-[hsl(25,20%,20%)]"
            dangerouslySetInnerHTML={{ __html: item.script }}
          />
        </div>
      )}

      {/* Caption (Video + Photo) */}
      {(isVideo || isPhoto) && item.caption && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <h3 className="font-semibold mb-3">Caption</h3>
          <p className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap leading-relaxed">{item.caption}</p>
        </div>
      )}
    </div>
  )
}
