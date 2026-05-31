"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const PILLARS = [
  { value: "room_corner",        label: "🏠 มุมบ้าน" },
  { value: "product_review",     label: "⭐ รีวิวสินค้า" },
  { value: "organization_tips",  label: "📌 ทริคจัดบ้าน" },
  { value: "home_humor",         label: "😅 มุขแต่งบ้าน" },
]

const STYLES = [
  { value: "humor",       label: "😂 ตลก/มุขขำ" },
  { value: "review",      label: "⭐ รีวิวตรงๆ" },
  { value: "before_after",label: "🔄 Before & After" },
  { value: "howto",       label: "🛠️ How-to / DIY" },
]

const DURATIONS = [
  { value: "short",  label: "สั้น ~15-30 วิ" },
  { value: "medium", label: "กลาง ~30-60 วิ" },
  { value: "long",   label: "ยาว ~1-2 นาที" },
]

interface ScriptResult {
  hook?: string
  story?: string
  solution?: string
  cta?: string
  full_script?: string
}

interface Props {
  onApply?: (script: string) => void
}

export function ScriptGenerator({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScriptResult | null>(null)

  const [pillar, setPillar] = useState("product_review")
  const [product, setProduct] = useState("")
  const [style, setStyle] = useState("review")
  const [duration, setDuration] = useState("medium")

  async function generate() {
    if (!product.trim()) { toast.error("กรุณากรอกชื่อสินค้า/เนื้อหา"); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillar, product, style, duration }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "เกิดข้อผิดพลาด"); return }
      setResult(data)
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!result?.full_script) return
    onApply?.(result.full_script)
    toast.success("ใช้ Script แล้ว")
  }

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,42%)] transition-colors group"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(24,85%,96%)] group-hover:bg-[hsl(24,85%,92%)] transition-colors text-base">✨</span>
          Generate Script
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="rounded-xl border border-[hsl(24,85%,85%)] bg-[hsl(24,85%,98%)] p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-sm font-semibold text-[hsl(25,20%,15%)]">Generate Script</span>
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); setResult(null) }}
              className="text-[hsl(25,10%,55%)] hover:text-[hsl(25,20%,15%)] text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          {!result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">หมวดหมู่</Label>
                  <Select value={pillar} onValueChange={setPillar}>
                    <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PILLARS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">สไตล์การรีวิว</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">สินค้า / เนื้อหา / รุ่น *</Label>
                <Input
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="เช่น พัดลมไดสัน AM07, โซฟา IKEA SÖDERHAMN, จัดระเบียบตู้เสื้อผ้า"
                  className="h-9 text-sm bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">ความยาว</Label>
                <div className="flex gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        duration === d.value
                          ? "bg-[hsl(24,85%,50%)] text-white border-[hsl(24,85%,50%)]"
                          : "bg-white text-[hsl(25,10%,45%)] border-[hsl(35,20%,88%)] hover:border-[hsl(24,85%,70%)]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={generate}
                disabled={loading}
                className="w-full bg-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,44%)] text-white h-9"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังสร้าง Script...
                  </span>
                ) : "✨ Generate Script"}
              </Button>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div className="space-y-3">
              <div className="space-y-2.5 text-sm">
                {result.hook && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[hsl(25,10%,50%)] uppercase tracking-wide">🪝 Hook</span>
                    <p className="text-[hsl(25,20%,15%)] leading-relaxed whitespace-pre-wrap">{result.hook}</p>
                  </div>
                )}
                {result.story && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[hsl(25,10%,50%)] uppercase tracking-wide">📖 Story</span>
                    <p className="text-[hsl(25,20%,15%)] leading-relaxed whitespace-pre-wrap">{result.story}</p>
                  </div>
                )}
                {result.solution && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[hsl(25,10%,50%)] uppercase tracking-wide">💡 Solution</span>
                    <p className="text-[hsl(25,20%,15%)] leading-relaxed whitespace-pre-wrap">{result.solution}</p>
                  </div>
                )}
                {result.cta && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[hsl(25,10%,50%)] uppercase tracking-wide">📣 CTA</span>
                    <p className="text-[hsl(25,20%,15%)] leading-relaxed whitespace-pre-wrap">{result.cta}</p>
                  </div>
                )}
                {!result.hook && result.full_script && (
                  <p className="text-[hsl(25,20%,15%)] leading-relaxed whitespace-pre-wrap">{result.full_script}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generate}
                  disabled={loading}
                  className="flex-1 h-9 text-sm gap-1.5"
                >
                  {loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : "↺"} Re-Script
                </Button>
                {onApply && (
                  <Button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 h-9 text-sm bg-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,44%)] text-white"
                  >
                    ✓ ใช้ Script นี้
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
