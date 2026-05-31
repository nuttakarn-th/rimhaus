"use client"

import { useState, useRef } from "react"
import { formatCurrency } from "@/lib/utils"
import type { RateCardPackage } from "@/lib/types"

const LINE_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
)

const CATEGORY_LABELS: Record<string, string> = {
  per_platform: "Single Platform",
  bundle: "All Platforms",
  addon: "Additional Services",
}

interface Props {
  packages: RateCardPackage[]
  contactLine: string | null
  pageName: string | null
}

export function PackageCalculator({ packages, contactLine, pageName }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const selectablePkgs = packages.filter(
    p => p.is_active && p.category !== "barter" && p.price != null
  )

  const grouped = {
    per_platform: selectablePkgs.filter(p => p.category === "per_platform"),
    bundle: selectablePkgs.filter(p => p.category === "bundle"),
    addon: selectablePkgs.filter(p => p.category === "addon"),
  }

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedPkgs = selectablePkgs.filter(p => selected.has(p.id))
  const total = selectedPkgs.reduce((s, p) => s + (p.price ?? 0), 0)

  async function handleSaveImage() {
    if (!summaryRef.current || selectedPkgs.length === 0) return
    setSaving(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: "#1a1208",
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const url = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = url
      a.download = "rate-card-quote.png"
      a.click()
    } finally {
      setSaving(false)
    }
  }

  const lineMsg = selectedPkgs.length > 0
    ? `สวัสดีครับ/ค่ะ สนใจแพ็กเกจ: ${selectedPkgs.map(p => p.name).join(", ")} รวม ${formatCurrency(total)}`
    : ""

  const lineUrl = contactLine
    ? `https://line.me/ti/p/~${contactLine}${lineMsg ? `?openChatIdOrUrl=${encodeURIComponent(lineMsg)}` : ""}`
    : null

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-1.5 mb-2 text-center">
        <h2
          className="text-2xl tracking-tight leading-tight text-[hsl(25,20%,12%)]"
          style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
        >
          ลองคำนวณค่าจ้าง
        </h2>
        <p className="text-xs text-[hsl(25,10%,55%)]">เลือกแพ็กเกจที่สนใจเพื่อดูราคาล่วงหน้า</p>
      </div>

      {/* Package selection */}
      <div className="space-y-3">
        {(Object.entries(grouped) as [string, RateCardPackage[]][]).map(([cat, pkgs]) => {
          if (!pkgs.length) return null
          return (
            <div key={cat}>
              <p className="text-[10px] font-bold text-[hsl(25,10%,55%)] uppercase tracking-widest mb-2 px-1">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-2">
                {pkgs.map(pkg => {
                  const isOn = selected.has(pkg.id)
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => toggle(pkg.id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-150 ${
                        isOn
                          ? "border-[hsl(24,85%,50%)] bg-orange-50 shadow-sm"
                          : "border-[hsl(35,20%,90%)] bg-white hover:border-[hsl(24,85%,60%)] hover:bg-orange-50/30"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isOn ? "border-[hsl(24,85%,50%)] bg-[hsl(24,85%,50%)]" : "border-[hsl(35,20%,80%)]"
                      }`}>
                        {isOn && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-snug ${isOn ? "text-[hsl(24,85%,40%)]" : "text-[hsl(25,20%,15%)]"}`}>
                          {pkg.name}
                        </p>
                        {pkg.description && (
                          <p className="text-[11px] text-[hsl(25,10%,55%)] mt-0.5 line-clamp-1">{pkg.description}</p>
                        )}
                      </div>
                      {/* Price */}
                      <div className="shrink-0 text-right">
                        {pkg.original_price && (
                          <p className="text-[10px] text-[hsl(25,10%,65%)] line-through">{formatCurrency(pkg.original_price)}</p>
                        )}
                        <p className={`text-sm font-black ${isOn ? "text-[hsl(24,85%,50%)]" : "text-[hsl(25,20%,25%)]"}`}>
                          {formatCurrency(pkg.price!)}
                        </p>
                        {pkg.unit && <p className="text-[9px] text-[hsl(25,10%,60%)]">{pkg.unit}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Running total bar */}
      <div className={`sticky bottom-4 z-10 transition-all duration-300 ${selectedPkgs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-[hsl(25,20%,12%)] text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] text-white/60">{selectedPkgs.length} แพ็กเกจที่เลือก</p>
            <p className="text-lg font-black">{formatCurrency(total)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveImage}
              disabled={saving}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {saving ? "..." : "บันทึก"}
            </button>
            {contactLine && (
              <a
                href={`https://line.me/ti/p/~${contactLine}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                {LINE_SVG}
                LINE
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary card (for screenshot) */}
      {selectedPkgs.length > 0 && (
        <div
          ref={summaryRef}
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(25,20%,12%) 0%, hsl(22,25%,18%) 100%)" }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/10">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Rate Card Quote</p>
            <p className="text-white font-black text-lg mt-0.5" style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
              {pageName ?? "unfinished house"}
            </p>
            <p className="text-white/40 text-[10px] mt-0.5">{new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>

          {/* Items */}
          <div className="px-5 py-4 space-y-2.5">
            {selectedPkgs.map(pkg => (
              <div key={pkg.id} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold leading-snug">{pkg.name}</p>
                  {pkg.unit && <p className="text-white/40 text-[10px] mt-0.5">{pkg.unit}</p>}
                </div>
                <p className="text-[hsl(35,85%,65%)] font-black text-sm shrink-0">{formatCurrency(pkg.price!)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mx-5 mb-5 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-white/70 text-xs font-bold">ราคารวม (Net)</p>
            <p className="text-white font-black text-xl" style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
              {formatCurrency(total)}
            </p>
          </div>

          {/* Contact footer */}
          {contactLine && (
            <div className="px-5 pb-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#06C755] flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </div>
              <p className="text-white/50 text-[10px]">LINE: {contactLine}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
