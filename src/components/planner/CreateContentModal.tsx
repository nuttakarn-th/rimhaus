"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { createContentItem } from "@/actions/content.actions"
import type { ReviewJob } from "@/lib/types"
import { CONTENT_CATEGORIES } from "@/lib/seasonal-events"
import { useRouter } from "next/navigation"

interface Props {
  onClose: () => void
  defaultDate?: string
  defaultJobId?: string
  defaultCategory?: string
  jobs: ReviewJob[]
}

const CONTENT_TYPES = [
  { value: "photo",       label: "📸 ภาพ" },
  { value: "short_video", label: "🎬 VDO สั้น" },
  { value: "reel",        label: "▶️ Reel" },
  { value: "story",       label: "⭕ Story" },
  { value: "long_video",  label: "🎥 VDO ยาว" },
]

export function CreateContentModal({ onClose, defaultDate, defaultJobId, defaultCategory, jobs }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [contentType, setContentType] = useState("photo")
  const [category, setCategory] = useState(defaultCategory ?? "")
  const [plannedDate, setPlannedDate] = useState(defaultDate ?? "")
  const [jobId, setJobId] = useState(defaultJobId ?? "")
  const [ideaNotes, setIdeaNotes] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("กรุณาใส่ชื่อ Content"); return }
    setError(null)
    startTransition(async () => {
      const res = await createContentItem({
        title: title.trim(),
        content_type: contentType,
        content_category: category || null,
        planned_date: plannedDate || null,
        review_job_id: jobId || null,
        idea_notes: ideaNotes || undefined,
        platforms: [],
        status: "idea",
        is_sponsored: !!jobId,
      })
      if (!res.success) { setError(res.error ?? "เกิดข้อผิดพลาด"); return }
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-[hsl(25,15%,13%)] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)]">
          <h2 className="font-semibold text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">เพิ่ม Content ใหม่</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors">
            <X className="w-4 h-4 text-[hsl(25,10%,50%)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">ชื่อ Content *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="เช่น รีวิวโซฟาใหม่จาก INDEX"
              className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)] focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">ประเภท</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)]"
              >
                {CONTENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">หมวดหมู่</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)]"
              >
                <option value="">-- เลือกหมวด --</option>
                {Object.entries(CONTENT_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">วันที่วางแผนโพส</label>
            <input
              type="date"
              value={plannedDate}
              onChange={e => setPlannedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)]"
            />
          </div>

          {jobs.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">เชื่อมกับงานรีวิว (ถ้ามี)</label>
              <select
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)]"
              >
                <option value="">-- ไม่เชื่อม --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.brand_name} – {j.product_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[hsl(25,10%,45%)] mb-1">Idea / โน้ต</label>
            <textarea
              value={ideaNotes}
              onChange={e => setIdeaNotes(e.target.value)}
              placeholder="จดไอเดียคร่าวๆ..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] bg-white dark:bg-[hsl(25,12%,18%)] text-sm text-foreground focus:outline-none focus:border-[hsl(24,85%,50%)] resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[hsl(35,20%,82%)] text-sm text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,92%)] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 px-4 py-2 rounded-lg bg-[hsl(24,85%,50%)] text-white text-sm font-medium hover:bg-[hsl(24,85%,45%)] transition-colors disabled:opacity-60"
            >
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
