"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { ContentItem } from "@/lib/types"
import { getEventsForDate, CONTENT_CATEGORIES, CONTENT_TYPE_LABELS, DAY_SUGGESTIONS } from "@/lib/seasonal-events"
import Link from "next/link"

const THAI_DOW_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
const THAI_MONTHS_SHORT = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

const STATUS_BADGE: Record<string, string> = {
  idea:      "bg-gray-100 text-gray-600",
  scripting: "bg-blue-100 text-blue-700",
  shooting:  "bg-yellow-100 text-yellow-700",
  editing:   "bg-purple-100 text-purple-700",
  ready:     "bg-green-100 text-green-700",
  posted:    "bg-[hsl(24,85%,92%)] text-[hsl(24,85%,40%)]",
  cancelled: "bg-red-100 text-red-600",
}
const STATUS_LABEL: Record<string, string> = {
  idea: "ไอเดีย", scripting: "เขียน Script", shooting: "ถ่าย", editing: "ตัดต่อ",
  ready: "พร้อม", posted: "โพสแล้ว", cancelled: "ยกเลิก",
}

interface Props {
  contentItems: ContentItem[]
  weekOffset: number
  onWeekChange: (dir: 1 | -1) => void
  onDayClick: (date: string) => void
}

function getWeekDays(weekOffset: number): Date[] {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function WeeklyBoard({ contentItems, weekOffset, onWeekChange, onDayClick }: Props) {
  const days = useMemo(() => getWeekDays(weekOffset), [weekOffset])
  const today = new Date()
  const todayStr = toDateStr(today)

  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentItem[]> = {}
    for (const item of contentItems) {
      if (!item.planned_date) continue
      const key = item.planned_date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return map
  }, [contentItems])

  const weekLabel = (() => {
    const start = days[0]
    const end = days[6]
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${THAI_MONTHS_SHORT[end.getMonth() + 1]} ${end.getFullYear() + 543}`
    }
    return `${start.getDate()} ${THAI_MONTHS_SHORT[start.getMonth() + 1]} – ${end.getDate()} ${THAI_MONTHS_SHORT[end.getMonth() + 1]} ${end.getFullYear() + 543}`
  })()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(-1)}
          className="p-2 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[hsl(25,10%,45%)]" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)] text-sm">{weekLabel}</p>
          {weekOffset === 0 && <p className="text-[10px] text-[hsl(24,85%,50%)]">สัปดาห์ปัจจุบัน</p>}
        </div>
        <button
          onClick={() => onWeekChange(1)}
          className="p-2 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[hsl(25,10%,45%)]" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = toDateStr(day)
          const isToday = dateStr === todayStr
          const dow = day.getDay()
          const events = getEventsForDate(day.getMonth() + 1, day.getDate())
          const items = itemsByDate[dateStr] ?? []
          const suggestion = DAY_SUGGESTIONS[dow]
          const postedCount = items.filter(i => i.status === "posted").length

          return (
            <div key={dateStr} className="flex flex-col">
              {/* Day header */}
              <div className={`rounded-xl p-2 text-center mb-2 ${isToday ? "bg-[hsl(24,85%,50%)]" : "bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)]"}`}>
                <div className={`text-[10px] font-bold ${isToday ? "text-white/80" : "text-[hsl(25,10%,50%)]"}`}>
                  {THAI_DOW_SHORT[dow]}
                </div>
                <div className={`text-sm font-bold ${isToday ? "text-white" : "text-[hsl(25,20%,20%)] dark:text-[hsl(35,15%,80%)]"}`}>
                  {day.getDate()}
                </div>
                {events.length > 0 && (
                  <div className="mt-0.5 text-[10px]" title={events.map(e => e.name).join(", ")}>
                    {events[0].emoji}
                  </div>
                )}
              </div>

              {/* Suggestion */}
              <div className={`text-[9px] font-medium mb-2 text-center leading-tight ${suggestion.color}`}>
                {suggestion.label}
              </div>

              {/* Content cards */}
              <div className="flex-1 space-y-1.5 min-h-[120px]">
                {items.map(item => {
                  const cat = item.content_category ? CONTENT_CATEGORIES[item.content_category as keyof typeof CONTENT_CATEGORIES] : null
                  const typeInfo = CONTENT_TYPE_LABELS[item.content_type] ?? { emoji: "📌", label: item.content_type }
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,22%)] bg-white dark:bg-[hsl(25,12%,16%)] p-1.5"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px]">{typeInfo.emoji}</span>
                        {cat && <span className="text-[9px]">{cat.emoji}</span>}
                      </div>
                      <p className="text-[10px] font-medium text-[hsl(25,20%,20%)] dark:text-[hsl(35,15%,80%)] leading-tight line-clamp-2">
                        {item.title}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Footer: count + add */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] text-[hsl(25,10%,55%)]">{postedCount}/{items.length} โพส</span>
                <button
                  onClick={() => onDayClick(dateStr)}
                  className="flex items-center gap-0.5 text-[10px] text-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,40%)] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  เพิ่ม
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-4 p-3 rounded-xl bg-[hsl(35,25%,96%)] dark:bg-[hsl(25,12%,17%)] flex items-center gap-4 text-xs text-[hsl(25,10%,45%)]">
        <span>สัปดาห์นี้:</span>
        {Object.entries(STATUS_LABEL).map(([status, label]) => {
          const count = days.reduce((sum, day) => {
            const items = itemsByDate[toDateStr(day)] ?? []
            return sum + items.filter(i => i.status === status).length
          }, 0)
          if (count === 0) return null
          return (
            <span key={status} className={`px-2 py-0.5 rounded-full text-[10px] ${STATUS_BADGE[status]}`}>
              {label}: {count}
            </span>
          )
        })}
      </div>
    </div>
  )
}
