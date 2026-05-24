import { notFound } from "next/navigation"
import Link from "next/link"
import { getJob } from "@/actions/jobs.actions"
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge"
import { StatusStepper } from "@/components/jobs/StatusStepper"
import { AdvanceStatusButton } from "@/components/jobs/AdvanceStatusButton"
import { PaymentStatusUpdater } from "@/components/jobs/PaymentStatusUpdater"
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { REVIEW_TYPE_LABELS, DEAL_TYPE_LABELS, DEAL_TYPE_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok",
  youtube: "YouTube", lemon8: "Lemon8", shopee: "Shopee",
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()

  const isBarter = job.deal_type === "barter_inbound" || job.deal_type === "barter_outbound"
  const dealType = job.deal_type ?? "paid"

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">{job.brand_name}</h1>
            <JobStatusBadge status={job.status} />
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEAL_TYPE_COLORS[dealType]}`}>
              {DEAL_TYPE_LABELS[dealType]}
            </span>
          </div>
          <p className="text-[hsl(25,10%,50%)] mt-1">{job.product_name}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/jobs/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-3.5 h-3.5 mr-1" />แก้ไข
            </Button>
          </Link>
          <DeleteJobButton jobId={id} />
        </div>
      </div>

      {/* Status progress */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] mb-4">ความคืบหน้า</h3>
        <StatusStepper currentStatus={job.status} />
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] mb-4">รายละเอียดงาน</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-[hsl(25,10%,50%)]">ประเภทรีวิว</dt>
            <dd className="font-medium mt-0.5">{REVIEW_TYPE_LABELS[job.review_type]}</dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">หมวดหมู่สินค้า</dt>
            <dd className="font-medium mt-0.5">{job.product_category ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">แพลตฟอร์ม</dt>
            <dd className="font-medium mt-0.5">{job.platforms.map(p => PLATFORM_LABELS[p] ?? p).join(", ")}</dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">กำหนดส่งงาน</dt>
            <dd className="font-medium mt-0.5">{job.deadline ? formatDate(job.deadline) : "-"}</dd>
          </div>

          {!isBarter && (
            <>
              <div>
                <dt className="text-[hsl(25,10%,50%)]">ค่าจ้าง</dt>
                <dd className="font-semibold text-[hsl(24,85%,50%)] mt-0.5 text-base">{formatCurrency(job.payment_amount)}</dd>
              </div>
              <div>
                <dt className="text-[hsl(25,10%,50%)]">สถานะการเงิน</dt>
                <dd className="mt-1.5">
                  <PaymentStatusUpdater jobId={id} current={job.payment_status} />
                </dd>
              </div>
            </>
          )}

          <div>
            <dt className="text-[hsl(25,10%,50%)]">ได้รับสินค้า</dt>
            <dd className="font-medium mt-0.5">{job.product_received ? "✅ ได้รับแล้ว" : "❌ ยังไม่ได้รับ"}</dd>
          </div>
          {job.product_value != null && (
            <div>
              <dt className="text-[hsl(25,10%,50%)]">{isBarter ? "มูลค่า Barter" : "มูลค่าสินค้า"}</dt>
              <dd className={`font-semibold mt-0.5 text-base ${isBarter ? "text-violet-600" : "text-[hsl(25,20%,25%)]"}`}>
                {formatCurrency(job.product_value)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-[hsl(25,10%,50%)]">สร้างเมื่อ</dt>
            <dd className="font-medium mt-0.5">{formatDate(job.created_at)}</dd>
          </div>
        </dl>
        {job.notes && (
          <div className="mt-4 pt-4 border-t border-[hsl(35,20%,88%)]">
            <dt className="text-[hsl(25,10%,50%)] text-sm mb-1">หมายเหตุ</dt>
            <dd className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap">{job.notes}</dd>
          </div>
        )}
      </div>

      {/* Bottom status advance CTA */}
      {job.status !== "closed" && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-4 flex items-center justify-between gap-4">
          <div className="text-sm text-[hsl(25,10%,50%)]">
            สถานะปัจจุบัน: <span className="font-semibold text-[hsl(25,20%,15%)]">
              <JobStatusBadge status={job.status} />
            </span>
          </div>
          <AdvanceStatusButton jobId={id} currentStatus={job.status} />
        </div>
      )}
    </div>
  )
}
