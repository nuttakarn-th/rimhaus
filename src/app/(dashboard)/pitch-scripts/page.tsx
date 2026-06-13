import Link from "next/link"
import { getPitchScripts } from "@/actions/pitch-scripts.actions"
import { getCustomers } from "@/actions/customers.actions"
import { DeletePitchScriptButton } from "@/components/pitch-scripts/DeletePitchScriptButton"
import { CopyScriptButton } from "@/components/pitch-scripts/CopyScriptButton"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Megaphone } from "lucide-react"
import type { PitchCategory, Customer } from "@/lib/types"

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

export default async function PitchScriptsPage() {
  const [scripts, customers] = await Promise.all([getPitchScripts(), getCustomers()])
  const customerMap = Object.fromEntries(customers.map((c: Customer) => [c.id, c.name]))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">คีย์โน้ต</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">Script แนะนำตัวก่อนเปิดการขาย — กดคัดลอกแล้ววางใน LINE ได้เลย</p>
        </div>
        <Link href="/pitch-scripts/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />เพิ่ม Script
          </Button>
        </Link>
      </div>

      {scripts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <Megaphone className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-sm text-[hsl(25,10%,50%)]">ยังไม่มี script</p>
          <p className="text-xs text-[hsl(25,10%,65%)] mt-1">สร้าง script แนะนำตัวไว้ใช้ pitch แบรนด์</p>
          <Link href="/pitch-scripts/new" className="mt-4 inline-block">
            <Button size="sm" variant="outline">สร้าง Script แรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">{s.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[s.category]}`}>
                      {CATEGORY_LABELS[s.category]}
                    </span>
                  </div>
                  {s.customer_id && customerMap[s.customer_id] && (
                    <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">
                      แบรนด์: {customerMap[s.customer_id]}
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

              <div className="bg-[hsl(35,30%,97%)] rounded-lg p-3 border border-[hsl(35,20%,90%)]">
                <p className="text-sm text-[hsl(25,20%,20%)] whitespace-pre-wrap line-clamp-4 leading-relaxed font-mono">
                  {s.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(25,10%,60%)]">{s.content.length} ตัวอักษร</p>
                <CopyScriptButton content={s.content} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
