"use client"

import { useState, useMemo, useTransition } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { saveCommissionRecord, type CommissionRecord } from "@/actions/commission.actions"

const THRESHOLD = 20_000

function calc(cash: number, affiliate: number, ads: number, programs: number) {
  const net = Math.max(0, cash - ads - programs)
  let fundPage = 0
  let workers = 0
  if (net <= THRESHOLD) {
    fundPage = net * 0.8
    workers = net * 0.2
  } else {
    fundPage = THRESHOLD * 0.8 + (net - THRESHOLD) * 0.6
    workers = THRESHOLD * 0.2 + (net - THRESHOLD) * 0.4
  }
  return {
    net, fundPage,
    future: fundPage * 0.75,
    pagedev: fundPage * 0.25,
    workers,
    palm: workers * 0.5,
    richa: workers * 0.5,
    affiliateBonus: affiliate,
  }
}

function NumInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[hsl(25,20%,25%)]">{label}</label>
      {hint && <p className="text-xs text-[hsl(25,10%,55%)]">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(25,10%,50%)]">฿</span>
        <input
          type="number" min="0" step="100" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[hsl(35,20%,88%)] bg-white text-sm text-[hsl(25,20%,15%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,70%)] focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  )
}

function ResultRow({ label, amount, color = "text-[hsl(25,20%,15%)]", bold = false, indent = false }: {
  label: string; amount: number; color?: string; bold?: boolean; indent?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold" : ""} text-[hsl(25,20%,${indent ? "40" : "15"}%)]`}>{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{formatCurrency(amount)}</span>
    </div>
  )
}

function PctBar({ a, b, colorA, colorB }: { a: number; b: number; colorA: string; colorB: string }) {
  const total = a + b
  if (total === 0) return null
  return (
    <div className="flex rounded-full overflow-hidden h-3">
      <div className={`${colorA} transition-all`} style={{ width: `${(a / total) * 100}%` }} />
      <div className={`${colorB} transition-all`} style={{ width: `${(b / total) * 100}%` }} />
    </div>
  )
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-")
  return new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleString("th-TH", { month: "long", year: "numeric" })
}

interface Props {
  existing?: CommissionRecord | null
}

