"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { ContentItem } from "@/lib/types"
import { getEventsForDate, CONTENT_CATEGORIES } from "@/lib/seasonal-events"

const THAI_MONTHS = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
const THAI_MONTHS_FULL = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
const DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

interface Props {
  contentItems: ContentItem[]
  year: number
  month: number
  onMonthChange: (dir: 1 | -1) => void
  onDayClick: (date: string) => void
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

export function MonthlyCalendar({ contentItems, year, month, onMonthChange, onDayClick }: Props) {
  const today = new Date()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const { cells } = useMemo(() => {
    const firstDow = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells: Array<number | null> = [
      ...Array(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length % 7 !== 0) cells.push(null)
    return { cells }
  }, [year, month])

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

  const thaiYear = year + 543

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[hsl(25,10%,45%)]" />
        </button>
        <h2 className="font-semibold text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">
          {THAI_MONTHS_FULL[month]} {thaiYear}
        </h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-2 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[hsl(25,10%,45%)]" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[hsl(25,10%,55%)] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-[hsl(35,20%,88%)] dark:bg-[hsl(25,15%,20%)] rounded-xl overflow-hidden border border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)]">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="bg-[hsl(35,25%,96%)] dark:bg-[hsl(25,12%,16%)] min-h-[80px]" />
          }
          const dateStr = toDateStr(year, month, day)
          const isToday = dateStr === todayStr
          const events = getEventsForDate(month, day)
          const items = itemsByDate[dateStr] ?? []

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className="bg-white dark:bg-[hsl(25,12%,14%)] min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5 cursor-pointer hover:bg-[hsl(35,40%,96%)] dark:hover:bg-[hsl(25,12%,18%)] transition-colors group relative overflow-hidden"
            >
              {/* Day number */}
              <div className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1 ${
                isToday
                  ? "bg-[hsl(24,85%,50%)] text-white"
                  : "text-[hsl(25,20%,35%)] dark:text-[hsl(35,15%,65%)]"
              }`}>
                {day}
              </div>

              {/* Seasonal event badges */}
              {events.slice(0, 1).map(ev => (
                <div key={ev.id} className={`text-[9px] rounded px-1 py-0.5 mb-0.5 border ${ev.colorClass}`}>
                  <span className="sm:hidden">{ev.emoji}</span>
                  <span className="hidden sm:inline truncate block">{ev.emoji} {ev.name}</span>
                </div>
              ))}

              {/* Content items */}
              {items.slice(0, 2).map(item => {
                const cat = item.content_category ? CONTENT_CATEGORIES[item.content_category as keyof typeof CONTENT_CATEGORIES] : null
                return (
                  <div
                    key={item.id}
                    className={`text-[9px] rounded px-1 py-0.5 mb-0.5 truncate ${cat ? cat.color : "bg-gray-100 text-gray-700"}`}
                    title={item.title}
                  >
                    {cat ? cat.emoji : "📌"} {item.title}
                  </div>
                )
              })}
              {items.length > 2 && (
                <div className="text-[9px] text-[hsl(25,10%,55%)]">+{items.length - 2} อื่นๆ</div>
              )}

              {/* Add button on hover */}
              <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3 text-[hsl(24,85%,50%)]" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {Object.entries(CONTENT_CATEGORIES).map(([k, v]) => (
          <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full ${v.color}`}>
            <span className="sm:hidden">{v.emoji}</span>
            <span className="hidden sm:inline">{v.emoji} {v.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
