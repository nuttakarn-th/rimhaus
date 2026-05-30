"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertPortfolioItem, deletePortfolioItem } from "@/actions/portfolio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Video, Image as ImageIcon, Upload } from "lucide-react"
import { toast } from "sonner"
import type { PortfolioItem } from "@/lib/types"

const MAX_BYTES = 100 * 1024

async function compressToTarget(file: File, maxBytes: number): Promise<Blob> {
  if (file.size <= maxBytes) return file
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      const maxDim = 1200
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > maxDim || h > maxDim) {
        const r = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * r); h = Math.round(h * r)
      }
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
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
  items: PortfolioItem[]
}

const EMPTY_FORM = { type: "video" as "video" | "photo", title: "", url: "", image_url: "" }

export function AdminPortfolio({ items }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const videos = items.filter(i => i.type === "video")
  const photos = items.filter(i => i.type === "photo")

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const blob = await compressToTarget(file, MAX_BYTES)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/portfolio-thumbs/${Date.now()}.jpg`
    const { error } = await supabase.storage.from("rate-card").upload(path, blob, {
      upsert: false,
      contentType: "image/jpeg",
    })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    toast.success(`อัปโหลด thumbnail สำเร็จ (${(blob.size / 1024).toFixed(0)}KB)`)
    setUploading(false)
  }

  async function handleAdd() {
    if (!form.url.trim()) { toast.error("กรุณากรอก URL"); return }
    setSaving(true)
    const result = await upsertPortfolioItem({
      type: form.type,
      title: form.title.trim() || null,
      url: form.url.trim(),
      image_url: form.image_url || null,
      sort_order: items.filter(i => i.type === form.type).length,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("เพิ่มสำเร็จ")
    setForm(EMPTY_FORM)
    if (fileRef.current) fileRef.current.value = ""
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deletePortfolioItem(id)
    setDeletingId(null)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ตัวอย่าง Content</h3>

      {/* Short VDO list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[hsl(25,10%,50%)] flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5" /> Short VDO ({videos.length})
        </p>
        {videos.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2 text-sm">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt="" className="w-8 h-14 object-cover rounded shrink-0" />
            ) : (
              <Video className="w-3.5 h-3.5 text-[hsl(25,10%,50%)] shrink-0" />
            )}
            <span className="flex-1 truncate text-[hsl(25,20%,25%)]">
              {item.title ? <><span className="font-medium">{item.title}</span> · </> : null}
              <span className="text-[hsl(25,10%,60%)]">{item.url}</span>
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Photo list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[hsl(25,10%,50%)] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Photo Album ({photos.length})
        </p>
        {photos.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2 text-sm">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt="" className="w-10 h-[52px] object-cover rounded shrink-0" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-[hsl(25,10%,50%)] shrink-0" />
            )}
            <span className="flex-1 truncate text-[hsl(25,20%,25%)]">
              {item.title ? <><span className="font-medium">{item.title}</span> · </> : null}
              <span className="text-[hsl(25,10%,60%)]">{item.url}</span>
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="border border-[hsl(35,20%,88%)] rounded-xl p-4 space-y-3 bg-white">
        <p className="text-xs font-semibold text-[hsl(25,20%,25%)]">เพิ่มรายการใหม่</p>
        <div className="flex gap-2">
          <button
            onClick={() => setForm(f => ({ ...f, type: "video" }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === "video" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-[hsl(35,30%,97%)] text-[hsl(25,10%,50%)] hover:bg-[hsl(35,20%,92%)]"}`}
          >
            <Video className="w-3.5 h-3.5" /> Short VDO
          </button>
          <button
            onClick={() => setForm(f => ({ ...f, type: "photo" }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === "photo" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-[hsl(35,30%,97%)] text-[hsl(25,10%,50%)] hover:bg-[hsl(35,20%,92%)]"}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Photo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">ชื่อ (optional)</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ชื่อคลิป / อัลบั้ม"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL {form.type === "video" ? "(YouTube / Instagram / Facebook Reel)" : "(Facebook Album / รูปภาพ)"}</Label>
            <Input
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder={form.type === "video" ? "https://www.instagram.com/reel/..." : "https://www.facebook.com/share/p/..."}
            />
          </div>
        </div>

        {/* Thumbnail upload */}
        <div className="space-y-1">
          <Label className="text-xs">
            Thumbnail{" "}
            <span className="text-[hsl(25,10%,55%)] font-normal">
              — {form.type === "video" ? "อัตราส่วน 9:16" : "อัตราส่วน 3:4"} · บีบอัด ≤100KB อัตโนมัติ
            </span>
          </Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
          {form.image_url ? (
            <div className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image_url}
                alt="thumbnail"
                className={`object-cover border rounded ${form.type === "video" ? "w-7 h-12" : "w-9 h-12"}`}
              />
              <span className="text-xs text-[hsl(25,10%,55%)] flex-1">อัปโหลดแล้ว</span>
              <button
                onClick={() => { setForm(f => ({ ...f, image_url: "" })); if (fileRef.current) fileRef.current.value = "" }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ลบ
              </button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลด Thumbnail (optional)"}
            </Button>
          )}
        </div>

        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {saving ? "กำลังบันทึก..." : "เพิ่ม"}
        </Button>
      </div>
    </div>
  )
}
