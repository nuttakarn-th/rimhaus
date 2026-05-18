"use client"

import { JOB_STATUS_LABELS, JOB_STATUSES } from "@/lib/constants"
import type { JobStatus } from "@/lib/types"
import { updateJobStatus } from "@/actions/jobs.actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface StatusStepperProps {
  jobId: string
  currentStatus: JobStatus
}

export function StatusStepper({ jobId, currentStatus }: StatusStepperProps) {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus)

  async function handleAdvance() {
    const nextStatus = JOB_STATUSES[currentIndex + 1]
    if (!nextStatus) return
    const result = await updateJobStatus(jobId, nextStatus)
    if (result.success) {
      toast.success(`อัปเดตสถานะเป็น "${JOB_STATUS_LABELS[nextStatus]}"`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Steps */}
      <div className="flex items-center gap-0">
        {JOB_STATUSES.map((status, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const isLast = i === JOB_STATUSES.length - 1
          return (
            <div key={status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  done ? "bg-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] text-white" :
                  active ? "bg-white border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)]" :
                  "bg-white border-gray-200 text-gray-300"
                )}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-xs mt-1 text-center whitespace-nowrap",
                  active ? "text-[hsl(24,85%,50%)] font-medium" :
                  done ? "text-[hsl(25,20%,35%)]" : "text-gray-300"
                )}>
                  {JOB_STATUS_LABELS[status]}
                </span>
              </div>
              {!isLast && (
                <div className={cn("flex-1 h-0.5 mb-5 mx-1", done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200")} />
              )}
            </div>
          )
        })}
      </div>

      {/* Advance button */}
      {currentStatus !== "closed" && (
        <button
          onClick={handleAdvance}
          className="text-sm px-4 py-2 bg-[hsl(24,85%,50%)] text-white rounded-lg hover:bg-[hsl(24,85%,42%)] transition-colors font-medium"
        >
          ก้าวไปขั้นถัดไป →
        </button>
      )}
    </div>
  )
}
