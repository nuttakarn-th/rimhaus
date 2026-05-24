"use client"

import { useState } from "react"
import { updatePaymentStatus } from "@/actions/jobs.actions"
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PaymentStatus } from "@/lib/types"

const STATUS_OPTIONS: PaymentStatus[] = ["pending", "invoiced", "received"]

export function PaymentStatusUpdater({ jobId, current }: { jobId: string; current: PaymentStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSelect(status: PaymentStatus) {
    if (status === current) { setOpen(false); return }
    setLoading(true)
    setOpen(false)
    const result = await updatePaymentStatus(jobId, status)
    setLoading(false)
    if (result.success) {
      toast.success(`สถานะการเงิน: ${PAYMENT_STATUS_LABELS[status]}`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${PAYMENT_STATUS_COLORS[current]}`}
      >
        {loading ? "..." : PAYMENT_STATUS_LABELS[current]} ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[hsl(35,20%,88%)] rounded-lg shadow-lg py-1 min-w-[130px]">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[hsl(35,30%,97%)] transition-colors flex items-center gap-2 ${s === current ? "font-semibold" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${s === current ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200"}`} />
                {PAYMENT_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
