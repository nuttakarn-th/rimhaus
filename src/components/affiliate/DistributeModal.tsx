"use client"

import { useState, useTransition } from "react"
import { X, CalendarDays, Info } from "lucide-react"

interface Props {
  activeCount: number
  onClose: () => void
  onDistribute: (start: string, end: string, slots: number) => Promise<void>
}

export function DistributeModal({ activeCount, onClose, onDistribute }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(nextMonth)
  const [slots, setSlots] = useState(1)
  const [isPending, startTransition] = useTransition()

  const days = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1)
  const estimated = days * slots

  function handleSubmit() {
    startTransition(async () => {
      await onDistribute(start, end, slots)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-[hsl(25,12%,14%)] rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[hsl(24,85%,50%)]" />
            <span className="font-semibold text-sm text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)]">กระจาย Affiliate ลงปฏิทิน</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,22%)] transition-colors">
            <X className="w-4 h-4 text-[hsl(25,10%,45%)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-[hsl(25,10%,50%)] bg-[hsl(35,40%,97%)] dark:bg-[hsl(25,12%,18%)] rounded-xl p-3">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(24,85%,50%)]" />
            <span>
              วันธรรมดา → รูปภาพ · วันเสาร์-อาทิตย์ → วิดีโอสั้น<br />
              เปิดใช้งาน <strong className="text-[hsl(25,20%,25%)] dark:text-[hsl(35,15%,75%)]">{activeCount}</strong> สินค้า · สลับโซนอัตโนมัติ
            </span>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">วันเริ่ม</label>
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-2.5 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">วันสิ้นสุด</label>
              <input
                type="date"
                value={end}
                min={start}
                onChange={e => setEnd(e.target.value)}
                className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-2.5 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
              />
            </div>
          </div>

          {/* Slots per day */}
          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-2">Content ต่อวัน</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setSlots(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${slots === n ? "bg-[hsl(24,85%,50%)] text-white border-[hsl(24,85%,50%)]" : "border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-[hsl(25,10%,45%)] hover:border-[hsl(24,85%,50%)]"}`}
                >
                  {n} Content
                </button>
              ))}
            </div>
          </div>

          {/* Estimate */}
          <div className="rounded-xl bg-[hsl(24,85%,97%)] dark:bg-[hsl(24,30%,15%)] px-4 py-3 text-center">
            <p className="text-xs text-[hsl(25,10%,50%)]">จะสร้าง Content ประมาณ</p>
            <p className="text-2xl font-bold text-[hsl(24,85%,50%)] mt-0.5">{estimated} รายการ</p>
            <p className="text-[10px] text-[hsl(25,10%,55%)]">{days} วัน × {slots} Content/วัน</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-sm font-medium text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || activeCount === 0 || days === 0}
            className="flex-1 py-2.5 rounded-xl bg-[hsl(24,85%,50%)] text-white text-sm font-medium hover:bg-[hsl(24,85%,45%)] disabled:opacity-60 transition-colors"
          >
            {isPending ? "กำลังสร้าง…" : "กระจายเลย"}
          </button>
        </div>
      </div>
    </div>
  )
}
