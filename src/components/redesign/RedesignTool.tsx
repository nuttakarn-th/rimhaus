"use client"
import { useState, useRef } from "react"
import { AI_STYLES, AI_ROOM_TYPES, AI_VIBES } from "@/lib/constants/ai-redesign"

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr"
  let sid = localStorage.getItem("ai_session_id")
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem("ai_session_id", sid)
  }
  return sid
}

interface GenerateResult {
  generatedImage: string | null
  products: Array<{
    id: string
    name: string
    description: string | null
    image_url: string | null
    price: number | null
    affiliate_url: string
    affiliate_platform: string | null
    category: string
  }>
  generationId: string | null
}

export function RedesignTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [style, setStyle] = useState("mid_century")
  const [roomType, setRoomType] = useState<string | null>(null)
  const [vibe, setVibe] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      setUploadedImage(e.target?.result as string)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!uploadedImage || !roomType) return
    setGenerating(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/ai-redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: uploadedImage,
          style,
          roomType,
          vibe,
          sessionId: getSessionId(),
        }),
      })
      if (!res.ok) throw new Error("Server error")
      const data: GenerateResult = await res.json()
      setResult(data)
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setGenerating(false)
    }
  }

  function handleProductClick(product: GenerateResult["products"][0]) {
    const sid = getSessionId()
    const url = `/api/track-click?p=${product.id}&g=${result?.generationId ?? ""}&s=${sid}&url=${encodeURIComponent(product.affiliate_url)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-8">

      {/* Step 1: Upload */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">01 — อัปโหลดรูปมุมบ้าน</p>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-brand-tx/40 transition-colors bg-[hsl(35,30%,97%)]"
        >
          {uploadedImage ? (
            <div className="relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadedImage} alt="uploaded" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-bold bg-black/40 px-3 py-1.5 rounded-full">คลิกเพื่อเปลี่ยนรูป</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium">คลิกหรือลากรูปมาวางที่นี่</p>
                <p className="text-xs mt-1 text-muted-foreground/70">JPG, PNG — แนะนำสัดส่วน 4:3</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </section>

      {/* Step 2: Room type */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">02 — มุมบ้านไหน?</p>
        <div className="flex flex-wrap gap-2">
          {AI_ROOM_TYPES.map(r => (
            <button
              key={r.key}
              onClick={() => setRoomType(r.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                roomType === r.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 3: Style */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">03 — สไตล์</p>
        <div className="flex flex-wrap gap-2">
          {AI_STYLES.map(s => (
            <button
              key={s.key}
              onClick={() => setStyle(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                style === s.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 4: Vibe */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">
          04 — บรรยากาศ{" "}
          <span className="font-normal normal-case tracking-normal opacity-60">(ไม่บังคับ)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_VIBES.map(v => (
            <button
              key={v.key}
              onClick={() => setVibe(vibe === v.key ? null : v.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                vibe === v.key
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!uploadedImage || !roomType || generating}
        className="w-full py-4 rounded-2xl font-bold text-sm bg-[hsl(24,85%,50%)] text-white hover:bg-[hsl(24,85%,44%)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-orange-200"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
            </svg>
            กำลัง Generate… (รอประมาณ 30–60 วินาที)
          </span>
        ) : "✨ Generate มุมบ้านใหม่"}
      </button>

      {error && (
        <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl py-3 px-4">{error}</p>
      )}

      {/* Result */}
      {result && (
        <section className="space-y-5 pb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">ผลลัพธ์</p>
          {result.generatedImage ? (
            <div className="rounded-2xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.generatedImage} alt="AI generated room" className="w-full" />
            </div>
          ) : (
            <div className="rounded-2xl bg-[hsl(35,30%,97%)] border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                ไม่สามารถ generate ได้ในขณะนี้ (server โหลดสูง)<br />
                ลองใหม่ในอีกสักครู่ หรือเลือกสไตล์/มุมอื่น
              </p>
            </div>
          )}

          {result.products.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60">สินค้าที่เข้ากับสไตล์นี้</p>
              <div className="space-y-2">
                {result.products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-foreground/30 hover:shadow-md transition-all text-left active:scale-[0.99] bg-white"
                  >
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-muted" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[hsl(35,20%,92%)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                      )}
                      {p.price != null && (
                        <p className="text-xs font-bold text-brand-tx mt-1">฿{p.price.toLocaleString()}</p>
                      )}
                      {p.affiliate_platform && (
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{p.affiliate_platform}</span>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-brand-tx font-bold flex items-center gap-1">
                      ดูสินค้า
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setUploadedImage(null); setRoomType(null); setVibe(null) }}
            className="w-full py-3 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            เริ่มใหม่
          </button>
        </section>
      )}
    </div>
  )
}
