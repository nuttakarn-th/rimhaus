"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  upsertGalleryItem, deleteGalleryItem, reorderGalleryItems,
  upsertAlbum, deleteAlbum,
} from "@/actions/gallery.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Upload, GripVertical, ChevronLeft, FolderOpen, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import type { GalleryAlbum, GalleryItem } from "@/lib/types"

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
  albums: GalleryAlbum[]
  items: GalleryItem[]
}

export function AdminGallery({ albums: initialAlbums, items: initialItems }: Props) {
  const router = useRouter()
  const [albums, setAlbums] = useState(initialAlbums)
  const [items, setItems] = useState(initialItems)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)

  useEffect(() => { setAlbums(initialAlbums) }, [initialAlbums])
  useEffect(() => { setItems(initialItems) }, [initialItems])

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId) ?? null
  const albumItems = selectedAlbumId ? items.filter(i => i.album_id === selectedAlbumId) : []

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {selectedAlbum && (
          <button
            onClick={() => setSelectedAlbumId(null)}
            className="p-1 rounded hover:bg-[hsl(35,20%,93%)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[hsl(25,20%,40%)]" />
          </button>
        )}
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">
          {selectedAlbum ? selectedAlbum.name : "Gallery Albums"}
        </h3>
        {!selectedAlbum && (
          <span className="text-xs text-[hsl(25,10%,55%)] ml-auto">{albums.length} อัลบั้ม</span>
        )}
        {selectedAlbum && (
          <span className="text-xs text-[hsl(25,10%,55%)] ml-auto">{albumItems.length} รูป</span>
        )}
      </div>

      {selectedAlbum ? (
        <AlbumDetail
          album={selectedAlbum}
          items={albumItems}
          allItems={items}
          setItems={setItems}
          setAlbums={setAlbums}
          onBack={() => setSelectedAlbumId(null)}
          router={router}
        />
      ) : (
        <AlbumList
          albums={albums}
          items={items}
          setAlbums={setAlbums}
          onSelect={id => setSelectedAlbumId(id)}
          router={router}
        />
      )}
    </div>
  )
}

// ── Album List ────────────────────────────────────────────────────

function AlbumList({
  albums,
  items,
  setAlbums,
  onSelect,
  router,
}: {
  albums: GalleryAlbum[]
  items: GalleryItem[]
  setAlbums: (fn: (prev: GalleryAlbum[]) => GalleryAlbum[]) => void
  onSelect: (id: string) => void
  router: ReturnType<typeof useRouter>
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    const result = await upsertAlbum({ name: newName.trim(), description: newDesc.trim() || null, sort_order: albums.length })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("สร้าง Album สำเร็จ")
    setAlbums(prev => [...prev, result.data])
    setNewName("")
    setNewDesc("")
    setCreating(false)
    router.refresh()
  }

  async function handleRename(album: GalleryAlbum) {
    if (!editName.trim()) { setEditingId(null); return }
    const nameChanged = editName.trim() !== album.name
    const descChanged = editDesc.trim() !== (album.description ?? "")
    if (!nameChanged && !descChanged) { setEditingId(null); return }
    const result = await upsertAlbum({ id: album.id, name: editName.trim(), description: editDesc.trim() || null })
    if (!result.success) { toast.error(result.error); return }
    toast.success("แก้ไขแล้ว")
    setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, name: editName.trim(), description: editDesc.trim() || null } : a))
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบ Album นี้? รูปทั้งหมดใน Album จะถูกยกเลิกการจัดกลุ่ม")) return
    setDeletingId(id)
    const result = await deleteAlbum(id)
    setDeletingId(null)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบ Album แล้ว")
    setAlbums(prev => prev.filter(a => a.id !== id))
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {albums.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {albums.map(album => {
            const cover = items.find(i => i.album_id === album.id && i.image_url)
            const count = items.filter(i => i.album_id === album.id).length
            return (
              <div
                key={album.id}
                className="relative rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden bg-white group cursor-pointer"
                onClick={() => onSelect(album.id)}
              >
                {/* Cover */}
                <div className="aspect-video bg-[hsl(35,30%,93%)] relative overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-[hsl(35,20%,75%)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Info */}
                <div className="px-3 py-2 flex items-center justify-between gap-2">
                  {editingId === album.id ? (
                    <div className="flex flex-col gap-1 flex-1" onClick={e => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="ชื่อ Album"
                        className="h-6 text-xs px-2 py-0"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") handleRename(album)
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="คำอธิบาย (ไม่บังคับ)"
                          className="h-6 text-xs px-2 py-0"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleRename(album)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                        />
                        <button onClick={() => handleRename(album)} className="text-green-600 hover:text-green-700 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-[hsl(25,10%,50%)] hover:text-[hsl(25,10%,30%)] shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[hsl(25,20%,15%)] truncate">{album.name}</p>
                      <p className="text-[10px] text-[hsl(25,10%,55%)] truncate">{album.description ?? `${count} รูป`}</p>
                    </div>
                  )}

                  {editingId !== album.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingId(album.id); setEditName(album.name); setEditDesc(album.description ?? "") }}
                        className="p-1 rounded hover:bg-[hsl(35,20%,90%)] text-[hsl(25,10%,50%)] transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        disabled={deletingId === album.id}
                        className="p-1 rounded hover:bg-red-50 text-[hsl(25,10%,50%)] hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-[hsl(25,10%,60%)]">ยังไม่มี Album — สร้างใหม่ได้เลย</p>
      )}

      {creating ? (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-[hsl(24,85%,50%)] bg-orange-50/30">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="ชื่อ Album เช่น Livingroom, Kitchen"
            className="text-sm"
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter") handleCreate()
              if (e.key === "Escape") { setCreating(false); setNewName(""); setNewDesc("") }
            }}
          />
          <Input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="คำอธิบาย เช่น รีวิวเฟอร์นิเจอร์และของตกแต่ง (ไม่บังคับ)"
            className="text-sm"
            onKeyDown={e => {
              if (e.key === "Enter") handleCreate()
              if (e.key === "Escape") { setCreating(false); setNewName(""); setNewDesc("") }
            }}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving || !newName.trim()}>
              {saving ? "..." : "สร้าง"}
            </Button>
            <button onClick={() => { setCreating(false); setNewName(""); setNewDesc("") }} className="text-[hsl(25,10%,50%)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          สร้าง Album ใหม่
        </Button>
      )}
    </div>
  )
}

