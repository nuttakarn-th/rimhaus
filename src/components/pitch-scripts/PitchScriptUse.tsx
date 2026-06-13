"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, ChevronLeft, Wand2 } from "lucide-react"
import { toast } from "sonner"
import type { PitchScript, PitchCategory } from "@/lib/types"

const CATEGORY_LABELS: Record<PitchCategory, string> = {
  cold_outreach: "🧊 Cold Pitch",
  follow_up: "🔄 ติดตามผล",
  barter: "🤝 Barter",
  collab: "✨ Collab",
  general: "📋 ทั่วไป",
}

function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\[([^\]]+)\]/g) ?? []
  const seen = new Set<string>()
  const unique: string[] = []
  for (const m of matches) {
    const key = m.slice(1, -1)
    if (!seen.has(key)) { seen.add(key); unique.push(key) }
  }
  return unique
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\[([^\]]+)\]/g, (_, key) => values[key] || `[${key}]`)
}

export function PitchScriptUse({ script }: { script: PitchScript }) {
  const router = useRouter()
  const placeholders = useMemo(() => extractPlaceholders(script.content), [script.content])
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(placeholders.map(p => [p, ""]))
  )
  const [copied, setCopied] = useState(false)

  const preview = useMemo(() => fillTemplate(script.content, values), [script.content, values])
  const allFilled = placeholders.every(p => values[p]?.trim())

  function setValue(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(preview)
      setCopied(true)
      toast.success("คัดลอกแล้ว — วางใน LINE ได้เลย 🎉")
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error("คัดลอกไม่สำเร็จ")
    }
  }

  return (
    <div className="space-y-5 max-w-xl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.back()}
          className="mt-0.5 p-1.5 rounded-lg hover:bg-[hsl(35,25%,90%)] transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(25,20%,40%)]" />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[hsl(25,20%,15%)]">{script.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
              {CATEGORY_LABELS[script.category]}
            </span>
          </div>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">
            {placeholders.length > 0
              ? `กรอก ${placeholders.length} ช่องแล้ว Generate Script`
              : "Script นี้ไม่มี placeholder — คัดลอกได้เลย"}
          </p>
        </div>
      </div>

      {/* Step 1: Fill placeholders */}
      {placeholders.length > 0 && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[hsl(24,85%,50%)] text-white text-xs font-bold flex items-center justify-center">1</div>
            <h2 className="font-semibold text-sm text-[hsl(25,20%,15%)]">กรอกข้อมูล</h2>
          </div>

          <div className="space-y-3">
            {placeholders.map(p => (
              <div key={p} className="space-y-1">
                <Label className="text-xs font-semibold text-[hsl(24,85%,40%)]">[{p}]</Label>
                <Input
                  value={values[p] ?? ""}
                  onChange={e => setValue(p, e.target.value)}
                  placeholder={`กรอก${p}ที่นี่`}
                  className="bg-[hsl(35,30%,98%)] focus:bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          {placeholders.length > 0 && (
            <div className="w-6 h-6 rounded-full bg-[hsl(24,85%,50%)] text-white text-xs font-bold flex items-center justify-center">2</div>
          )}
          <h2 className="font-semibold text-sm text-[hsl(25,20%,15%)]">Preview Script</h2>
          {allFilled && placeholders.length > 0 && (
            <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
              <Wand2 className="w-3 h-3" /> พร้อม copy
            </span>
          )}
        </div>

        <div className={`rounded-lg p-4 border transition-colors ${
          allFilled || placeholders.length === 0
            ? "bg-[hsl(35,30%,97%)] border-[hsl(35,20%,88%)]"
            : "bg-[hsl(35,20%,95%)] border-dashed border-[hsl(35,20%,82%)]"
        }`}>
          <p className="text-sm text-[hsl(25,20%,15%)] whitespace-pre-wrap leading-relaxed font-mono">
            {preview}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-[hsl(25,10%,60%)]">{preview.length} ตัวอักษร</p>
          <Button
            onClick={handleCopy}
            disabled={!allFilled && placeholders.length > 0}
            className="gap-2"
          >
            {copied
              ? <><Check className="w-4 h-4" /> คัดลอกแล้ว!</>
              : <><Copy className="w-4 h-4" /> คัดลอก Script</>
            }
          </Button>
        </div>
      </div>

      {!allFilled && placeholders.length > 0 && (
        <p className="text-xs text-center text-[hsl(25,10%,55%)]">
          กรอกให้ครบทุกช่องก่อนถึงจะ copy ได้
        </p>
      )}
    </div>
  )
}
