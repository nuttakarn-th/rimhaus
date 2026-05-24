"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertSettings } from "@/actions/ratecard.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { RateCardSettings } from "@/lib/types"

export function AdminSettings({ settings }: { settings: RateCardSettings | null }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    page_name: settings?.page_name ?? "",
    page_category: settings?.page_category ?? "",
    contact_line: settings?.contact_line ?? "",
    contact_email: settings?.contact_email ?? "",
    contact_phone: settings?.contact_phone ?? "",
    notes: (settings?.notes ?? []).join("\n"),
    image_url: settings?.image_url ?? "",
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/rate-card.${ext}`
    const { error } = await supabase.storage.from("rate-card").upload(path, file, { upsert: true })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setForm(p => ({ ...p, image_url: publicUrl }))
    await upsertSettings({ image_url: publicUrl })
    toast.success("อัปโหลดรูปสำเร็จ")
    setUploading(false)
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    const result = await upsertSettings({
      page_name: form.page_name,
      page_category: form.page_category,
      contact_line: form.contact_line,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      notes: form.notes.split("\n").map(s => s.trim()).filter(Boolean),
      image_url: form.image_url || null,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("บันทึกสำเร็จ")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Rate card image */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">รูป Rate Card</h3>
        {form.image_url && (
          <div className="rounded-xl overflow-hidden border border-[hsl(35,20%,88%)] max-h-64 flex items-center justify-center bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image_url} alt="Rate Card" className="max-h-64 object-contain" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploading ? "กำลังอัปโหลด..." : form.image_url ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
        </Button>
        {form.image_url && (
          <div className="space-y-1">
            <Label className="text-xs">หรือวาง URL รูปภาพ</Label>
            <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
          </div>
        )}
      </div>

      {/* Page info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ข้อมูลเพจ</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อเพจ</Label>
          <Input value={form.page_name} onChange={e => setForm(p => ({ ...p, page_name: e.target.value }))} placeholder="เมื่อไหร่บ้านจะเสร็จ?" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">หมวดหมู่</Label>
          <Input value={form.page_category} onChange={e => setForm(p => ({ ...p, page_category: e.target.value }))} placeholder="Home & Living, Home Decor" />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ข้อมูลติดต่อ</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Line</Label>
            <Input value={form.contact_line} onChange={e => setForm(p => ({ ...p, contact_line: e.target.value }))} placeholder="risa.rako" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">โทร</Label>
            <Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="093 137 7433" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="email@example.com" />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">เงื่อนไข (1 บรรทัด = 1 ข้อ)</h3>
        <Textarea rows={4} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={"เก็บค่าบริการ 2 งวด...\nราคาสุทธิ (Net)..."} />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </div>
  )
}