// ── Album Detail ──────────────────────────────────────────────────

function AlbumDetail({
  album,
  items,
  allItems,
  setItems,
  setAlbums,
  onBack,
  router,
}: {
  album: GalleryAlbum
  items: GalleryItem[]
  allItems: GalleryItem[]
  setItems: (fn: (prev: GalleryItem[]) => GalleryItem[]) => void
  setAlbums: (fn: (prev: GalleryAlbum[]) => GalleryAlbum[]) => void
  onBack: () => void
  router: ReturnType<typeof useRouter>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

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
      position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width}px`, opacity: "0.9", pointerEvents: "none",
      zIndex: "9999", boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      transform: "scale(1.05)", borderRadius: "12px", transition: "none",
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
        ghostRef.current.style.visibility = "hidden"
      }
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (ghostRef.current) ghostRef.current.style.visibility = ""
      const card = el?.closest<HTMLElement>("[data-gallery-id]")
      const overId = card?.dataset.galleryId ?? null
      setDragOverId(overId && overId !== dragIdRef.current ? overId : null)
    }
    async function onUp(e: PointerEvent) {
      const fromId = dragIdRef.current
      dragIdRef.current = null
      if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null }
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
      setItems(prev => {
        const otherItems = prev.filter(i => i.album_id !== album.id)
        return [...otherItems, ...next]
      })
      const result = await reorderGalleryItems(next.map(p => p.id))
      if (!result.success) { toast.error("บันทึกลำดับไม่สำเร็จ"); return }
      // Update album cover to match new first image
      if (next.length > 0 && next[0].image_url !== album.cover_image_url) {
        await upsertAlbum({ id: album.id, name: album.name, cover_image_url: next[0].image_url })
        setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, cover_image_url: next[0].image_url } : a))
      }
    }
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, [album.id, setItems])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    let successCount = 0
    const baseOrder = itemsRef.current.filter(i => i.album_id === album.id).length

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`${i + 1}/${files.length}`)
      const blob = await compressToTarget(files[i], MAX_BYTES)
      const path = `${user.id}/gallery/${Date.now()}-${i}.jpg`
      const { error: uploadErr } = await supabase.storage.from("rate-card").upload(path, blob, { upsert: false, contentType: "image/jpeg" })
      if (uploadErr) { toast.error(`รูปที่ ${i + 1}: อัปโหลดไม่สำเร็จ`); continue }
      const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)

      const result = await upsertGalleryItem({
        image_url: publicUrl,
        caption: null,
        album_id: album.id,
        sort_order: baseOrder + successCount,
      })
      if (!result.success) { toast.error(result.error); continue }

      if (baseOrder === 0 && successCount === 0) {
        await upsertAlbum({ id: album.id, name: album.name, cover_image_url: publicUrl })
        setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, cover_image_url: publicUrl } : a))
      }

      setItems(prev => [...prev, result.data])
      successCount++
    }

    if (successCount > 0)
      toast.success(files.length === 1 ? "เพิ่มรูปสำเร็จ" : `เพิ่ม ${successCount}/${files.length} รูปสำเร็จ`)
    setUploading(false)
    setUploadProgress("")
    if (fileRef.current) fileRef.current.value = ""
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteGalleryItem(id)
    setDeletingId(null)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      // Update album cover if deleted item was the cover
      const remaining = next.filter(i => i.album_id === album.id)
      if (remaining.length > 0 && !allItems.find(i => i.id !== id && i.image_url === album.cover_image_url)) {
        upsertAlbum({ id: album.id, name: album.name, cover_image_url: remaining[0].image_url })
        setAlbums(prev2 => prev2.map(a => a.id === album.id ? { ...a, cover_image_url: remaining[0].image_url } : a))
      }
      return next
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <>
          <p className="text-xs text-[hsl(25,10%,55%)]">จับที่ ⠿ เพื่อจัดเรียง</p>
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
                <img src={item.image_url} alt={item.caption ?? ""} className="w-full h-full object-cover pointer-events-none" />
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
        </>
      ) : (
        <p className="text-xs text-[hsl(25,10%,60%)]">ยังไม่มีรูปใน Album นี้</p>
      )}

      <div className="border border-[hsl(35,20%,88%)] rounded-xl p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[hsl(25,20%,25%)]">เพิ่มรูปใหม่</p>
          <span className="text-[10px] text-[hsl(25,10%,55%)]">บีบอัดให้ ≤100KB อัตโนมัติ</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[hsl(35,20%,85%)] hover:border-[hsl(24,85%,55%)] hover:bg-orange-50/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 rounded-full border-2 border-[hsl(24,85%,50%)] border-t-transparent animate-spin" />
              <span className="text-xs font-medium text-[hsl(25,20%,40%)]">กำลังอัปโหลด {uploadProgress}...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-[hsl(25,10%,55%)]" />
              <span className="text-xs font-medium text-[hsl(25,20%,40%)]">เลือกรูปภาพ</span>
              <span className="text-[10px] text-[hsl(25,10%,60%)]">เลือกได้หลายรูปพร้อมกัน</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
