"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertPortfolioItem, deletePortfolioItem, reorderPortfolioItems } from "@/actions/portfolio.actions"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Video, Image as ImageIcon, Upload, Pencil, X, Check, GripVertical } from "lucide-react"
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

type EditForm = { title: string; url: string; image_url: string; type: "video" | "photo" }

interface ItemEditFormProps {
  item: PortfolioItem
  form: EditForm
  setForm: React.Dispatch<React.SetStateAction<EditForm>>
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

function ItemEditForm({ item, form, setForm, saving, onSave, onCancel }: ItemEditFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const blob = await compressToTarget(file, MAX_BYTES)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/portfolio-thumbs/${Date.now()}.jpg`
    const { error } = await supabase.storage.from("rate-card").upload(path, blob, { upsert: false, contentType: "image/jpeg" })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    toast.success(`อัปโหลด thumbnail สำเร็จ (${(blob.size / 1024).toFixed(0)}KB)`)
    setUploading(false)
  }

  return (
    <div className="border-2 border-[hsl(24,85%,50%)] rounded-xl p-4 space-y-3 bg-orange-50">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">ชื่อ</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ชื่อคลิป / อัลบั้ม" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL</Label>
          <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Thumbnail</Label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
        {form.image_url ? (
          <div className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(35,20%,88%)] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image_url} alt="" className={`object-cover border rounded ${item.type === "video" ? "w-7 h-12" : "w-9 h-12"}`} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs h-7">
              <Upload className="w-3 h-3 mr-1" />{uploading ? "กำลังอัปโหลด..." : "เปลี่ยนภาพ"}
            </Button>
            <button onClick={() => { setForm(f => ({ ...f, image_url: "" })); if (fileRef.current) fileRef.current.value = "" }} className="text-xs text-red-500 hover:text-red-700 ml-auto">ลบภาพ</button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-3.5 h-3.5 mr-1.5" />{uploading ? "กำลังอัปโหลด..." : "อัปโหลด Thumbnail"}
          </Button>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />ยกเลิก</Button>
        <Button size="sm" onClick={onSave} disabled={!form.url.trim() || saving}>
          <Check className="w-3.5 h-3.5 mr-1" />{saving ? "บันทึก..." : "บันทึก"}
        </Button>
      </div>
    </div>
  )
}

// ─── Single draggable row ────────────────────────────────────────────────────

interface SortableItemProps {
  item: PortfolioItem
  editId: string | null
  editForm: EditForm
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>
  editSaving: boolean
  deletingId: string | null
  onEdit: (item: PortfolioItem) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
}

function SortableItem({
  item, editId, editForm, setEditForm, editSaving, deletingId,
  onEdit, onSaveEdit, onCancelEdit, onDelete,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  if (editId === item.id) {
    return (
      <div ref={setNodeRef} style={style}>
        <ItemEditForm
          item={item}
          form={editForm}
          setForm={setEditForm}
          saving={editSaving}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2 text-sm group">
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[hsl(25,10%,65%)] hover:text-[hsl(25,10%,35%)] cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="ลาก"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" className={`object-cover rounded shrink-0 ${item.type === "video" ? "w-8 h-14" : "w-10 h-[52px]"}`} />
      ) : (
        <div className={`shrink-0 rounded border-2 border-dashed border-[hsl(35,20%,80%)] bg-[hsl(35,30%,95%)] flex flex-col items-center justify-center gap-0.5 ${item.type === "video" ? "w-8 h-14" : "w-10 h-[52px]"}`}>
          {item.type === "video"
            ? <Video className="w-3 h-3 text-[hsl(25,10%,65%)]" />
            : <ImageIcon className="w-3 h-3 text-[hsl(25,10%,65%)]" />}
          <span className="text-[7px] text-[hsl(25,10%,65%)] leading-none">ไม่มี</span>
        </div>
      )}

      <span className="flex-1 truncate text-[hsl(25,20%,25%)]">
        {item.title ? <><span className="font-medium">{item.title}</span> · </> : null}
        <span className="text-[hsl(25,10%,60%)]">{item.url}</span>
      </span>

      <button onClick={() => onEdit(item)} className="text-[hsl(25,10%,55%)] hover:text-[hsl(25,20%,15%)] transition-colors shrink-0">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDelete(item.id)} disabled={deletingId === item.id} className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Sortable group (videos or photos) ──────────────────────────────────────

interface SortableGroupProps {
  items: PortfolioItem[]
  onReorder: (newItems: PortfolioItem[]) => void
  editId: string | null
  editForm: EditForm
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>
  editSaving: boolean
  deletingId: string | null
  onEdit: (item: PortfolioItem) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
}

function SortableGroup({ items, onReorder, ...rowProps }: SortableGroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {items.map(item => (
            <SortableItem key={item.id} item={item} {...rowProps} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

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
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ type: "video", title: "", url: "", image_url: "" })
  const [editSaving, setEditSaving] = useState(false)

  const [videos, setVideos] = useState<PortfolioItem[]>(items.filter(i => i.type === "video"))
  const [photos, setPhotos] = useState<PortfolioItem[]>(items.filter(i => i.type === "photo"))

  function startEdit(item: PortfolioItem) {
    setEditId(item.id)
    setEditForm({ type: item.type, title: item.title ?? "", url: item.url, image_url: item.image_url ?? "" })
  }

  async function handleSaveEdit() {
    if (!editId || !editForm.url.trim()) return
    setEditSaving(true)
    const target = [...videos, ...photos].find(i => i.id === editId)
    const result = await upsertPortfolioItem({
      id: editId,
      type: editForm.type,
      title: editForm.title.trim() || null,
      url: editForm.url.trim(),
      image_url: editForm.image_url || null,
      sort_order: target?.sort_order ?? 99,
    })
    setEditSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("แก้ไขสำเร็จ")
    setEditId(null)
    router.refresh()
  }

  async function handleReorder(type: "video" | "photo", newOrder: PortfolioItem[]) {
    const setter = type === "video" ? setVideos : setPhotos
    setter(newOrder)
    await reorderPortfolioItems(newOrder.map((item, idx) => ({ id: item.id, sort_order: idx })))
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const blob = await compressToTarget(file, MAX_BYTES)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const path = `${user.id}/portfolio-thumbs/${Date.now()}.jpg`
    const { error } = await supabase.storage.from("rate-card").upload(path, blob, { upsert: false, contentType: "image/jpeg" })
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
      sort_order: (form.type === "video" ? videos : photos).length,
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
    setVideos(v => v.filter(i => i.id !== id))
    setPhotos(p => p.filter(i => i.id !== id))
    router.refresh()
  }

  const rowProps = { editId, editForm, setEditForm, editSaving, deletingId, onEdit: startEdit, onSaveEdit: handleSaveEdit, onCancelEdit: () => setEditId(null), onDelete: handleDelete }

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ตัวอย่าง Content</h3>

      {/* Short VDO */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[hsl(25,10%,50%)] flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5" /> Short VDO ({videos.length})
          <span className="text-[hsl(25,10%,65%)] font-normal">· ลากเพื่อจัดลำดับ</span>
        </p>
        <SortableGroup items={videos} onReorder={items => handleReorder("video", items)} {...rowProps} />
      </div>

      {/* Photo Album */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[hsl(25,10%,50%)] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Photo Album ({photos.length})
          <span className="text-[hsl(25,10%,65%)] font-normal">· ลากเพื่อจัดลำดับ</span>
        </p>
        <SortableGroup items={photos} onReorder={items => handleReorder("photo", items)} {...rowProps} />
      </div>

      {/* Add form */}
      <div className="border border-[hsl(35,20%,88%)] rounded-xl p-4 space-y-3 bg-white">
        <p className="text-xs font-semibold text-[hsl(25,20%,25%)]">เพิ่มรายการใหม่</p>
        <div className="flex gap-2">
          <button onClick={() => setForm(f => ({ ...f, type: "video" }))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === "video" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-[hsl(35,30%,97%)] text-[hsl(25,10%,50%)] hover:bg-[hsl(35,20%,92%)]"}`}>
            <Video className="w-3.5 h-3.5" /> Short VDO
          </button>
          <button onClick={() => setForm(f => ({ ...f, type: "photo" }))} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === "photo" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-[hsl(35,30%,97%)] text-[hsl(25,10%,50%)] hover:bg-[hsl(35,20%,92%)]"}`}>
            <ImageIcon className="w-3.5 h-3.5" /> Photo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">ชื่อ (optional)</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ชื่อคลิป / อัลบั้ม" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL {form.type === "video" ? "(Facebook / TikTok / Instagram)" : "(Facebook Album)"}</Label>
            <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder={form.type === "video" ? "https://www.instagram.com/reel/..." : "https://www.facebook.com/share/p/..."} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Thumbnail <span className="text-[hsl(25,10%,55%)] font-normal">— {form.type === "video" ? "9:16" : "3:4"} · บีบอัด ≤100KB อัตโนมัติ</span></Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
          {form.image_url ? (
            <div className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(35,20%,88%)] bg-[hsl(35,30%,97%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="thumbnail" className={`object-cover border rounded ${form.type === "video" ? "w-7 h-12" : "w-9 h-12"}`} />
              <span className="text-xs text-[hsl(25,10%,55%)] flex-1">อัปโหลดแล้ว</span>
              <button onClick={() => { setForm(f => ({ ...f, image_url: "" })); if (fileRef.current) fileRef.current.value = "" }} className="text-xs text-red-500 hover:text-red-700">ลบ</button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />{uploading ? "กำลังอัปโหลด..." : "อัปโหลด Thumbnail (optional)"}
            </Button>
          )}
        </div>
        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="w-3.5 h-3.5 mr-1" />{saving ? "กำลังบันทึก..." : "เพิ่ม"}
        </Button>
      </div>
    </div>
  )
}
