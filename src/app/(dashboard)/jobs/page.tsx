import Link from "next/link"
import { getJobs } from "@/actions/jobs.actions"
import { JobStatusBadge, PaymentStatusBadge } from "@/components/jobs/JobStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { REVIEW_TYPE_LABELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const jobs = await getJobs({ status: params.status, search: params.search })

  const statuses = [
    { value: "all", label: "ทั้งหมด" },
    { value: "accepted", label: "รับงาน" },
    { value: "in_progress", label: "กำลังทำ" },
    { value: "content_done", label: "เนื้อหาเสร็จ" },
    { value: "posted", label: "โพสแล้ว" },
    { value: "closed", label: "ปิดงาน" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">งานรีวิว</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-1">จัดการงานรีวิวสินค้าจากแบรนด์</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            เพิ่มงานใหม่
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/jobs" : `/jobs?status=${s.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (params.status ?? "all") === s.value
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[hsl(25,10%,50%)]">ไม่มีงานรีวิว</p>
            <Link href="/jobs/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm">สร้างงานแรก</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[hsl(35,25%,95%)] text-[hsl(25,10%,50%)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">แบรนด์ / สินค้า</th>
                <th className="text-left px-4 py-3 font-medium">ประเภท</th>
                <th className="text-left px-4 py-3 font-medium">กำหนดส่ง</th>
                <th className="text-right px-4 py-3 font-medium">ค่าจ้าง</th>
                <th className="text-left px-4 py-3 font-medium">การเงิน</th>
                <th className="text-left px-4 py-3 font-medium">สถานะงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(35,20%,92%)]">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-[hsl(35,25%,97%)] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="hover:underline">
                      <p className="font-medium text-[hsl(25,20%,15%)]">{job.brand_name}</p>
                      <p className="text-xs text-[hsl(25,10%,50%)]">{job.product_name}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[hsl(25,20%,35%)]">
                    {REVIEW_TYPE_LABELS[job.review_type]}
                  </td>
                  <td className="px-4 py-3 text-[hsl(25,20%,35%)]">
                    {job.deadline ? formatDate(job.deadline) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[hsl(25,20%,15%)]">
                    {formatCurrency(job.payment_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={job.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
