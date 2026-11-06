"use client"

import { useState, useMemo, useCallback, useId, useEffect, useRef } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts"
import { Plus, Trash2, Download, ChevronDown, ChevronUp, Trophy, TrendingDown, Info, Save, CheckCircle } from "lucide-react"
import * as XLSX from "xlsx"

// ─── Types ──────────────────────────────────────────────────────────────────

interface BankOffer {
  id: string
  bankName: string
  rateType: "average" | "stepped"
  avgRate: number
  year1Rate: number
  year2Rate: number
  year3Rate: number
  extraFees: number
}

interface MonthRow {
  month: number          // 1-based
  beginPrincipal: number
  annualRate: number
  interestPaid: number
  principalPaid: number
  totalPaid: number
  endPrincipal: number
}

interface BankResult {
  bank: BankOffer
  schedule36: MonthRow[]
  fullSchedule: MonthRow[]
  totalInterest36: number
  totalCash36: number       // payments only
  totalPaid36: number       // cash + fees
  endPrincipal36: number
  monthsToPayoff: number
  totalInterestFull: number
  netSaving: number         // filled after all banks computed
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M"
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return n.toFixed(0)
}

function getRateForMonth(bank: BankOffer, month: number): number {
  if (bank.rateType === "average") return bank.avgRate
  if (month <= 12) return bank.year1Rate
  if (month <= 24) return bank.year2Rate
  return bank.year3Rate
}

function computeSchedule(
  currentPrincipal: number,
  monthlyInstallment: number,
  extraPayment: number,
  bank: BankOffer,
): BankResult {
  const totalMonthlyPay = monthlyInstallment + extraPayment
  const rows: MonthRow[] = []
  let principal = currentPrincipal
  let month = 1
  const MAX_MONTHS = 480 // 40 years safety cap

  while (principal > 0.01 && month <= MAX_MONTHS) {
    const annualRate = getRateForMonth(bank, month)
    const monthlyRate = annualRate / 12 / 100
    const interestPaid = principal * monthlyRate
    const principalPaid = Math.min(totalMonthlyPay - interestPaid, principal)
    const endPrincipal = Math.max(principal - principalPaid, 0)

    rows.push({
      month,
      beginPrincipal: principal,
      annualRate,
      interestPaid,
      principalPaid,
      totalPaid: totalMonthlyPay,
      endPrincipal,
    })

    principal = endPrincipal
    month++
  }

  const schedule36 = rows.slice(0, 36)
  const totalInterest36 = schedule36.reduce((s, r) => s + r.interestPaid, 0)
  const totalCash36 = schedule36.reduce((s, r) => s + r.totalPaid, 0)
  const endPrincipal36 = schedule36[schedule36.length - 1]?.endPrincipal ?? 0
  const totalInterestFull = rows.reduce((s, r) => s + r.interestPaid, 0)

  return {
    bank,
    schedule36,
    fullSchedule: rows,
    totalInterest36,
    totalCash36,
    totalPaid36: totalCash36 + bank.extraFees,
    endPrincipal36,
    monthsToPayoff: rows.length,
    totalInterestFull,
    netSaving: 0,
  }
}

function newBank(id: string): BankOffer {
  return { id, bankName: "", rateType: "average", avgRate: 3.5, year1Rate: 2.75, year2Rate: 3.25, year3Rate: 4.5, extraFees: 0 }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, min = 0, step = 1000, unit = "บาท", hint,
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; step?: number; unit?: string; hint?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">
        {label} {unit && <span className="text-[hsl(25,10%,60%)]">({unit})</span>}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value || ""}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-[hsl(35,20%,82%)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)] text-[hsl(25,20%,15%)]"
      />
      {hint && <p className="text-[10px] text-[hsl(25,10%,55%)] mt-0.5">{hint}</p>}
    </div>
  )
}

