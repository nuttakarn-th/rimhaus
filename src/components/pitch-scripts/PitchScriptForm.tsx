"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertPitchScript } from "@/actions/pitch-scripts.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { PitchScript, PitchCategory, Customer } from "@/lib/types"

const CATEGORY_LABELS: Record<PitchCategory, string> = {
  cold_outreach: "🧊 Cold Pitch ครั้งแรก",
  follow_up: "🔄 ติดตามผล",
  barter: "🤝 Barter / แลกเปลี่ยน",
  collab: "✨ Collaboration",
  general: "📋 ทั่วไป",
}

export function PitchScriptForm({
  script,
  customers,
}: {
  script?: PitchScript
  customers: Customer[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: script?.name ?? "",
    content: script?.content ?? "",
    category: (script?.category ?? "general") as PitchCategory,
    customer_id: script?.customer_id ?? "",
    notes: script?.notes ?? "",
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("กรุณากรอกชื่อ script"); return }
    if (!form.content.trim()) { toast.error("กรุณากรอกเนื้อหา"); return }
    setSaving(true)
    const result = await upsertPitchScript({
      id: script?.id,
      ...form,
      category: form.category as PitchCategory,
      customer_id: form.customer_id || null,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(script ? "แก้ไขสำเร็จ" : "บันทึก script สำเร็จ")
    router.push("/pitch-scripts")
    router.refresh()
  }

  return (
    <div className="space-y-5 max-w-xl">

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลทั่วไป</h3>

        <div className="space-y-1">
          <Label className="text-xs">ชื่อ script *</Label>
          <Input
            value={form.name}
            onChange={set("name")}
            placeholder="เช่น แนะนำตัวสั้น, Pitch ของแต่งบ้าน"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">ประเภท</Label>
          <select
            value={form.category}
            onChange={set("category")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {(Object.entries(CATEGORY_LABELS) as [PitchCategory, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">แบรนด์/ลูกค้า (ถ้ามี)</Label>
          <select
            value={form.customer_id}
            onChange={set("customer_id")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— ไม่ระบุ —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Script content */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">เนื้อหา *</h3>
          <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">ประโยคที่จะคัดลอกส่งให้ลูกค้า</p>
        </div>
        <Textarea
          rows={8}
          value={form.content}
          onChange={set("content")}
          placeholder={"สวัสดีครับ ผมชื่อ [ชื่อ] เพจ [ชื่อเพจ]\nมีผู้ติดตาม [X]K คนบน Facebook...\n\nอยากนำเสนอความร่วมมือกับแบรนด์ของคุณครับ"}
          className="font-mono text-sm resize-y"
        />
        <p className="text-xs text-[hsl(25,10%,60%)]">
          {form.content.length} ตัวอักษร
        </p>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">โน้ตส่วนตัว</h3>
        <Textarea
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          placeholder="จุดที่ต้องระวัง, context ที่ใช้ script นี้, ฯลฯ (ไม่ส่งให้ลูกค้า)"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : script ? "บันทึกการแก้ไข" : "บันทึก Script"}
        </Button>
      </div>
    </div>
  )
}