export function CommissionCalculator({ existing }: Props) {
  const [month, setMonth] = useState(existing?.month ?? getCurrentMonth())
  const [cash, setCash] = useState(existing ? String(existing.cash_income) : "0")
  const [affiliate, setAffiliate] = useState(existing ? String(existing.affiliate) : "0")
  const [ads, setAds] = useState(existing ? String(existing.ads_cost) : "0")
  const [programs, setPrograms] = useState(existing ? String(existing.programs_cost) : "0")
  const [notes, setNotes] = useState(existing?.notes ?? "")
  const [isPending, startTransition] = useTransition()

  const r = useMemo(
    () => calc(Number(cash) || 0, Number(affiliate) || 0, Number(ads) || 0, Number(programs) || 0),
    [cash, affiliate, ads, programs]
  )
  const tier = r.net > THRESHOLD ? "above" : r.net > 0 ? "below" : "zero"

  function handleSave() {
    startTransition(async () => {
      const res = await saveCommissionRecord({
        month,
        cash_income: Number(cash) || 0,
        affiliate: Number(affiliate) || 0,
        ads_cost: Number(ads) || 0,
        programs_cost: Number(programs) || 0,
        notes: notes || undefined,
      })
      if (res.success) {
        toast.success(`บันทึกข้อมูลเดือน ${monthLabel(month)} แล้ว`)
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Month picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[hsl(25,20%,30%)]">เดือน:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[hsl(35,20%,88%)] bg-white text-sm text-[hsl(25,20%,15%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,70%)]"
        />
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-[hsl(25,20%,40%)] uppercase tracking-wide">รายรับ</h2>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="รายรับจากการรีวิว (Cash)" value={cash} onChange={setCash} hint="ค่าจ้างรีวิว / Sponsored" />
          <NumInput label="รายรับ Affiliate" value={affiliate} onChange={setAffiliate} hint="100% เข้ากองทุนออม" />
        </div>
        <h2 className="text-xs font-semibold text-[hsl(25,20%,40%)] uppercase tracking-wide pt-1">รายจ่าย</h2>
        <div className="grid grid-cols-2 gap-4">
          <NumInput label="ค่า Ads / Boost" value={ads} onChange={setAds} />
          <NumInput label="ค่าโปรแกรม / อื่นๆ" value={programs} onChange={setPrograms} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[hsl(25,20%,25%)]">หมายเหตุ</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="เช่น งานพิเศษเดือนนี้ ค่าโบนัส ฯลฯ"
            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(35,20%,88%)] bg-white text-sm text-[hsl(25,20%,15%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,70%)]"
          />
        </div>
      </div>

      {/* Net */}
      <div className={`rounded-2xl p-5 flex items-center justify-between ${
        tier === "above" ? "bg-[hsl(24,85%,96%)] border border-[hsl(24,85%,82%)]"
        : tier === "below" ? "bg-[hsl(120,40%,96%)] border border-[hsl(120,40%,80%)]"
        : "bg-[hsl(35,25%,95%)] border border-[hsl(35,20%,88%)]"
      }`}>
        <div>
          <p className="text-xs text-[hsl(25,10%,50%)] mb-1">รายได้สุทธิ (Cash − ต้นทุน)</p>
          <p className="text-3xl font-bold text-[hsl(25,20%,15%)]">{formatCurrency(r.net)}</p>
        </div>
        {tier !== "zero" && (
          <div className={`text-right text-xs font-semibold px-3 py-1.5 rounded-full ${
            tier === "above" ? "bg-[hsl(24,85%,88%)] text-[hsl(24,85%,35%)]" : "bg-[hsl(120,40%,85%)] text-[hsl(120,50%,25%)]"
          }`}>
            {tier === "above" ? `เกิน ฿${(20000).toLocaleString("th-TH")}` : `ไม่เกิน ฿${(20000).toLocaleString("th-TH")}`}
            <br /><span className="font-normal opacity-75">{tier === "above" ? "60/40 + 80/20" : "80/20"}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {r.net > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[hsl(25,20%,40%)] uppercase tracking-wide">จัดสรรรายได้</h2>
            <PctBar a={r.fundPage} b={r.workers} colorA="bg-[hsl(24,85%,60%)]" colorB="bg-[hsl(200,70%,55%)]" />
            <div className="flex justify-between text-xs text-[hsl(25,10%,50%)]">
              <span>กองทุนเพจ {r.net > 0 ? ((r.fundPage / r.net) * 100).toFixed(0) : 0}%</span>
              <span>คนทำงาน {r.net > 0 ? ((r.workers / r.net) * 100).toFixed(0) : 0}%</span>
            </div>
            <div className="divide-y divide-[hsl(35,20%,92%)]">
              <ResultRow label="กองทุนเพจ" amount={r.fundPage} color="text-[hsl(24,85%,45%)]" bold />
              <ResultRow label="↳ อนาคต (75%)" amount={r.future} indent />
              <ResultRow label="↳ พัฒนาเพจ (25%)" amount={r.pagedev} indent />
              <div className="pt-1" />
              <ResultRow label="คนทำงาน" amount={r.workers} color="text-[hsl(200,70%,40%)]" bold />
              <ResultRow label="↳ ปาล์ม — ฝ่ายผลิต (50%)" amount={r.palm} indent />
              <ResultRow label="↳ ริชา — ฝ่ายขาย (50%)" amount={r.richa} indent />
            </div>
          </div>

          {r.affiliateBonus > 0 && (
            <div className="bg-[hsl(270,50%,97%)] rounded-2xl border border-[hsl(270,40%,85%)] p-5">
              <p className="text-xs font-semibold text-[hsl(270,50%,40%)] uppercase tracking-wide mb-1">โบนัสสะสม Affiliate</p>
              <p className="text-xs text-[hsl(270,40%,55%)] mb-2">100% เข้ากองทุนออม — แยกจากการจัดสรรหลัก</p>
              <p className="text-2xl font-bold text-[hsl(270,50%,40%)]">{formatCurrency(r.affiliateBonus)}</p>
            </div>
          )}

          {tier === "above" && (
            <div className="bg-[hsl(35,50%,97%)] rounded-xl border border-[hsl(35,40%,88%)] p-4 text-xs text-[hsl(25,20%,40%)] space-y-1">
              <p className="font-semibold">วิธีคิด:</p>
              <p>ส่วน ฿{(20000).toLocaleString("th-TH")} แรก → กองทุนเพจ 80% + คนทำงาน 20%</p>
              <p>ส่วนที่เกิน {formatCurrency(r.net - THRESHOLD)} → กองทุนเพจ 60% + คนทำงาน 40%</p>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || r.net === 0 && Number(affiliate) === 0}
        className="w-full py-3 rounded-2xl bg-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,44%)] disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : "✓"} ยืนยันและบันทึกเดือน {monthLabel(month)}
      </button>
    </div>
  )
}
