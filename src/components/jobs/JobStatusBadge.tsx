import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/constants"
import type { JobStatus, PaymentStatus } from "@/lib/types"

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_STATUS_COLORS[status]}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAYMENT_STATUS_COLORS[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}
