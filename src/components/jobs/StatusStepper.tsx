"use client"

import { JOB_STATUS_LABELS, JOB_STATUSES } from "@/lib/constants"
import type { JobStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusStepperProps {
  currentStatus: JobStatus
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {JOB_STATUSES.map((status, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const isLast = i === JOB_STATUSES.length - 1
        return (
          <div key={status} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center shrink-0">
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
              <div className={cn("flex-1 h-0.5 mb-5 mx-1 min-w-2", done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200")} />
            )}
          </div>
        )
      })}
    </div>
  )
}
