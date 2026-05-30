"use client"

import { JOB_STATUS_LABELS, JOB_STATUSES, JOB_STATUS_COLORS } from "@/lib/constants"
import type { JobStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusStepperProps {
  currentStatus: JobStatus
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus)
  const total = JOB_STATUSES.length
  const pct = Math.round((currentIndex / (total - 1)) * 100)

  return (
    <>
      {/* ─── MOBILE ──────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">

        {/* Progress bar + counter */}
        <div className="flex items-center justify-between text-xs text-[hsl(25,10%,55%)]">
          <span>ขั้นที่ {currentIndex + 1} / {total}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-[hsl(35,25%,91%)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(24,85%,50%)] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Mini dot track — scrollable */}
        <div className="flex items-center overflow-x-auto pb-0.5 gap-0 scrollbar-hide">
          {JOB_STATUSES.map((status, i) => {
            const done   = i < currentIndex
            const active = i === currentIndex
            const isLast = i === total - 1
            return (
              <div key={status} className="flex items-center shrink-0">
                <div className={cn(
                  "rounded-full flex items-center justify-center font-bold border-2 transition-all duration-200",
                  active
                    ? "w-7 h-7 text-[11px] bg-white border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)] ring-4 ring-orange-100"
                    : "w-5 h-5 text-[9px]",
                  done
                    ? "bg-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] text-white"
                    : !active
                    ? "bg-white border-gray-200 text-gray-300"
                    : ""
                )}>
                  {done ? "✓" : i + 1}
                </div>
                {!isLast && (
                  <div className={cn(
                    "h-0.5 w-3 shrink-0",
                    done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {/* Current step badge */}
        <span className={cn(
          "inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full",
          JOB_STATUS_COLORS[currentStatus]
        )}>
          {JOB_STATUS_LABELS[currentStatus]}
        </span>
      </div>

      {/* ─── DESKTOP ─────────────────────────────────────────── */}
      <div className="hidden md:flex items-start gap-0 overflow-x-auto pb-1">
        {JOB_STATUSES.map((status, i) => {
          const done   = i < currentIndex
          const active = i === currentIndex
          const isLast = i === total - 1
          return (
            <div key={status} className="flex items-center flex-1 last:flex-none min-w-0">
              <div className="flex flex-col items-center shrink-0 w-14">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  done   ? "bg-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] text-white" :
                  active ? "bg-white border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)]" :
                           "bg-white border-gray-200 text-gray-300"
                )}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-[10px] mt-1 text-center leading-tight break-words w-full",
                  active ? "text-[hsl(24,85%,50%)] font-semibold" :
                  done   ? "text-[hsl(25,20%,40%)]" :
                           "text-gray-300"
                )}>
                  {JOB_STATUS_LABELS[status]}
                </span>
              </div>
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mb-5 mx-0.5 min-w-1",
                  done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200"
                )} />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
