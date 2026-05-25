"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertPortfolioItem, deletePortfolioItem } from "@/actions/portfolio.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Video, Image } from "lucide-react"
import { toast } from "sonner"
import type { PortfolioItem } from "@/lib/types"

interface Props {
  items: PortfolioItem[]
}

const EMPTY_FORM = { type: "video" as "video" | "photo", title: "", url: "" }

export function AdminPortfolio({ items }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const videos = items.filter(i => i.type === "video")
  const photos = items.filter(i => i.type === "photo")

  async function handleAdd() {
    if (!form.url.trim()) { toast.error("กรุณากรอก URL"); return }
    setSaving(true)
    const result = await upsertPortfolioItem({
      type: form.type,
      title: form.title.trim() || null,
      url: form.url.trim(),
      sort_order: items.filter(i => i.type === form.type).length,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("เพิ่มสำเร็จ")
    setForm(EMPTY_FORM)
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
            <Video className="w-3.5 h-3.5 text-[hsl(25,10%,50%)] shrink-0" />
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
          <Image className="w-3.5 h-3.5" /> Photo Album ({photos.length})
        </p>
        {photos.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2 text-sm">
            <Image className="w-3.5 h-3.5 text-[hsl(25,10%,50%)] shrink-0" />
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
            <Image className="w-3.5 h-3.5" /> Photo
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
            <Label className="text-xs">URL {form.type === "video" ? "(YouTube / Instagram / Facebook Reel)" : "(รูปภาพ / Facebook Album)"}</Label>
            <Input
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder={form.type === "video" ? "https://www.instagram.com/reel/..." : "https://www.facebook.com/share/p/..."}
            />
          </div>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={saving}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {saving ? "กำลังบันทึก..." : "เพิ่ม"}
        </Button>
      </div>
    </div>
  )
}
