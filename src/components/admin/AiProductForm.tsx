"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertAiProduct } from "@/actions/ai-product.actions"
import { AI_STYLES, AI_ROOM_TYPES, AI_PRODUCT_CATEGORIES } from "@/lib/constants/ai-redesign"
import type { AiProduct } from "@/lib/types"

const PLATFORMS = ["shopee", "lazada", "homepro", "accesstrade", "other"]

export function AiProductForm({ product }: { product?: AiProduct }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? "",
    affiliate_url: product?.affiliate_url ?? "",
    affiliate_platform: product?.affiliate_platform ?? "",
    price: product?.price?.toString() ?? "",
    category: product?.category ?? AI_PRODUCT_CATEGORIES[0],
    image_url: product?.image_url ?? "",
    description: product?.description ?? "",
    room_types: product?.room_types ?? [] as string[],
    style_tags: product?.style_tags ?? [] as string[],
    is_active: product?.is_active ?? true,
  })

  function toggleArr(key: "room_types" | "style_tags", value: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.affiliate_url.trim()) {
      toast.error("กรุณากรอกชื่อสินค้าและลิงก์ Affiliate")
      return
    }
    setSaving(true)
    const result = await upsertAiProduct({
      id: product?.id,
      name: form.name.trim(),
      affiliate_url: form.affiliate_url.trim(),
      affiliate_platform: form.affiliate_platform || null,
      price: form.price ? parseFloat(form.price) : null,
      category: form.category,
      image_url: form.image_url.trim() || null,
      description: form.description.trim() || null,
      room_types: form.room_types,
      style_tags: form.style_tags,
      is_active: form.is_active,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(product ? "อัปเดตสำเร็จ" : "เพิ่มสินค้าสำเร็จ")
    router.push("/ai-products")
  }

  const fieldClass = "border border-[hsl(35,20%,88%)] rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]/30"
  const sectionLabel = "text-xs font-semibold text-[hsl(25,20%,25%)] mb-2 block"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className={sectionLabel}>ชื่อสินค้า *</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อสินค้า" required className={fieldClass} />
        </div>

        <div className="sm:col-span-2">
          <Label className={sectionLabel}>ลิงก์ Affiliate *</Label>
          <Input value={form.affiliate_url} onChange={e => setForm(f => ({ ...f, affiliate_url: e.target.value }))} placeholder="https://s.shopee.co.th/..." required className={fieldClass} />
        </div>

        <div>
          <Label className={sectionLabel}>แพลตฟอร์ม</Label>
          <select value={form.affiliate_platform} onChange={e => setForm(f => ({ ...f, affiliate_platform: e.target.value }))} className={fieldClass}>
            <option value="">— เลือก —</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <Label className={sectionLabel}>ราคา (บาท)</Label>
          <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className={fieldClass} />
        </div>

        <div>
          <Label className={sectionLabel}>หมวดหมู่</Label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={fieldClass}>
            {AI_PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <Label className={sectionLabel}>URL รูปสินค้า</Label>
          <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className={fieldClass} />
        </div>

        <div className="sm:col-span-2">
          <Label className={sectionLabel}>คำอธิบายสั้น</Label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${fieldClass} resize-none`} placeholder="เหตุผลว่าทำไมต้องสินค้าชิ้นนี้..." />
        </div>
      </div>

      <div>
        <label className={sectionLabel}>มุมบ้านที่เหมาะ</label>
        <div className="flex flex-wrap gap-2">
          {AI_ROOM_TYPES.map(r => (
            <button type="button" key={r.key} onClick={() => toggleArr("room_types", r.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${form.room_types.includes(r.key) ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={sectionLabel}>สไตล์ที่เหมาะ</label>
        <div className="flex flex-wrap gap-2">
          {AI_STYLES.map(s => (
            <button type="button" key={s.key} onClick={() => toggleArr("style_tags", s.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${form.style_tags.includes(s.key) ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-[hsl(35,20%,88%)]">
        <div>
          <p className="text-sm font-medium text-[hsl(25,20%,15%)]">แสดงสินค้า</p>
          <p className="text-xs text-[hsl(25,10%,55%)]">ปิดเพื่อซ่อนชั่วคราวโดยไม่ต้องลบ</p>
        </div>
        <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-[hsl(24,85%,50%)]" : "bg-[hsl(35,20%,80%)]"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? "กำลังบันทึก..." : product ? "อัปเดตสินค้า" : "เพิ่มสินค้า"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
      </div>
    </form>
  )
}
