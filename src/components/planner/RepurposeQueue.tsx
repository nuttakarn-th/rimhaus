"use client"

import { useMemo } from "react"
import { AlertCircle, CheckCircle2, Plus, ExternalLink } from "lucide-react"
import type { ContentItem, ReviewJob } from "@/lib/types"
import Link from "next/link"
import { CONTENT_CATEGORIES } from "@/lib/seasonal-events"

const COMPLETED_STATUSES = new Set(["posted", "invoiced", "paid", "closed", "approved", "scheduled"])

interface Props {
  jobs: ReviewJob[]
  contentItems: ContentItem[]
  onRepurpose: (jobId: string, brand: string, product: string) => void
}

interface JobWithContent {
  job: ReviewJob
  items: ContentItem[]
}

export function RepurposeQueue({ jobs, contentItems, onRepurpose }: Props) {
  const { needsRepurpose, done } = useMemo(() => {
    const completedJobs = jobs.filter(j => COMPLETED_STATUSES.has(j.status))
    const byJob: Record<string, ContentItem[]> = {}
    for (const item of contentItems) {
      if (!item.review_job_id) continue
      if (!byJob[item.review_job_id]) byJob[item.review_job_id] = []
      byJob[item.review_job_id].push(item)
    }
    const needsRepurpose: JobWithContent[] = []
    const done: JobWithContent[] = []
    for (const job of completedJobs) {
      const items = byJob[job.id] ?? []
      if (items.length < 2) needsRepurpose.push({ job, items })
      else done.push({ job, items })
    }
    return { needsRepurpose, done }
  }, [jobs, contentItems])

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
  }

  const DEAL_LABEL: Record<string, string> = {
    paid_keep: "จ้าง (เก็บ)", paid_return: "จ้าง (คืน)", barter: "Barter", gifted_self: "ของขวัญ", gifted_brand: "ส่งให้"
  }

  return (
    <div className="space-y-6">
      {/* Needs Repurpose */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">
            ยังไม่ได้ Repurpose
          </h3>
          {needsRepurpose.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {needsRepurpose.length} งาน
            </span>
          )}
        </div>

        {needsRepurpose.length === 0 ? (
          <p className="text-sm text-[hsl(25,10%,55%)] py-6 text-center">ดีมาก! ทุกงานทำ Repurpose แล้ว 🎉</p>
        ) : (
          <div className="space-y-3">
            {needsRepurpose.map(({ job, items }) => (
              <div key={job.id} className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">
                        {job.brand_name}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                        {DEAL_LABEL[job.deal_type] ?? job.deal_type}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(25,10%,45%)] mb-1 truncate">{job.product_name}</p>
                    <p className="text-[10px] text-[hsl(25,10%,55%)]">
                      โพสวันที่: {formatDate(job.post_date ?? job.scheduled_date)}
                    </p>

                    {/* Existing content items */}
                    {items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] font-medium text-[hsl(25,10%,45%)]">Content ที่มีอยู่ ({items.length}):</p>
                        {items.map(item => {
                          const cat = item.content_category ? CONTENT_CATEGORIES[item.content_category as keyof typeof CONTENT_CATEGORIES] : null
                          return (
                            <div key={item.id} className="text-[10px] flex items-center gap-1 text-[hsl(25,10%,50%)]">
                              <span>{cat?.emoji ?? "📌"}</span>
                              <span className="truncate">{item.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onRepurpose(job.id, job.brand_name, job.product_name)}
                      className="flex items-center gap-1 text-xs bg-[hsl(24,85%,50%)] text-white px-3 py-1.5 rounded-lg hover:bg-[hsl(24,85%,45%)] transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      Repurpose
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-1 text-[10px] text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors justify-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                      ดูงาน
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-[hsl(35,40%,96%)] dark:bg-[hsl(25,12%,17%)] p-4">
        <p className="text-xs font-semibold text-[hsl(25,20%,35%)] dark:text-[hsl(35,20%,70%)] mb-2">💡 ไอเดีย Repurpose จากงานรีวิว 1 ชิ้น</p>
        <ul className="space-y-1 text-[11px] text-[hsl(25,10%,45%)]">
          <li>🔄 ตัด Short VDO เวอร์ชั่นสั้น (จาก Long Review)</li>
          <li>📸 Carousel ภาพ Before/After หรือ Feature สำคัญ</li>
          <li>📅 30-day Follow-up — กลับมาเล่าหลังใช้จริง</li>
          <li>🔗 Affiliate โพสแนะนำ + ลิงก์ช่วง Sale</li>
          <li>💬 Q&A Story — ตอบคำถามจากโพสเดิม</li>
        </ul>
      </div>

      {/* Done section */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">
              Repurpose แล้ว ({done.length} งาน)
            </h3>
          </div>
          <div className="space-y-2">
            {done.map(({ job, items }) => (
              <div key={job.id} className="rounded-xl border border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,22%)] bg-white dark:bg-[hsl(25,12%,14%)] px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[hsl(25,20%,20%)] dark:text-[hsl(35,15%,80%)] truncate">{job.brand_name} – {job.product_name}</p>
                  <p className="text-[10px] text-[hsl(25,10%,55%)]">{items.length} content items</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
