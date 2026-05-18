import { notFound } from "next/navigation"
import Link from "next/link"
import { getContentItem, deleteContentItem } from "@/actions/content.actions"
import { CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS, CONTENT_TYPES } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { DeleteContentButton } from "@/components/content/DeleteContentButton"

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getContentItem(id)
  if (!item) notFound()

  const typeLabel = CONTENT_TYPES.find(t => t.value === item.content_type)?.label ?? item.content_type

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
        <div className="flex gap-2">
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

      {item.script && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <h3 className="font-semibold mb-3">สคริปต์</h3>
          <p className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap">{item.script}</p>
        </div>
      )}
    </div>
  )
}
