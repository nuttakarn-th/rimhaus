"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertPartner, deletePartner, reorderPartners } from "@/actions/portfolio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Upload, GripVertical } from "lucide-react"
import { toast } from "sonner"
import type { Partner } from "@/lib/types"

const MAX_LOGO_BYTES = 70 * 1024

async function compressToTarget(file: File, maxBytes: number): Promise<Blob> {
  if (file.size <= maxBytes) return file
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      const maxDim = 600
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

interface Props { partners: Partner[] }

export function AdminPartners({ partners }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<Partner[]>(partners)
  const [form, setForm] = useState({ name: "", logo_url: "" })
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => { setItems(partners) }, [partners])

  // ── Pointer drag (mouse + touch + stylus) ─────────────────────
  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const dragIdRef = useRef<string | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  function startDrag(e: React.PointerEvent, id: string) {
    e.preventDefault()
    dragIdRef.current = id

    const card = document.querySelector<HTMLElement>(`[data-partner-id="${id}"]`)
    if (!card) return
    const rect = card.getBoundingClientRect()
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    // Clone card into a floating ghost
    const ghost = card.cloneNode(true) as HTMLDivElement
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      opacity: "0.92",
      pointerEvents: "none",
      zIndex: "9999",
      boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
      transform: "scale(1.07)",
      borderRadius: "12px",
      transition: "none",
      cursor: "grabbing",
    })
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragIdRef.current) return

      // Move ghost
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - offsetRef.current.x}px`
        ghostRef.current.style.top = `${e.clientY - offsetRef.current.y}px`
      }

      // Detect card under pointer (hide ghost temporarily so it doesn't block hit test)
      if (ghostRef.current) ghostRef.current.style.visibility = "hidden"
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (ghostRef.current) ghostRef.current.style.visibility = ""

      const card = el?.closest<HTMLElement>("[data-partner-id]")
      const overId = card?.dataset.partnerId ?? null
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
      const card = el?.closest<HTMLElement>("[data-partner-id]")
      const toId = card?.dataset.partnerId ?? null
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

      const result = await reorderPartners(next.map(p => p.id))
      if (!result.success) toast.error("บันทึกลำดับไม่สำเร็จ")
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, []) // refs keep values current — no deps needed

  // ── Upload ─────────────────────────────────────────────────────
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

  // ── Add / Delete ───────────────────────────────────────────────
  async function handleAdd() {
    if (!form.logo_url.trim()) { toast.error("กรุณาอัปโหลดโลโก้ก่อน"); return }
    setSaving(true)
    const result = await upsertPartner({
      name: form.name.trim() || null,
      logo_url: form.logo_url.trim(),
      sort_order: items.length,
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
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">All Partner</h3>
        {items.length > 0 && (
          <span className="text-xs text-[hsl(25,10%,55%)]">จับที่ ⠿ เพื่อจัดเรียง</span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {items.map(p => (
            <div
              key={p.id}
              data-partner-id={p.id}
              className={[
                "relative rounded-xl border bg-[hsl(35,30%,97%)] p-2.5 flex flex-col items-center gap-1.5 select-none transition-all duration-150",
                dragIdRef.current === p.id ? "opacity-30 scale-95" : "",
                dragOverId === p.id
                  ? "border-[hsl(24,85%,50%)] bg-orange-50 ring-2 ring-[hsl(24,85%,50%)] ring-offset-1 scale-[1.03]"
                  : "border-[hsl(35,20%,88%)]",
              ].join(" ")}
            >
              {/* Grip handle — touch-action:none prevents page scroll while dragging */}
              <div
                onPointerDown={e => startDrag(e, p.id)}
                style={{ touchAction: "none" }}
                className="absolute top-1.5 left-1.5 p-0.5 cursor-grab active:cursor-grabbing text-[hsl(25,10%,65%)] hover:text-[hsl(25,10%,35%)]"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.logo_url}
                alt={p.name ?? ""}
                className="h-9 w-full object-contain pointer-events-none mt-1"
              />

              {p.name && (
                <p className="text-[10px] text-[hsl(25,10%,50%)] text-center truncate w-full leading-tight">
                  {p.name}
                </p>
              )}

              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {deletingId === p.id ? "..." : "ลบ"}
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
          <Label className="text-xs">
            โลโก้{" "}
            <span className="text-[hsl(25,10%,55%)] font-normal">— บีบอัดให้ ≤70KB อัตโนมัติ</span>
          </Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
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
              {uploading ? (uploadLabel || "กำลังอัปโหลด...") : "อัปโหลดโลโก้"}
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
