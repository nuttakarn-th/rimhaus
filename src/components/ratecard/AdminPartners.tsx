"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertPartner, deletePartner } from "@/actions/portfolio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Upload } from "lucide-react"
import { toast } from "sonner"
import type { Partner } from "@/lib/types"

const MAX_LOGO_BYTES = 70 * 1024 // 70KB target

async function compressToTarget(file: File, maxBytes: number): Promise<Blob> {
  if (file.size <= maxBytes) return file
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      // Scale down to max 600px on longest side — enough for logos
      const maxDim = 600
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > maxDim || h > maxDim) {
        const r = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * r); h = Math.round(h * r)
      }
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff" // white bg for PNG→JPEG
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      // Try JPEG at decreasing quality until under maxBytes
      let quality = 0.85
      const attempt = () => {
        canvas.toBlob(blob => {
          if (!blob) { resolve(file); return }
          if (blob.size <= maxBytes || quality < 0.1) { resolve(blob); return }
          quality = Math.max(0.05, quality - 0.15)
          attempt()
        }, "image/jpeg", quality)
      }
      attempt()
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

interface Props {
  partners: Partner[]
}

export function AdminPartners({ partners }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: "", logo_url: "" })
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadLabel(file.size > MAX_LOGO_BYTES ? "กำลังบีบอัดภาพ..." : "กำลังอัปโหลด...")

    const blob = await compressToTarget(file, MAX_LOGO_BYTES)
    const finalKb = (blob.size / 1024).toFixed(0)

    setUploadLabel("กำลังอัปโหลด...")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const path = `${user.id}/partners/${Date.now()}.jpg`
    const { error } = await supabase.storage.from("rate-card").upload(path, blob, {
      upsert: false,
      contentType: "image/jpeg",
    })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setForm(f => ({ ...f, logo_url: publicUrl }))
    toast.success(`อัปโหลดสำเร็จ (${finalKb}KB)`)
    setUploading(false)
    setUploadLabel("")
  }

  async function handleAdd() {
    if (!form.logo_url.trim()) { toast.error("กรุณาอัปโหลดโลโก้ก่อน"); return }
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
    if (fileRef.current) fileRef.current.value = ""
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

        <div className="space-y-1">
          <Label className="text-xs">ชื่อแบรนด์ (optional)</Label>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ชื่อแบรนด์"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">โลโก้ <span className="text-[hsl(25,10%,55%)] font-normal">— ระบบจะบีบอัดให้ ≤70KB อัตโนมัติ</span></Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          {form.logo_url ? (
            <div className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.logo_url} alt="preview" className="h-8 w-16 object-contain border rounded bg-white p-0.5" />
              <span className="text-xs text-[hsl(25,10%,55%)] flex-1">อัปโหลดแล้ว</span>
              <button
                onClick={() => { setForm(f => ({ ...f, logo_url: "" })); if (fileRef.current) fileRef.current.value = "" }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ลบ
              </button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {uploading ? uploadLabel || "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
            </Button>
          )}
        </div>

        <Button size="sm" onClick={handleAdd} disabled={saving || !form.logo_url}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {saving ? "กำลังบันทึก..." : "เพิ่ม"}
        </Button>
      </div>
    </div>
  )
}
