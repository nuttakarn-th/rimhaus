import Link from "next/link"
import { getPitchScripts } from "@/actions/pitch-scripts.actions"
import { DeletePitchScriptButton } from "@/components/pitch-scripts/DeletePitchScriptButton"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Megaphone, Play } from "lucide-react"
import type { PitchCategory } from "@/lib/types"

const CATEGORY_LABELS: Record<PitchCategory, string> = {
  cold_outreach: "🧊 Cold Pitch",
  follow_up: "🔄 ติดตามผล",
  barter: "🤝 Barter",
  collab: "✨ Collab",
  general: "📋 ทั่วไป",
}

const CATEGORY_COLORS: Record<PitchCategory, string> = {
  cold_outreach: "bg-blue-50 text-blue-700",
  follow_up: "bg-amber-50 text-amber-700",
  barter: "bg-purple-50 text-purple-700",
  collab: "bg-green-50 text-green-700",
  general: "bg-gray-100 text-gray-600",
}

function highlightPlaceholders(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return parts.map((part, i) =>
    part.startsWith("[") && part.endsWith("]")
      ? <mark key={i} className="bg-orange-100 text-orange-700 font-semibold rounded px-0.5 not-italic">{part}</mark>
      : <span key={i}>{part}</span>
  )
}

export default async function PitchScriptsPage() {
  const scripts = await getPitchScripts()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">คีย์โน้ต</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">เลือก template → กรอกชื่อแบรนด์ → copy ส่งได้เลย</p>
        </div>
        <Link href="/pitch-scripts/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />เพิ่ม Template
          </Button>
        </Link>
      </div>

      {scripts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <Megaphone className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-sm text-[hsl(25,10%,50%)]">ยังไม่มี template</p>
          <p className="text-xs text-[hsl(25,10%,65%)] mt-1">
            สร้าง script โดยใส่ <span className="font-mono bg-orange-50 text-orange-700 px-1 rounded">[ชื่อแบรนด์]</span> เป็น placeholder
          </p>
          <Link href="/pitch-scripts/new" className="mt-4 inline-block">
            <Button size="sm" variant="outline">สร้าง Template แรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map(s => {
            const placeholders = [...new Set((s.content.match(/\[([^\]]+)\]/g) ?? []).map(m => m.slice(1, -1)))]
            return (
              <div key={s.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">{s.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[s.category]}`}>
                        {CATEGORY_LABELS[s.category]}
                      </span>
                    </div>
                    {placeholders.length > 0 && (
                      <p className="text-xs text-[hsl(25,10%,55%)] mt-1">
                        ต้องกรอก: {placeholders.map(p => (
                          <span key={p} className="inline-block font-mono bg-orange-50 text-orange-700 px-1 rounded mr-1">[{p}]</span>
                        ))}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/pitch-scripts/${s.id}/edit`}>
                      <Button size="sm" variant="ghost"><Pencil className="w-3.5 h-3.5" /></Button>
                    </Link>
                    <DeletePitchScriptButton id={s.id} name={s.name} />
                  </div>
                </div>

                {/* Content preview */}
                <div className="mx-5 mb-4 bg-[hsl(35,30%,97%)] rounded-lg p-3 border border-[hsl(35,20%,90%)]">
                  <p className="text-xs text-[hsl(25,20%,30%)] whitespace-pre-wrap line-clamp-3 leading-relaxed font-mono">
                    {highlightPlaceholders(s.content)}
                  </p>
                </div>

                {/* Use button */}
                <div className="px-5 pb-4">
                  <Link href={`/pitch-scripts/${s.id}/use`} className="block">
                    <Button className="w-full gap-2" size="sm">
                      <Play className="w-3.5 h-3.5" />
                      ใช้ Template นี้
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
