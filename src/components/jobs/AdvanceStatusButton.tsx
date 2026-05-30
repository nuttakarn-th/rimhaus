"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateJobStatus } from "@/actions/jobs.actions"
import { JOB_STATUS_LABELS, JOB_STATUSES } from "@/lib/constants"
import { toast } from "sonner"
import { ChevronRight } from "lucide-react"
import type { JobStatus } from "@/lib/types"

export function AdvanceStatusButton({ jobId, currentStatus }: { jobId: string; currentStatus: JobStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const currentIndex = JOB_STATUSES.indexOf(currentStatus)
  const nextStatus = JOB_STATUSES[currentIndex + 1] as JobStatus | undefined

  if (!nextStatus) return null

  async function handleAdvance() {
    if (!nextStatus) return
    setLoading(true)
    const result = await updateJobStatus(jobId, nextStatus)
    setLoading(false)
    if (result.success) {
      toast.success(`อัปเดตสถานะเป็น "${JOB_STATUS_LABELS[nextStatus]}"`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <button
      onClick={handleAdvance}
      disabled={loading}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[hsl(24,85%,50%)] text-white rounded-xl hover:bg-[hsl(24,85%,42%)] active:scale-95 transition-all font-medium text-sm disabled:opacity-60 shadow-sm whitespace-nowrap"
    >
      <ChevronRight className="w-4 h-4 shrink-0" />
      {loading ? "กำลังอัปเดต..." : (
        <>
          <span className="sm:hidden">→ {JOB_STATUS_LABELS[nextStatus]}</span>
          <span className="hidden sm:inline">ก้าวไปขั้นถัดไป: {JOB_STATUS_LABELS[nextStatus]}</span>
        </>
      )}
    </button>
  )
}