function BankCard({
  bank, index, onChange, onRemove, canRemove,
}: {
  bank: BankOffer; index: number
  onChange: (b: BankOffer) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-[hsl(35,20%,85%)] rounded-xl bg-white overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(35,25%,98%)]"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[hsl(24,85%,50%)] text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">
            {bank.bankName || `ธนาคาร ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="p-1 rounded hover:bg-red-50 text-[hsl(25,10%,55%)] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-[hsl(25,10%,55%)]" /> : <ChevronDown className="w-4 h-4 text-[hsl(25,10%,55%)]" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[hsl(35,20%,90%)]">
          <div className="pt-3">
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">ชื่อธนาคาร</label>
            <input
              type="text"
              value={bank.bankName}
              onChange={e => onChange({ ...bank, bankName: e.target.value })}
              placeholder="เช่น กรุงศรี, ธอส., ttb"
              className="w-full border border-[hsl(35,20%,82%)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">ประเภทดอกเบี้ย</label>
            <div className="flex gap-2">
              {(["average", "stepped"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => onChange({ ...bank, rateType: t })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    bank.rateType === t
                      ? "bg-[hsl(24,85%,50%)] text-white border-[hsl(24,85%,50%)]"
                      : "bg-white text-[hsl(25,10%,45%)] border-[hsl(35,20%,82%)] hover:border-[hsl(24,85%,50%)]"
                  }`}
                >
                  {t === "average" ? "เฉลี่ย 3 ปี" : "ขั้นบันได"}
                </button>
              ))}
            </div>
          </div>

          {bank.rateType === "average" ? (
            <InputField
              label="อัตราดอกเบี้ยเฉลี่ย 3 ปี"
              unit="%"
              step={0.01}
              value={bank.avgRate}
              onChange={v => onChange({ ...bank, avgRate: v })}
            />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map(yr => (
                <div key={yr}>
                  <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">ปีที่ {yr} (%)</label>
                  <input
                    type="number"
                    step={0.01}
                    value={yr === 1 ? bank.year1Rate : yr === 2 ? bank.year2Rate : bank.year3Rate}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0
                      onChange({
                        ...bank,
                        year1Rate: yr === 1 ? v : bank.year1Rate,
                        year2Rate: yr === 2 ? v : bank.year2Rate,
                        year3Rate: yr === 3 ? v : bank.year3Rate,
                      })
                    }}
                    className="w-full border border-[hsl(35,20%,82%)] rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
                  />
                </div>
              ))}
            </div>
          )}

          <InputField
            label="ค่าธรรมเนียม/ค่าจดจำนอง"
            value={bank.extraFees}
            step={500}
            onChange={v => onChange({ ...bank, extraFees: v })}
            hint="ค่าจดจำนอง, ค่าประเมิน, ค่าประกัน ฯลฯ"
          />
        </div>
      )}
    </div>
  )
}

const STORAGE_KEY = "rimhaus_refinance_v1"

// ─── Main Component ──────────────────────────────────────────────────────────

