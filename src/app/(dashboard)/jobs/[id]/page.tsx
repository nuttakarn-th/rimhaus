import { notFound } from "next/navigation"
import Link from "next/link"
import { getJob } from "@/actions/jobs.actions"
import { JobStatusBadge, PaymentStatusBadge } from "@/components/jobs/JobStatusBadge"
import { StatusStepper } from "@/components/jobs/StatusStepper"
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { REVIEW_TYPE_LABELS } from "@/lib/constants"
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">{job.brand_name}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-[hsl(25,10%,50%)] mt-1">{job.product_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="w-3.5 h-3.5 mr-1" />
              แก้ไข
            </Button>
          </Link>
          <DeleteJobButton jobId={id} />
        </div>
      </div>

      {/* Status stepper */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] mb-4">ความคืบหน้า</h3>
        <StatusStepper jobId={id} currentStatus={job.status} />
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
          <div>
            <dt className="text-[hsl(25,10%,50%)]">ค่าจ้าง</dt>
            <dd className="font-semibold text-[hsl(24,85%,50%)] mt-0.5 text-base">{formatCurrency(job.payment_amount)}</dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">สถานะการรับเงิน</dt>
            <dd className="mt-0.5"><PaymentStatusBadge status={job.payment_status} /></dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">ได้รับสินค้า</dt>
            <dd className="font-medium mt-0.5">{job.product_received ? "✅ ได้รับแล้ว" : "❌ ยังไม่ได้รับ"}</dd>
          </div>
          {job.product_value && (
            <div>
              <dt className="text-[hsl(25,10%,50%)]">มูลค่าสินค้า</dt>
              <dd className="font-medium mt-0.5">{formatCurrency(job.product_value)}</dd>
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
    </div>
  )
}
