"use client"

import { useState } from "react"
import { CalendarDays, LayoutGrid, RefreshCw } from "lucide-react"
import type { ContentItem, ReviewJob } from "@/lib/types"
import { MonthlyCalendar } from "./MonthlyCalendar"
import { WeeklyBoard } from "./WeeklyBoard"
import { RepurposeQueue } from "./RepurposeQueue"
import { CreateContentModal } from "./CreateContentModal"
import { getUpcomingEvents } from "@/lib/seasonal-events"

type Tab = "calendar" | "weekly" | "repurpose"

interface Props {
  contentItems: ContentItem[]
  jobs: ReviewJob[]
}

export function ContentPlannerClient({ contentItems, jobs }: Props) {
  const [tab, setTab] = useState<Tab>("weekly")

  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1)
  const [weekOffset, setWeekOffset] = useState(0)

  const [modal, setModal] = useState<{ defaultDate?: string; defaultJobId?: string; defaultCategory?: string } | null>(null)

  function handleMonthChange(dir: 1 | -1) {
    setCalMonth(prev => {
      let m = prev + dir
      let y = calYear
      if (m > 12) { m = 1; y++ }
      if (m < 1)  { m = 12; y-- }
      setCalYear(y)
      return m
    })
  }

  function openModal(opts: { defaultDate?: string; defaultJobId?: string; defaultCategory?: string } = {}) {
    setModal(opts)
  }

  const upcoming = getUpcomingEvents(7)

  return (
    <div className="space-y-4">
      {/* Upcoming events banner */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,22%)] bg-[hsl(35,40%,97%)] dark:bg-[hsl(25,12%,17%)] px-4 py-3 flex items-start gap-3">
          <span className="text-lg">📅</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[hsl(25,20%,30%)] dark:text-[hsl(35,20%,75%)] mb-1">Event ใกล้มาถึง (7 วัน)</p>
            <div className="flex flex-wrap gap-2">
              {upcoming.map(({ event, date }) => (
                <span
                  key={event.id}
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${event.colorClass}`}
                >
                  {event.emoji} {event.name} ({date.getDate()}/{date.getMonth() + 1})
                </span>
              ))}
            </div>
            {upcoming[0]?.event.tips.length > 0 && (
              <p className="text-[10px] text-[hsl(25,10%,50%)] mt-1.5">
                💡 {upcoming[0].event.tips.join(" · ")}
              </p>
            )}
          </div>
          <button
            onClick={() => openModal({ defaultCategory: "seasonal_sell" })}
            className="shrink-0 text-[10px] bg-[hsl(24,85%,50%)] text-white px-2.5 py-1 rounded-lg hover:bg-[hsl(24,85%,45%)] transition-colors whitespace-nowrap"
          >
            + เพิ่ม Content
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)] rounded-xl p-1">
        {([
          { key: "weekly",    label: "สัปดาห์นี้", labelShort: "สัปดาห์", icon: LayoutGrid },
          { key: "calendar",  label: "ปฏิทิน",    labelShort: "ปฏิทิน",   icon: CalendarDays },
          { key: "repurpose", label: "Repurpose",  labelShort: "Reuse",    icon: RefreshCw },
        ] as const).map(({ key, label, labelShort, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === key
                ? "bg-white dark:bg-[hsl(25,12%,14%)] text-[hsl(24,85%,50%)] shadow-sm"
                : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,25%)] dark:hover:text-[hsl(35,15%,70%)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{labelShort}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-[hsl(25,12%,14%)] rounded-2xl border border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)] p-4">
        {tab === "calendar" && (
          <MonthlyCalendar
            contentItems={contentItems}
            year={calYear}
            month={calMonth}
            onMonthChange={handleMonthChange}
            onDayClick={date => openModal({ defaultDate: date })}
          />
        )}
        {tab === "weekly" && (
          <WeeklyBoard
            contentItems={contentItems}
            weekOffset={weekOffset}
            onWeekChange={dir => setWeekOffset(p => p + dir)}
            onDayClick={date => openModal({ defaultDate: date })}
          />
        )}
        {tab === "repurpose" && (
          <RepurposeQueue
            jobs={jobs}
            contentItems={contentItems}
            onRepurpose={(jobId, brand, product) =>
              openModal({ defaultJobId: jobId, defaultCategory: "repurpose" })
            }
          />
        )}
      </div>

      {/* Create modal */}
      {modal && (
        <CreateContentModal
          onClose={() => setModal(null)}
          defaultDate={modal.defaultDate}
          defaultJobId={modal.defaultJobId}
          defaultCategory={modal.defaultCategory}
          jobs={jobs}
        />
      )}
    </div>
  )
}