export function RefinanceCalculator() {
  const uid = useId()

  const defaultBanks: BankOffer[] = [
    { id: uid + "a", bankName: "ธนาคารปัจจุบัน", rateType: "average", avgRate: 6.5, year1Rate: 6.5, year2Rate: 6.5, year3Rate: 6.5, extraFees: 0 },
    { id: uid + "b", bankName: "", rateType: "stepped", avgRate: 3.5, year1Rate: 2.0, year2Rate: 3.0, year3Rate: 4.5, extraFees: 15000 },
  ]

  const [principal, setPrincipal] = useState(2_500_000)
  const [installment, setInstallment] = useState(14_000)
  const [extra, setExtra] = useState(0)
  const [banks, setBanks] = useState<BankOffer[]>(defaultBanks)

  const [tab, setTab] = useState<"setup" | "compare" | "schedule">("setup")
  const [selectedBankId, setSelectedBankId] = useState<string>("")
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.principal) setPrincipal(data.principal)
      if (data.installment) setInstallment(data.installment)
      if (typeof data.extra === "number") setExtra(data.extra)
      if (Array.isArray(data.banks) && data.banks.length) setBanks(data.banks)
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save to localStorage whenever data changes (debounced 800ms)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ principal, installment, extra, banks }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch { /* ignore */ }
    }, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [principal, installment, extra, banks])

  const results = useMemo<BankResult[]>(() => {
    if (!principal || !installment) return []
    const raw = banks.map(b => computeSchedule(principal, installment, extra, b))
    const maxPaid = Math.max(...raw.map(r => r.totalPaid36))
    return raw.map(r => ({ ...r, netSaving: maxPaid - r.totalPaid36 }))
  }, [principal, installment, extra, banks])

  const bestIdx = useMemo(() => {
    if (!results.length) return -1
    return results.reduce((bi, r, i) => r.totalPaid36 < results[bi].totalPaid36 ? i : bi, 0)
  }, [results])

  const selectedResult = useMemo(() => {
    const id = selectedBankId || (results[0]?.bank.id ?? "")
    return results.find(r => r.bank.id === id) ?? results[0]
  }, [results, selectedBankId])

  const addBank = useCallback(() => {
    setBanks(prev => [...prev, newBank(crypto.randomUUID())])
  }, [])

  const removeBank = useCallback((id: string) => {
    setBanks(prev => prev.filter(b => b.id !== id))
  }, [])

  const updateBank = useCallback((updated: BankOffer) => {
    setBanks(prev => prev.map(b => b.id === updated.id ? updated : b))
  }, [])

  // ── Export ──────────────────────────────────────────────────────────────

  const exportExcel = useCallback(() => {
    if (!results.length) return
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryRows = [
      ["ข้อมูลตั้งต้น", "", ""],
      ["ยอดหนี้คงเหลือ", principal, "บาท"],
      ["ค่างวด/เดือน", installment, "บาท"],
      ["เงินโปะเพิ่ม/เดือน", extra, "บาท"],
      ["", "", ""],
      ["เปรียบเทียบธนาคาร (3 ปี)", "", ""],
      ["ธนาคาร", "ดอกเบี้ยรวม 3 ปี", "เงินต้นคงเหลือปีที่ 3", "เงินจ่ายรวม (รวมค่าธรรมเนียม)", "ประหยัดได้", "เหลือผ่อน (เดือน)"],
      ...results.map((r, i) => [
        (i === bestIdx ? "★ " : "") + (r.bank.bankName || `ธนาคาร ${i + 1}`),
        r.totalInterest36.toFixed(2),
        r.endPrincipal36.toFixed(2),
        r.totalPaid36.toFixed(2),
        r.netSaving.toFixed(2),
        r.monthsToPayoff,
      ]),
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
    ws1["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws1, "สรุปเปรียบเทียบ")

    // Per-bank full schedule sheets
    results.forEach((r, i) => {
      const name = (r.bank.bankName || `ธนาคาร ${i + 1}`).slice(0, 28)
      const header = ["เดือนที่", "เงินต้นต้นงวด", "อัตราดอกเบี้ย%", "ดอกเบี้ยจ่าย", "เงินต้นลด", "ยอดชำระ", "เงินต้นคงเหลือ"]
      const rows = r.fullSchedule.map(m => [
        m.month,
        m.beginPrincipal.toFixed(2),
        m.annualRate.toFixed(2),
        m.interestPaid.toFixed(2),
        m.principalPaid.toFixed(2),
        m.totalPaid.toFixed(2),
        m.endPrincipal.toFixed(2),
      ])
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws["!cols"] = header.map(() => ({ wch: 18 }))
      XLSX.utils.book_append_sheet(wb, ws, name)
    })

    XLSX.writeFile(wb, "refinance-comparison.xlsx")
  }, [results, principal, installment, extra, bestIdx])

  // ── Chart data ──────────────────────────────────────────────────────────

  const chartData = useMemo(() => results.map((r, i) => ({
    name: r.bank.bankName || `ธนาคาร ${i + 1}`,
    "ดอกเบี้ย 3 ปี": Math.round(r.totalInterest36),
    "เงินต้นคงเหลือ": Math.round(r.endPrincipal36),
    "รวมจ่าย (รวมค่าธรรมเนียม)": Math.round(r.totalPaid36),
  })), [results])

  const lineData = useMemo(() => {
    const len = Math.max(...results.map(r => r.schedule36.length), 0)
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | string> = { เดือน: i + 1 }
      results.forEach((r, ri) => {
        const name = r.bank.bankName || `ธนาคาร ${ri + 1}`
        row[name] = Math.round(r.schedule36[i]?.endPrincipal ?? 0)
      })
      return row
    })
  }, [results])

  const LINE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#a855f7", "#ef4444"]

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">คำนวณรีไฟแนนซ์บ้าน</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">เปรียบเทียบข้อเสนอธนาคาร · คำนวณลดต้นลดดอก · ตารางผ่อนครบ</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              บันทึกแล้ว
            </span>
          )}
          <button
            onClick={() => {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ principal, installment, extra, banks }))
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              } catch { /* ignore */ }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(35,20%,80%)] bg-white text-[hsl(25,20%,25%)] text-sm font-semibold hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors"
          >
            <Save className="w-4 h-4" />
            บันทึก
          </button>
          <button
            onClick={exportExcel}
            disabled={!results.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(24,85%,50%)] text-white text-sm font-semibold hover:bg-[hsl(24,85%,45%)] disabled:opacity-40 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[hsl(35,25%,94%)] rounded-xl w-fit">
        {(["setup", "compare", "schedule"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-white shadow-sm text-[hsl(25,20%,15%)]" : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)]"
            }`}
          >
            {t === "setup" ? "ตั้งค่า" : t === "compare" ? "เปรียบเทียบ" : "ตารางผ่อน"}
          </button>
        ))}
      </div>

      {/* ── Tab: Setup ─────────────────────────────────────────────────── */}
      {tab === "setup" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Global inputs */}
          <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
            <div>
              <h2 className="font-bold text-[hsl(25,20%,15%)]">ข้อมูลหนี้ปัจจุบัน</h2>
              <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">กรอกข้อมูลสินเชื่อบ้านที่มีอยู่</p>
            </div>
            <InputField
              label="ยอดหนี้เงินต้นคงเหลือ"
              value={principal}
              step={10000}
              onChange={setPrincipal}
              hint="ยอดหนี้ที่ยังเหลืออยู่ตอนนี้"
            />
            <InputField
              label="ค่างวดรายเดือนที่ต้องจ่าย"
              value={installment}
              step={500}
              onChange={setInstallment}
              hint="ยอดชำระขั้นต่ำที่ธนาคารกำหนด"
            />
            <InputField
              label="เงินโปะเพิ่มต่อเดือน"
              value={extra}
              step={500}
              onChange={setExtra}
              hint="เงินที่ต้องการจ่ายเพิ่มเกินค่างวดปกติ (ถ้ามี)"
            />

            {results[0] && (
              <div className="mt-2 p-3 rounded-xl bg-[hsl(35,25%,96%)] border border-[hsl(35,20%,88%)]">
                <p className="text-xs font-semibold text-[hsl(25,10%,45%)] mb-1">ยอดชำระจริงต่อเดือน</p>
                <p className="text-xl font-black text-[hsl(24,85%,50%)]">{fmt(installment + extra)} บาท</p>
              </div>
            )}
          </div>

          {/* Bank list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[hsl(25,20%,15%)]">ข้อเสนอธนาคาร</h2>
              <button
                onClick={addBank}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)] text-xs font-semibold hover:bg-orange-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มธนาคาร
              </button>
            </div>
            {banks.map((bank, i) => (
              <BankCard
                key={bank.id}
                bank={bank}
                index={i}
                onChange={updateBank}
                onRemove={() => removeBank(bank.id)}
                canRemove={banks.length > 1}
              />
            ))}
            <button
              onClick={() => setTab("compare")}
              className="w-full py-2.5 rounded-xl bg-[hsl(24,85%,50%)] text-white font-semibold text-sm hover:bg-[hsl(24,85%,45%)] transition-colors"
            >
              ดูผลเปรียบเทียบ →
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Compare ───────────────────────────────────────────────── */}
      {tab === "compare" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r, i) => {
              const isBest = i === bestIdx
              const name = r.bank.bankName || `ธนาคาร ${i + 1}`
              const years = Math.floor(r.monthsToPayoff / 12)
              const months = r.monthsToPayoff % 12
              return (
                <div
                  key={r.bank.id}
                  className={`relative bg-white rounded-2xl border p-4 space-y-3 ${
                    isBest
                      ? "border-[hsl(24,85%,50%)] ring-2 ring-[hsl(24,85%,50%)]/20"
                      : "border-[hsl(35,20%,88%)]"
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-3 left-4 flex items-center gap-1 bg-[hsl(24,85%,50%)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      <Trophy className="w-3 h-3" />
                      คุ้มค่าที่สุด
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ background: LINE_COLORS[i % LINE_COLORS.length] }}
                      >
                        {i + 1}
                      </div>
                      <span className="font-bold text-sm text-[hsl(25,20%,15%)]">{name}</span>
                    </div>
                    {r.bank.rateType === "average" ? (
                      <span className="text-xs text-[hsl(25,10%,50%)] bg-[hsl(35,25%,94%)] px-2 py-0.5 rounded-full">{r.bank.avgRate}%</span>
                    ) : (
                      <span className="text-xs text-[hsl(25,10%,50%)] bg-[hsl(35,25%,94%)] px-2 py-0.5 rounded-full">
                        {r.bank.year1Rate}/{r.bank.year2Rate}/{r.bank.year3Rate}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[hsl(35,25%,97%)] rounded-xl p-2.5">
                      <p className="text-[10px] text-[hsl(25,10%,55%)]">ดอกเบี้ย 3 ปี</p>
                      <p className="text-base font-black text-red-500">{fmt(r.totalInterest36)}</p>
                    </div>
                    <div className="bg-[hsl(35,25%,97%)] rounded-xl p-2.5">
                      <p className="text-[10px] text-[hsl(25,10%,55%)]">เงินต้นคงเหลือ ปีที่ 3</p>
                      <p className="text-base font-black text-[hsl(25,20%,25%)]">{fmt(r.endPrincipal36)}</p>
                    </div>
                    <div className="bg-[hsl(35,25%,97%)] rounded-xl p-2.5">
                      <p className="text-[10px] text-[hsl(25,10%,55%)]">รวมจ่าย (รวมค่าธรรมเนียม)</p>
                      <p className="text-base font-black text-[hsl(25,20%,25%)]">{fmt(r.totalPaid36)}</p>
                    </div>
                    <div className={`rounded-xl p-2.5 ${r.netSaving > 0 ? "bg-green-50" : "bg-[hsl(35,25%,97%)]"}`}>
                      <p className="text-[10px] text-[hsl(25,10%,55%)]">ประหยัดได้</p>
                      <p className={`text-base font-black ${r.netSaving > 0 ? "text-green-600" : "text-[hsl(25,10%,60%)]"}`}>
                        {r.netSaving > 0 ? `+${fmt(r.netSaving)}` : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[hsl(25,10%,50%)] border-t border-[hsl(35,20%,90%)] pt-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    ปลดหนี้ใน <strong className="text-[hsl(25,20%,15%)]">{years > 0 ? `${years} ปี ` : ""}{months > 0 ? `${months} เดือน` : ""}</strong>
                    &nbsp;· ดอกเบี้ยรวมทั้งหมด: {fmt(r.totalInterestFull)}
                  </div>

                  <button
                    onClick={() => { setSelectedBankId(r.bank.id); setTab("schedule") }}
                    className="w-full py-1.5 rounded-lg border border-[hsl(35,20%,82%)] text-xs font-medium text-[hsl(25,10%,45%)] hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors"
                  >
                    ดูตารางผ่อน →
                  </button>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5">
                <h3 className="font-bold text-sm text-[hsl(25,20%,15%)] mb-4">เปรียบเทียบยอดจ่าย (3 ปี)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,20%,90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="ดอกเบี้ย 3 ปี" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="เงินต้นคงเหลือ" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="รวมจ่าย (รวมค่าธรรมเนียม)" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5">
                <h3 className="font-bold text-sm text-[hsl(25,20%,15%)] mb-4">เงินต้นคงเหลือ 36 เดือน</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={lineData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,20%,90%)" />
                    <XAxis dataKey="เดือน" tick={{ fontSize: 11 }} label={{ value: "เดือน", position: "insideBottomRight", offset: -5, fontSize: 10 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {results.map((r, i) => (
                      <Line
                        key={r.bank.id}
                        type="monotone"
                        dataKey={r.bank.bankName || `ธนาคาร ${i + 1}`}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Schedule ──────────────────────────────────────────────── */}
      {tab === "schedule" && (
        <div className="space-y-4">
          {/* Bank selector */}
          <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">เลือกธนาคาร</label>
                <select
                  value={selectedBankId || results[0]?.bank.id}
                  onChange={e => setSelectedBankId(e.target.value)}
                  className="w-full border border-[hsl(35,20%,82%)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
                >
                  {results.map((r, i) => (
                    <option key={r.bank.id} value={r.bank.id}>
                      {r.bank.bankName || `ธนาคาร ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedResult && (
                <div className="flex gap-3 text-center shrink-0">
                  <div className="bg-[hsl(35,25%,96%)] rounded-xl px-4 py-2">
                    <p className="text-[10px] text-[hsl(25,10%,55%)]">เหลือผ่อน</p>
                    <p className="text-base font-black text-[hsl(25,20%,15%)]">
                      {Math.floor(selectedResult.monthsToPayoff / 12)} ปี {selectedResult.monthsToPayoff % 12} เดือน
                    </p>
                  </div>
                  <div className="bg-[hsl(35,25%,96%)] rounded-xl px-4 py-2">
                    <p className="text-[10px] text-[hsl(25,10%,55%)]">ดอกเบี้ยรวมทั้งหมด</p>
                    <p className="text-base font-black text-red-500">{fmt(selectedResult.totalInterestFull)}</p>
                  </div>
                  <div className="bg-[hsl(35,25%,96%)] rounded-xl px-4 py-2">
                    <p className="text-[10px] text-[hsl(25,10%,55%)]">จ่ายต่อเดือน</p>
                    <p className="text-base font-black text-[hsl(24,85%,50%)]">{fmt(installment + extra)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Annual summary */}
          {selectedResult && (
            <>
              <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[hsl(35,20%,90%)]">
                  <h3 className="font-bold text-sm text-[hsl(25,20%,15%)]">สรุปรายปี</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[hsl(35,25%,97%)]">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">ปีที่</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">ดอกเบี้ย/ปี</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">เงินต้นลด/ปี</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">ยอดจ่าย/ปี</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">เงินต้นคงเหลือ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: Math.ceil(selectedResult.fullSchedule.length / 12) }, (_, yi) => {
                        const slice = selectedResult.fullSchedule.slice(yi * 12, (yi + 1) * 12)
                        const intSum = slice.reduce((s, r) => s + r.interestPaid, 0)
                        const prinSum = slice.reduce((s, r) => s + r.principalPaid, 0)
                        const paidSum = slice.reduce((s, r) => s + r.totalPaid, 0)
                        const endPrin = slice[slice.length - 1]?.endPrincipal ?? 0
                        return (
                          <tr key={yi} className="border-t border-[hsl(35,20%,92%)] hover:bg-[hsl(35,25%,98%)]">
                            <td className="px-4 py-2.5 font-semibold text-[hsl(25,20%,25%)]">ปีที่ {yi + 1}</td>
                            <td className="px-4 py-2.5 text-right text-red-500">{fmt(intSum)}</td>
                            <td className="px-4 py-2.5 text-right text-green-600">{fmt(prinSum)}</td>
                            <td className="px-4 py-2.5 text-right text-[hsl(25,20%,25%)]">{fmt(paidSum)}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-[hsl(25,20%,15%)]">{fmt(endPrin)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[hsl(35,25%,96%)] border-t-2 border-[hsl(35,20%,82%)]">
                        <td className="px-4 py-2.5 font-bold text-[hsl(25,20%,15%)]">รวมทั้งหมด</td>
                        <td className="px-4 py-2.5 text-right font-bold text-red-500">{fmt(selectedResult.totalInterestFull)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-green-600">{fmt(principal)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-[hsl(25,20%,15%)]">
                          {fmt(selectedResult.fullSchedule.reduce((s, r) => s + r.totalPaid, 0))}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-[hsl(24,85%,50%)]">0.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Monthly detail table */}
              <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[hsl(35,20%,90%)] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[hsl(25,20%,15%)]">ตารางผ่อนรายเดือน</h3>
                  <span className="text-xs text-[hsl(25,10%,55%)]">{selectedResult.fullSchedule.length} งวด</span>
                </div>
                <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[hsl(35,25%,97%)] z-10">
                      <tr>
                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)] w-16">งวด</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">เงินต้นต้นงวด</th>
                        <th className="text-center px-3 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">ดอกเบี้ย%</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-red-400">ดอกเบี้ยจ่าย</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-green-600">เงินต้นลด</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-[hsl(24,85%,50%)]">ยอดชำระ</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-[hsl(25,10%,45%)]">เงินต้นคงเหลือ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResult.fullSchedule.map((row, idx) => {
                        const isYearEnd = row.month % 12 === 0
                        return (
                          <tr
                            key={row.month}
                            className={`border-t border-[hsl(35,20%,93%)] hover:bg-[hsl(35,25%,98%)] transition-colors ${
                              isYearEnd ? "bg-[hsl(35,30%,97%)]" : ""
                            }`}
                          >
                            <td className="px-3 py-2 text-center text-xs text-[hsl(25,10%,50%)]">
                              {row.month}
                              {isYearEnd && <div className="text-[9px] text-[hsl(24,85%,50%)] font-bold">ปีที่ {row.month / 12}</div>}
                            </td>
                            <td className="px-3 py-2 text-right text-xs">{fmt(row.beginPrincipal)}</td>
                            <td className="px-3 py-2 text-center text-xs text-[hsl(25,10%,50%)]">{row.annualRate.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right text-xs text-red-500">{fmt(row.interestPaid)}</td>
                            <td className="px-3 py-2 text-right text-xs text-green-600">{fmt(row.principalPaid)}</td>
                            <td className="px-3 py-2 text-right text-xs font-medium text-[hsl(24,85%,50%)]">{fmt(row.totalPaid)}</td>
                            <td className="px-3 py-2 text-right text-xs font-semibold text-[hsl(25,20%,15%)]">{fmt(row.endPrincipal)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  ตารางนี้คำนวณจากยอดชำระ <strong>{fmt(installment + extra)} บาท/เดือน</strong> (ค่างวด {fmt(installment)} + โปะ {fmt(extra)})
                  โดยใช้หลักการลดต้นลดดอก · หลังปีที่ 3 ใช้อัตราดอกเบี้ย{" "}
                  {selectedResult.bank.rateType === "average" ? `${selectedResult.bank.avgRate}%` : `${selectedResult.bank.year3Rate}%`} ต่อเนื่อง
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
