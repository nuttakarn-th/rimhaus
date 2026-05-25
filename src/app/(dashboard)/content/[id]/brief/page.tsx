import { notFound } from "next/navigation"
import Link from "next/link"
import { getContentItem } from "@/actions/content.actions"
import { CONTENT_TYPES } from "@/lib/constants"
import { formatDateThai } from "@/lib/utils"
import { PrintBriefButton } from "@/components/content/PrintBriefButton"

const VIDEO_TYPES = ["short_video", "long_video", "story", "reel"]

export default async function ContentBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getContentItem(id)
  if (!item) notFound()

  const typeLabel = CONTENT_TYPES.find(t => t.value === item.content_type)?.label ?? item.content_type
  const isVideo = VIDEO_TYPES.includes(item.content_type)
  const isPhoto = item.content_type === "photo"

  return (
    <div className="min-h-screen bg-[hsl(35,30%,97%)] print:min-h-0 print:bg-white">
      {/* Controls — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-[hsl(35,20%,88%)] px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/content/${id}`} className="text-sm text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)] transition-colors">
            ← กลับ
          </Link>
          <span className="text-[hsl(35,20%,80%)]">|</span>
          <span className="text-sm font-semibold text-[hsl(25,20%,15%)] truncate max-w-xs">{item.title}</span>
        </div>
        <PrintBriefButton />
      </div>

      {/* A4 Brief document */}
      <div className="p-4 md:p-8 print:p-0">
        <div className="bg-white max-w-[794px] mx-auto shadow-sm print:shadow-none print:max-w-none print:m-0 rounded-lg overflow-hidden print:overflow-visible print:rounded-none">
          {/* Header */}
          <div className="bg-[hsl(25,20%,15%)] text-white px-8 py-6 print:px-8 print:py-6">
            <p className="text-xs text-[hsl(35,20%,70%)] uppercase tracking-widest mb-1">Content Brief</p>
            <h1 className="text-xl font-bold leading-snug">{item.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-[hsl(35,20%,75%)] flex-wrap">
              <span>{typeLabel}</span>
              {item.planned_date && <span>วางแผนโพส: {formatDateThai(item.planned_date)}</span>}
              {item.platforms.length > 0 && <span>{item.platforms.join(", ")}</span>}
              {item.is_sponsored && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Sponsored</span>}
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 print:px-8 print:py-6 space-y-6">
            {item.idea_notes && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,10%,55%)] mb-2">ไอเดีย / โน้ต</h2>
                <p className="text-sm text-[hsl(25,20%,20%)] whitespace-pre-wrap leading-relaxed">{item.idea_notes}</p>
              </div>
            )}

            {/* VIDEO: Story + Scene */}
            {isVideo && item.script && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,10%,55%)] mb-2">Story + Scene</h2>
                <div
                  className="brief-print text-sm text-[hsl(25,20%,15%)]"
                  dangerouslySetInnerHTML={{ __html: item.script }}
                />
              </div>
            )}

            {/* PHOTO: Image grid */}
            {isPhoto && item.images && item.images.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,10%,55%)] mb-3">ภาพ Draft ({item.images.length} ภาพ)</h2>
                <div className="grid grid-cols-5 gap-1.5">
                  {item.images.map((src, i) => (
                    <div key={i} className="bg-[hsl(35,20%,94%)] rounded-sm overflow-hidden flex items-center justify-center aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`ภาพที่ ${i + 1}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLOG: single script */}
            {!isVideo && !isPhoto && item.script && (
              <div>
                <div
                  className="brief-print text-sm text-[hsl(25,20%,15%)]"
                  dangerouslySetInnerHTML={{ __html: item.script }}
                />
              </div>
            )}

            {/* Caption (Video + Photo) */}
            {(isVideo || isPhoto) && item.caption && (
              <div className="pt-4 border-t border-[hsl(35,20%,88%)]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,10%,55%)] mb-2">Caption</h2>
                <p className="text-sm text-[hsl(25,20%,20%)] whitespace-pre-wrap leading-relaxed">{item.caption}</p>
              </div>
            )}

            {item.hashtags && (
              <div className="pt-4 border-t border-[hsl(35,20%,88%)]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(25,10%,55%)] mb-2">Hashtags</h2>
                <p className="text-sm text-[hsl(24,85%,50%)]">{item.hashtags}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[hsl(35,20%,88%)] flex items-center justify-between text-xs text-[hsl(25,10%,60%)]">
            <span>Rimhaus — Content Brief</span>
            <span>{new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
