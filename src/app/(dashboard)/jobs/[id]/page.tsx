import { notFound } from "next/navigation"
import Link from "next/link"
import { getJob } from "@/actions/jobs.actions"
import { getContentItems } from "@/actions/content.actions"
import { getPosts } from "@/actions/posts.actions"
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge"
import { StatusStepper } from "@/components/jobs/StatusStepper"
import { AdvanceStatusButton } from "@/components/jobs/AdvanceStatusButton"
import { PaymentStatusUpdater } from "@/components/jobs/PaymentStatusUpdater"
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { REVIEW_TYPE_LABELS, DEAL_TYPE_LABELS, DEAL_TYPE_COLORS, CONTENT_STATUS_LABELS, CONTENT_STATUS_COLORS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { PlatformChip, PLATFORM_LABELS, PLATFORM_CI as PLATFORM_COLORS } from "@/components/ui/PlatformIcon"
import { Pencil, Plus, ExternalLink, BarChart2 } from "lucide-react"
import type { ContentStatus } from "@/lib/types"

const POST_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  archived: "bg-[hsl(35,25%,92%)] text-[hsl(25,20%,40%)]",
}

const POST_STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง", scheduled: "กำหนดเวลา", posted: "โพสแล้ว", archived: "เก็บถาวร",
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [job, contentItems, posts] = await Promise.all([
    getJob(id),
    getContentItems({ review_job_id: id }),
    getPosts({ review_job_id: id }),
  ])
  if (!job) notFound()

  const isCash = job.deal_type === "paid_keep" || job.deal_type === "paid_return"
  const isBarter = !isCash
  const dealType = job.deal_type ?? "paid_keep"

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
            <dd className="mt-1 flex flex-wrap gap-1">
              {job.platforms.map(p => <PlatformChip key={p} platform={p} size="xs" />)}
            </dd>
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
              <dd className={`font-semibold mt-0.5 text-base ${isBarter ? "text-[hsl(35,60%,40%)]" : "text-[hsl(25,20%,25%)]"}`}>
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

      {/* Content Items linked to this job */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[hsl(25,20%,15%)]">คอนเทนต์ที่เกี่ยวข้อง</h3>
          <Link href={`/content/new?job=${id}`}>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />สร้างคอนเทนต์
            </Button>
          </Link>
        </div>

        {contentItems.length === 0 ? (
          <p className="text-sm text-[hsl(25,10%,55%)] text-center py-4">
            ยังไม่มีคอนเทนต์ที่ผูกกับงานนี้
          </p>
        ) : (
          <div className="space-y-2">
            {contentItems.map(item => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(35,25%,96%)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(25,20%,15%)] truncate group-hover:text-[hsl(24,85%,50%)]">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CONTENT_STATUS_COLORS[item.status as ContentStatus]}`}>
                      {CONTENT_STATUS_LABELS[item.status as ContentStatus]}
                    </span>
                    {item.planned_date && (
                      <span className="text-[11px] text-[hsl(25,10%,55%)]">
                        📅 {formatDate(item.planned_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.platforms.slice(0, 3).map(p => (
                    <PlatformChip key={p} platform={p} size="xs" showLabel={false} />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Social Posts linked to this job */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[hsl(25,20%,15%)]">โพสที่เกี่ยวข้อง</h3>
          <Link href={`/posts/new?job=${id}`}>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />บันทึกโพส
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-[hsl(25,10%,55%)] text-center py-4">
            ยังไม่มีโพสที่ผูกกับงานนี้
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map(post => {
              const hasMetrics = [post.views, post.likes, post.comments, post.shares].some(v => v != null)
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block p-3 rounded-lg border border-[hsl(35,20%,93%)] hover:border-[hsl(24,85%,50%)] hover:bg-orange-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PlatformChip platform={post.platform} size="xs" showLabel={false} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${POST_STATUS_COLORS[post.status]}`}>
                          {POST_STATUS_LABELS[post.status]}
                        </span>
                        {post.post_date && (
                          <span className="text-[11px] text-[hsl(25,10%,55%)]">
                            {formatDate(String(post.post_date))}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[hsl(25,20%,15%)] mt-1 truncate group-hover:text-[hsl(24,85%,50%)]">
                        {post.post_title}
                      </p>
                    </div>
                    {post.post_url && (
                      <ExternalLink className="w-3.5 h-3.5 text-[hsl(25,10%,55%)] shrink-0 mt-1" />
                    )}
                  </div>

                  {hasMetrics && (
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[hsl(35,20%,93%)]">
                      <BarChart2 className="w-3 h-3 text-[hsl(25,10%,55%)]" />
                      {post.views != null && (
                        <span className="text-xs text-[hsl(25,10%,50%)]">👁 {post.views.toLocaleString()}</span>
                      )}
                      {post.likes != null && (
                        <span className="text-xs text-[hsl(25,10%,50%)]">❤️ {post.likes.toLocaleString()}</span>
                      )}
                      {post.comments != null && (
                        <span className="text-xs text-[hsl(25,10%,50%)]">💬 {post.comments.toLocaleString()}</span>
                      )}
                      {post.shares != null && (
                        <span className="text-xs text-[hsl(25,10%,50%)]">↗ {post.shares.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom status advance CTA */}
      {job.status !== "closed" && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[hsl(25,10%,50%)]">
            <span>สถานะปัจจุบัน:</span>
            <JobStatusBadge status={job.status} />
          </div>
          <AdvanceStatusButton jobId={id} currentStatus={job.status} />
        </div>
      )}
    </div>
  )
}
