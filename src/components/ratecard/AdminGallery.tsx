"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertGalleryItem, deleteGalleryItem, reorderGalleryItems } from "@/actions/gallery.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Upload, GripVertical } from "lucide-react"
import { toast } from "sonner"
import type { GalleryItem } from "@/lib/types"

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

interface Props { items: GalleryItem[] }

export function AdminGallery({ items: initialItems }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState(initialItems)
  const [caption, setCaption] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => { setItems(initialItems) }, [initialItems])

  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const dragIdRef = useRef<string | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  function startDrag(e: React.PointerEvent, id: string) {
    e.preventDefault()
    dragIdRef.current = id
    const card = document.querySelector<HTMLElement>(`[data-gallery-id="${id}"]`)
    if (!card) return
    const rect = card.getBoundingClientRect()
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const ghost = card.cloneNode(true) as HTMLDivElement
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      opacity: "0.9",
      pointerEvents: "none",
      zIndex: "9999",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      transform: "scale(1.05)",
      borderRadius: "12px",
      transition: "none",
    })
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragIdRef.current) return
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - offsetRef.current.x}px`
        ghostRef.current.style.top = `${e.clientY - offsetRef.current.y}px`
      }
      if (ghostRef.current) ghostRef.current.style.visibility = "hidden"
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (ghostRef.current) ghostRef.current.style.visibility = ""
      const card = el?.closest<HTMLElement>("[data-gallery-id]")
      const overId = card?.dataset.galleryId ?? null
      setDragOverId(overId && overId !== dragIdRef.current ? overId : null)
    }

    async function onUp(e: PointerEvent) {
      const fromId = dragIdRef.current
      dragIdRef.current = null
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current)
        ghostRef.current = null
      }
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const card = el?.closest<HTMLElement>("[data-gallery-id]")
      const toId = card?.dataset.galleryId ?? null
      setDragOverId(null)
      if (!fromId || !toId || fromId === toId) return
      const cur = itemsRef.current
      const fromIdx = cur.findIndex(p => p.id === fromId)
      const toIdx = cur.findIndex(p => p.id === toId)
      if (fromIdx < 0 || toIdx < 0) return
      const next = [...cur]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      setItems(next)
      const result = await reorderGalleryItems(next.map(p => p.id))
      if (!result.success) toast.error("บันทึกลำดับไม่สำเร็จ")
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, [])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const blob = await compressToTarget(file, MAX_BYTES)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/gallery/${Date.now()}.jpg`
    const { error } = await supabase.storage.from("rate-card").upload(path, blob, {
      upsert: false,
      contentType: "image/jpeg",
    })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setPreviewUrl(publicUrl)
    toast.success(`อัปโหลดสำเร็จ (${(blob.size / 1024).toFixed(0)}KB)`)
    setUploading(false)
  }

  async function handleAdd() {
    if (!previewUrl) { toast.error("กรุณาอัปโหลดรูปก่อน"); return }
    setSaving(true)
    const result = await upsertGalleryItem({
      image_url: previewUrl,
      caption: caption.trim() || null,
      sort_order: items.length,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("เพิ่มรูปสำเร็จ")
    setPreviewUrl("")
    setCaption("")
    if (fileRef.current) fileRef.current.value = ""
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteGalleryItem(id)
    setDeletingId(null)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">Gallery รูปภาพ</h3>
        {items.length > 0 && (
          <span className="text-xs text-[hsl(25,10%,55%)]">จับที่ ⠿ เพื่อจัดเรียง</span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {items.map(item => (
            <div
              key={item.id}
              data-gallery-id={item.id}
              className={[
                "relative rounded-xl border overflow-hidden select-none transition-all duration-150 aspect-square",
                dragOverId === item.id
                  ? "border-[hsl(24,85%,50%)] ring-2 ring-[hsl(24,85%,50%)] ring-offset-1 scale-[1.03]"
                  : "border-[hsl(35,20%,88%)]",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.caption ?? ""}
                className="w-full h-full object-cover pointer-events-none"
              />

              <div className="absolute top-1.5 left-1.5">
                <div
                  onPointerDown={e => startDrag(e, item.id)}
                  style={{ touchAction: "none" }}
                  className="p-1 rounded bg-black/40 cursor-grab active:cursor-grabbing text-white"
                >
                  <GripVertical className="w-3 h-3" />
                </div>
              </div>

              <div className="absolute top-1.5 right-1.5">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-1 rounded bg-black/40 text-white hover:bg-red-500/80 disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-[9px] text-white truncate">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[hsl(25,10%,60%)]">ยังไม่มีรูปใน Gallery</p>
      )}

      <div className="border border-[hsl(35,20%,88%)] rounded-xl p-4 space-y-3 bg-white">
        <p className="text-xs font-semibold text-[hsl(25,20%,25%)]">เพิ่มรูปใหม่</p>
        <div className="space-y-1">
          <Label className="text-xs">
            รูปภาพ{" "}
            <span className="text-[hsl(25,10%,55%)] font-normal">— บีบอัดให้ ≤100KB อัตโนมัติ</span>
          </Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          {previewUrl ? (
            <div className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="preview" className="h-12 w-12 object-cover border rounded" />
              <span className="text-xs text-[hsl(25,10%,55%)] flex-1">อัปโหลดแล้ว</span>
              <button
                onClick={() => { setPreviewUrl(""); if (fileRef.current) fileRef.current.value = "" }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ลบ
              </button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">คำอธิบาย (optional)</Label>
          <Input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="คำบรรยายรูป"
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={saving || !previewUrl}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {saving ? "กำลังบันทึก..." : "เพิ่มรูป"}
        </Button>
      </div>
    </div>
  )
}
