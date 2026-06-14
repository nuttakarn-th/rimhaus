"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { PlatformBubble } from "@/components/ui/PlatformIcon"
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
  platformLogos?: Record<string, string>
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function SummaryCard({ selectedPkgs, total, pageName, contactLine }: {
  selectedPkgs: RateCardPackage[]
  total: number
  pageName: string | null
  contactLine: string | null
}) {
  return (
    <div
      data-summary-card
      className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1f1509 0%, #1a1810 100%)" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 sm:px-4 sm:pt-4 sm:pb-3 border-b border-white/10">
        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Rate Card Quote</p>
        <p className="text-white font-black text-lg mt-0.5" style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
          {pageName ?? "unfinished house"}
        </p>
        <p className="text-white/40 text-[10px] mt-0.5">{new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-2.5 sm:px-4 sm:py-3 sm:space-y-2">
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
      <div className="mx-5 sm:mx-4 bg-white/10 rounded-xl px-4 py-3 sm:py-2.5 flex items-center justify-between">
        <p className="text-white/70 text-xs font-bold">ราคารวม (Net)</p>
        <p className="text-white font-black text-xl" style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
          {formatCurrency(total)}
        </p>
      </div>

      {/* WHT note */}
      <p className="mx-5 sm:mx-4 mt-2 mb-5 sm:mb-4 text-white/35 text-[9px] leading-relaxed">
        *ราคานี้ยังไม่รวม การหักภาษี ณ ที่จ่าย 3%
      </p>

      {/* Contact footer */}
      {contactLine && (
        <div className="px-5 sm:px-4 pb-5 sm:pb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#06C755] flex items-center justify-center shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </div>
          <p className="text-white/50 text-[10px]">LINE: {contactLine}</p>
        </div>
      )}
    </div>
  )
}

export function PackageCalculator({ packages, contactLine, pageName, platformLogos }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

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

  function handleSaveImage() {
    if (selectedPkgs.length === 0) return
    setSaving(true)
    try {
      const DPR = 2
      const W = 640
      const PAD = 44
      const FONT = "system-ui, -apple-system, sans-serif"

      // Calculate total height
      let contentH = 0
      contentH += 110  // header
      contentH += selectedPkgs.length * 44  // items
      contentH += 20   // gap before total
      contentH += 64   // total box
      contentH += 28   // WHT note
      if (contactLine) contentH += 36  // LINE footer
      contentH += PAD  // bottom padding

      const H = PAD + contentH

      const canvas = document.createElement("canvas")
      canvas.width = W * DPR
      canvas.height = H * DPR
      const ctx = canvas.getContext("2d")!
      ctx.scale(DPR, DPR)

      // JPG has no alpha — fill opaque base first
      ctx.fillStyle = "#1f1509"
      ctx.fillRect(0, 0, W, H)

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, "#1f1509")
      bg.addColorStop(1, "#1a1810")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      let y = PAD

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.38)"
      ctx.font = `bold 11px ${FONT}`
      ctx.letterSpacing = "2px"
      ctx.fillText("RATE CARD QUOTE", PAD, y + 14)
      ctx.letterSpacing = "0px"

      // Page name
      y += 30
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold 24px ${FONT}`
      ctx.fillText(pageName ?? "unfinished house", PAD, y + 24)

      // Date
      y += 34
      ctx.fillStyle = "rgba(255,255,255,0.32)"
      ctx.font = `13px ${FONT}`
      ctx.fillText(
        new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }),
        PAD, y + 14
      )

      // Divider
      y += 28
      ctx.strokeStyle = "rgba(255,255,255,0.1)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(PAD, y)
      ctx.lineTo(W - PAD, y)
      ctx.stroke()

      y += 22

      // Items
      for (const pkg of selectedPkgs) {
        ctx.fillStyle = "#ffffff"
        ctx.font = `600 15px ${FONT}`
        ctx.fillText(pkg.name, PAD, y + 16)

        const priceStr = formatCurrency(pkg.price!)
        ctx.fillStyle = "#f5c47a"
        ctx.font = `bold 15px ${FONT}`
        const pw = ctx.measureText(priceStr).width
        ctx.fillText(priceStr, W - PAD - pw, y + 16)

        if (pkg.unit) {
          ctx.fillStyle = "rgba(255,255,255,0.32)"
          ctx.font = `11px ${FONT}`
          ctx.fillText(pkg.unit, PAD, y + 30)
        }

        y += 44
      }

      y += 20

      // Total box
      ctx.fillStyle = "rgba(255,255,255,0.1)"
      rr(ctx, PAD, y, W - PAD * 2, 64, 14)
      ctx.fill()

      ctx.fillStyle = "rgba(255,255,255,0.55)"
      ctx.font = `bold 13px ${FONT}`
      ctx.fillText("ราคารวม (Net)", PAD + 16, y + 28)

      const totalStr = formatCurrency(total)
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold 24px ${FONT}`
      const tw = ctx.measureText(totalStr).width
      ctx.fillText(totalStr, W - PAD - 16 - tw, y + 32)

      y += 64 + 14

      // WHT note
      ctx.fillStyle = "rgba(255,255,255,0.28)"
      ctx.font = `11px ${FONT}`
      ctx.fillText("*ราคานี้ยังไม่รวม การหักภาษี ณ ที่จ่าย 3%", PAD, y + 12)

      // LINE footer
      if (contactLine) {
        y += 28
        ctx.fillStyle = "rgba(255,255,255,0.35)"
        ctx.font = `12px ${FONT}`
        ctx.fillText(`LINE: ${contactLine}`, PAD, y + 16)
      }

      // Download
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "rate-card-quote.jpg"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setSaving(false)
      }, "image/jpeg", 0.92)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col items-center gap-1 mb-3 text-center">
        <h2
          className="text-2xl tracking-tight leading-tight text-foreground"
          style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
        >
          Calculate Cost
        </h2>
        <p className="text-xs text-muted-foreground">เลือกแพ็กเกจที่สนใจเพื่อดูราคาล่วงหน้า</p>
      </div>

      <div className="sm:grid sm:grid-cols-[1fr_300px] sm:gap-5 sm:items-start space-y-4 sm:space-y-0">
        {/* LEFT: Package selection */}
        <div className="space-y-3 sm:max-h-[70vh] sm:overflow-y-auto sm:pr-1">
          {(Object.entries(grouped) as [string, RateCardPackage[]][]).map(([cat, pkgs]) => {
            if (!pkgs.length) return null
            return (
              <div key={cat}>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="space-y-2">
                  {pkgs.map(pkg => {
                    const isOn = selected.has(pkg.id)
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => toggle(pkg.id)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 sm:py-2 rounded-2xl border-2 transition-all duration-150 ${
                          isOn
                            ? "border-primary bg-orange-50 shadow-sm"
                            : "border-border bg-white hover:border-[hsl(24,85%,60%)] hover:bg-orange-50/30"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isOn ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {isOn && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold leading-snug ${isOn ? "text-brand-tx" : "text-foreground"}`}>
                            {pkg.name}
                          </p>
                          {(pkg.platforms?.length || pkg.content_type) && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {pkg.platforms?.map(p => {
                                const logo = platformLogos?.[p]
                                return logo ? (
                                  <div key={p} className="w-4 h-4 rounded-full overflow-hidden bg-white border border-border shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={logo} alt={p} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <PlatformBubble key={p} platform={p} size={16} noHover />
                                )
                              })}
                              {pkg.content_type === "video" && <span className="text-[11px] leading-none">🎬</span>}
                              {pkg.content_type === "photo" && <span className="text-[11px] leading-none">📷</span>}
                            </div>
                          )}
                          {pkg.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{pkg.description}</p>
                          )}
                        </div>
                        {/* Price */}
                        <div className="shrink-0 text-right">
                          {pkg.original_price && (
                            <p className="text-[10px] text-ink-dim line-through">{formatCurrency(pkg.original_price)}</p>
                          )}
                          <p className={`text-sm font-black ${isOn ? "text-brand-tx" : "text-muted-foreground"}`}>
                            {formatCurrency(pkg.price!)}
                          </p>
                          {pkg.unit && <p className="text-[9px] text-ink-dim">{pkg.unit}</p>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Running total bar — mobile only */}
          <div className={`sticky bottom-4 z-10 sm:hidden transition-all duration-300 ${selectedPkgs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="bg-foreground text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl">
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
        </div>

        {/* RIGHT: Summary card — desktop only, always visible */}
        <div className="hidden sm:block sm:sticky sm:top-4">
          {selectedPkgs.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <p className="text-sm text-ink-dim">เลือกแพ็กเกจที่สนใจ</p>
              <p className="text-xs text-ink-dim mt-1">ราคารวมจะแสดงที่นี่</p>
            </div>
          ) : (
            <SummaryCard selectedPkgs={selectedPkgs} total={total} pageName={pageName} contactLine={contactLine} />
          )}
        </div>
      </div>

      {/* Mobile: summary card shown below packages */}
      <div className="sm:hidden mt-4">
        {selectedPkgs.length > 0 && (
          <SummaryCard selectedPkgs={selectedPkgs} total={total} pageName={pageName} contactLine={contactLine} />
        )}
      </div>
    </section>
  )
}
