"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createContentItem, updateContentItem, type ContentFormValues } from "@/actions/content.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CONTENT_TYPES, CONTENT_STATUS_LABELS } from "@/lib/constants"
import type { ContentItem, ReviewJob, Platform } from "@/lib/types"
import { toast } from "sonner"

interface ContentFormProps {
  item?: ContentItem
  jobs: ReviewJob[]
  platforms: Platform[]
}

export function ContentForm({ item, jobs, platforms }: ContentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ContentFormValues>(
    item
      ? {
          title: item.title,
          description: item.description ?? "",
          content_type: item.content_type,
          platforms: item.platforms,
          planned_date: item.planned_date,
          shoot_date: item.shoot_date,
          idea_notes: item.idea_notes ?? "",
          script: item.script ?? "",
          hashtags: item.hashtags ?? "",
          status: item.status,
          is_sponsored: item.is_sponsored,
          review_job_id: item.review_job_id,
        }
      : {
          title: "",
          description: "",
          content_type: "short_video",
          platforms: [],
          planned_date: null,
          shoot_date: null,
          idea_notes: "",
          script: "",
          hashtags: "",
          status: "idea",
          is_sponsored: false,
          review_job_id: null,
        }
  )

  function togglePlatform(id: string) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(id) ? prev.platforms.filter(p => p !== id) : [...prev.platforms, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast.error("กรุณากรอกชื่อคอนเทนต์"); return }
    setLoading(true)

    const result = item ? await updateContentItem(item.id, form) : await createContentItem(form)
    if (!result.success) { toast.error(result.error); setLoading(false); return }

    toast.success(item ? "แก้ไขคอนเทนต์สำเร็จ" : "สร้างคอนเทนต์สำเร็จ")
    router.push(item ? `/content/${item.id}` : "/content")
    router.refresh()
  }

  const statusOptions = Object.entries(CONTENT_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold">ข้อมูลคอนเทนต์</h3>
        <div className="space-y-2">
          <Label>ชื่อคอนเทนต์ *</Label>
          <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="เช่น รีวิวโซฟา IKEA SÖDERHAMN" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ประเภทคอนเทนต์ *</Label>
            <Select value={form.content_type} onValueChange={v => setForm(p => ({ ...p, content_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>สถานะ</Label>
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as ContentFormValues["status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <Label>แพลตฟอร์ม</Label>
          <div className="flex flex-wrap gap-3">
            {platforms.filter(p => p.is_active).map(p => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.platforms.includes(p.id)} onCheckedChange={() => togglePlatform(p.id)} />
                <span className="text-sm font-medium" style={{ color: form.platforms.includes(p.id) ? p.color : undefined }}>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>วันที่วางแผนจะโพส</Label>
            <Input type="date" value={form.planned_date ?? ""} onChange={e => setForm(p => ({ ...p, planned_date: e.target.value || null }))} />
          </div>
          <div className="space-y-2">
            <Label>วันถ่าย/ผลิต</Label>
            <Input type="date" value={form.shoot_date ?? ""} onChange={e => setForm(p => ({ ...p, shoot_date: e.target.value || null }))} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox checked={form.is_sponsored} onCheckedChange={v => setForm(p => ({ ...p, is_sponsored: Boolean(v) }))} id="is_sponsored" />
          <Label htmlFor="is_sponsored">เป็นคอนเทนต์สปอนเซอร์</Label>
        </div>

        {jobs.length > 0 && (
          <div className="space-y-2">
            <Label>เชื่อมกับงานรีวิว (ไม่บังคับ)</Label>
            <Select value={form.review_job_id ?? "none"} onValueChange={v => setForm(p => ({ ...p, review_job_id: v === "none" ? null : v }))}>
              <SelectTrigger><SelectValue placeholder="เลือกงาน..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่เชื่อมกับงานไหน</SelectItem>
                {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.brand_name} — {j.product_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold">ไอเดียและสคริปต์</h3>
        <div className="space-y-2">
          <Label>ไอเดีย / โน้ต</Label>
          <Textarea value={form.idea_notes ?? ""} onChange={e => setForm(p => ({ ...p, idea_notes: e.target.value }))} rows={3} placeholder="จดไอเดีย จุดที่อยากพูด..." />
        </div>
        <div className="space-y-2">
          <Label>สคริปต์</Label>
          <Textarea value={form.script ?? ""} onChange={e => setForm(p => ({ ...p, script: e.target.value }))} rows={5} placeholder="เขียนสคริปต์ที่นี่..." />
        </div>
        <div className="space-y-2">
          <Label>Hashtags</Label>
          <Input value={form.hashtags ?? ""} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#แต่งบ้าน #รีวิว #homedesign" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : item ? "บันทึกการแก้ไข" : "สร้างคอนเทนต์"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
      </div>
    </form>
  )
}
