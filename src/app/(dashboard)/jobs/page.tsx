import Link from "next/link"
import { getJobs } from "@/actions/jobs.actions"
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DEAL_TYPE_LABELS, DEAL_TYPE_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { PlatformChip } from "@/components/ui/PlatformIcon"
import { Plus, ClipboardList } from "lucide-react"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const jobs = await getJobs({ status: params.status, search: params.search })

  const statuses = [
    { value: "all",           label: "ทั้งหมด" },
    { value: "lead",          label: "🌱 Lead" },
    { value: "contacted",     label: "ติดต่อแล้ว" },
    { value: "in_production", label: "ผลิตอยู่" },
    { value: "draft_sent",    label: "ส่ง Draft" },
    { value: "approved",      label: "อนุมัติแล้ว" },
    { value: "posted",        label: "โพสแล้ว" },
    { value: "closed",        label: "ปิดงาน" },
  ]

  const active = params.status ?? "all"

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[hsl(25,20%,15%)]">งานรีวิว</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">จัดการงานรีวิวสินค้าจากแบรนด์</p>
        </div>
        <Link href="/jobs/new">
          <Button className="rounded-xl shadow-sm">
            <Plus className="w-4 h-4 mr-1" />เพิ่มงานใหม่
          </Button>
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/jobs" : `/jobs?status=${s.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              active === s.value
                ? "bg-[hsl(24,85%,50%)] text-white shadow-sm scale-105"
                : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Job cards */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="ยังไม่มีงานรีวิว"
          description="เพิ่มงานแรกเพื่อเริ่มจัดการ review jobs จากแบรนด์"
          action={{ label: "สร้างงานแรก", href: "/jobs/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {jobs.map(job => {
            const dealType = job.deal_type ?? "paid_keep"
            const isCash = dealType === "paid_keep" || dealType === "paid_return"
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4 hover:border-[hsl(24,85%,55%)] hover:shadow-md transition-all h-full flex flex-col gap-3">

                  {/* Top row: brand + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[hsl(25,20%,12%)] leading-tight truncate">{job.brand_name}</p>
                      <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5 truncate">{job.product_name}</p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${DEAL_TYPE_COLORS[dealType]}`}>
                      {DEAL_TYPE_LABELS[dealType]}
                    </span>
                    {job.platforms.slice(0, 3).map(p => (
                      <PlatformChip key={p} platform={p} size="xs" showLabel={false} />
                    ))}
                  </div>

                  {/* Bottom row: amount + deadline */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[hsl(35,25%,93%)]">
                    <span className={`text-sm font-black ${isCash ? "text-[hsl(24,85%,50%)]" : "text-violet-600"}`}>
                      {isCash ? formatCurrency(job.payment_amount) : `มูลค่า ${formatCurrency(job.product_value ?? 0)}`}
                    </span>
                    {job.deadline && (
                      <span className="text-[11px] text-[hsl(25,10%,55%)]">
                        📅 {formatDate(job.deadline)}
                      </span>
                    )}
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
