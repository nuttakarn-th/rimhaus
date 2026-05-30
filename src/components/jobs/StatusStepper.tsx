"use client"

import { JOB_STATUS_LABELS, JOB_STATUSES, JOB_STATUS_COLORS } from "@/lib/constants"
import type { JobStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface StatusStepperProps {
  currentStatus: JobStatus
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = JOB_STATUSES.indexOf(currentStatus)
  const total = JOB_STATUSES.length
  const pct = Math.round((currentIndex / (total - 1)) * 100)
  const nextStatus = currentIndex < total - 1 ? JOB_STATUSES[currentIndex + 1] : null

  return (
    <>
      {/* ─── MOBILE ──────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">

        {/* Progress bar */}
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

        {/* Dot track — ทุก step ไม่ scroll */}
        <div className="flex items-center w-full">
          {JOB_STATUSES.flatMap((status, i) => {
            const done   = i < currentIndex
            const active = i === currentIndex
            const isLast = i === total - 1
            return [
              <div
                key={`dot-${i}`}
                className={cn(
                  "shrink-0 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-200",
                  active ? "w-6 h-6 text-[10px]" : "w-[18px] h-[18px] text-[9px]",
                  done   ? "bg-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] text-white" :
                  active ? "bg-white border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)] ring-[3px] ring-orange-100" :
                           "bg-white border-gray-200 text-gray-300"
                )}
              >
                {done ? "✓" : i + 1}
              </div>,
              ...(!isLast ? [
                <div
                  key={`line-${i}`}
                  className={cn("flex-1 h-0.5 min-w-0", done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200")}
                />
              ] : []),
            ]
          })}
        </div>

        {/* Current step + next step */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full",
            JOB_STATUS_COLORS[currentStatus]
          )}>
            {JOB_STATUS_LABELS[currentStatus]}
          </span>
          {nextStatus && (
            <span className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
              <ChevronRight className="w-3 h-3 shrink-0" />
              ถัดไป: <span className="font-medium text-[hsl(25,20%,25%)]">{JOB_STATUS_LABELS[nextStatus]}</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── DESKTOP ─────────────────────────────────────────── */}
      <div className="hidden md:block space-y-3">
        {/* Dot track */}
        <div className="flex items-start w-full">
          {JOB_STATUSES.flatMap((status, i) => {
            const done   = i < currentIndex
            const active = i === currentIndex
            const isLast = i === total - 1
            return [
              <div key={`dot-${i}`} className="shrink-0 flex flex-col items-center w-12">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  done   ? "bg-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] text-white" :
                  active ? "bg-white border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)]" :
                           "bg-white border-gray-200 text-gray-300"
                )}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={cn(
                  "text-[9px] mt-1 text-center leading-tight break-words w-full",
                  active ? "text-[hsl(24,85%,50%)] font-semibold" :
                  done   ? "text-[hsl(25,20%,40%)]" : "text-gray-300"
                )}>
                  {JOB_STATUS_LABELS[status]}
                </span>
              </div>,
              ...(!isLast ? [
                <div
                  key={`line-${i}`}
                  className={cn("flex-1 h-0.5 mt-3.5 min-w-0", done ? "bg-[hsl(24,85%,50%)]" : "bg-gray-200")}
                />
              ] : []),
            ]
          })}
        </div>

        {/* Next step hint on desktop too */}
        {nextStatus && (
          <div className="flex items-center gap-1.5 text-xs text-[hsl(25,10%,50%)] pt-1 border-t border-[hsl(35,20%,92%)]">
            <ChevronRight className="w-3.5 h-3.5 text-[hsl(24,85%,50%)] shrink-0" />
            <span>ขั้นถัดไป:</span>
            <span className="font-semibold text-[hsl(25,20%,20%)]">{JOB_STATUS_LABELS[nextStatus]}</span>
          </div>
        )}
      </div>
    </>
  )
}
