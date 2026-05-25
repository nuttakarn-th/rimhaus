"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertPartner, deletePartner } from "@/actions/portfolio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Partner } from "@/lib/types"

interface Props {
  partners: Partner[]
}

export function AdminPartners({ partners }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", logo_url: "" })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.logo_url.trim()) { toast.error("กรุณากรอก URL โลโก้"); return }
    setSaving(true)
    const result = await upsertPartner({
      name: form.name.trim() || null,
      logo_url: form.logo_url.trim(),
      sort_order: partners.length,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("เพิ่ม Partner สำเร็จ")
    setForm({ name: "", logo_url: "" })
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deletePartner(id)
    setDeletingId(null)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">All Partner</h3>

      {partners.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {partners.map(p => (
            <div key={p.id} className="relative group rounded-xl border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)] p-3 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logo_url} alt={p.name ?? ""} className="h-10 w-full object-contain" />
              {p.name && <p className="text-xs text-[hsl(25,10%,50%)] text-center truncate w-full">{p.name}</p>}
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="absolute top-1.5 right-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[hsl(25,10%,60%)]">ยังไม่มี Partner</p>
      )}

      {/* Add form */}
      <div className="border border-[hsl(35,20%,88%)] rounded-xl p-4 space-y-3 bg-white">
        <p className="text-xs font-semibold text-[hsl(25,20%,25%)]">เพิ่ม Partner ใหม่</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">ชื่อแบรนด์ (optional)</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ชื่อแบรนด์"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL โลโก้</Label>
            <Input
              value={form.logo_url}
              onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>
        {form.logo_url && (
          <div className="flex items-center gap-2 text-xs text-[hsl(25,10%,50%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.logo_url} alt="preview" className="h-8 object-contain border rounded p-0.5" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
            <span>Preview</span>
          </div>
        )}
        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {saving ? "กำลังบันทึก..." : "เพิ่ม"}
        </Button>
      </div>
    </div>
  )
}
