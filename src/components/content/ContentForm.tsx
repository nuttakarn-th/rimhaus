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
import { ContentBriefEditor } from "@/components/content/ContentBriefEditor"
import { PhotoAlbumUpload } from "@/components/content/PhotoAlbumUpload"
import { SceneTableEditor, sceneRowsToHTML, parseSceneRows, type SceneRow } from "@/components/content/SceneTableEditor"

interface ContentFormProps {
  item?: ContentItem
  jobs: ReviewJob[]
  platforms: Platform[]
  prefill?: { review_job_id?: string }
}

const VIDEO_TYPES = ["short_video", "long_video", "story", "reel"]

export function ContentForm({ item, jobs, platforms, prefill }: ContentFormProps) {
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
          caption: item.caption ?? "",
          images: item.images ?? [],
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
          caption: "",
          images: [],
          hashtags: "",
          status: "idea",
          is_sponsored: false,
          review_job_id: prefill?.review_job_id ?? null,
        }
  )

  const isVideoType = VIDEO_TYPES.includes(form.content_type)
  const isPhotoType = form.content_type === "photo"

  // Scene table mode
  const initialRows = item?.script ? parseSceneRows(item.script) : null
  const [scriptMode, setScriptMode] = useState<"table" | "editor">(initialRows ? "table" : "editor")
  const [sceneRows, setSceneRows] = useState<SceneRow[]>(initialRows ?? [{ scene: "", voiceover: "", text: "" }])

  function handleSceneRowsChange(rows: SceneRow[]) {
    setSceneRows(rows)
    setForm(p => ({ ...p, script: sceneRowsToHTML(rows) }))
  }

  function switchToTableMode() {
    setScriptMode("table")
    setForm(p => ({ ...p, script: sceneRowsToHTML(sceneRows) }))
  }

  function switchToEditorMode() {
    setScriptMode("editor")
    // strip the marker — keep only the HTML table in the editor
    const html = (form.script ?? "").replace(/^<!--scene-table:.*?-->/, "")
    setForm(p => ({ ...p, script: html }))
  }

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
    <form onSubmit={handleSubmit} className="max-w-6xl">
      {/* Desktop: 2-col (form left | editor right), Mobile: single col */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">

        {/* ── LEFT PANEL: form controls ───────────────────────────── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5">

          {/* Info section */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
            <h3 className="font-semibold text-sm">ข้อมูลคอนเทนต์</h3>
            <div className="space-y-2">
              <Label>ชื่อคอนเทนต์ *</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="เช่น รีวิวโซฟา IKEA SÖDERHAMN" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>ประเภท *</Label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">วันโพส</Label>
                <Input type="date" value={form.planned_date ?? ""} onChange={e => setForm(p => ({ ...p, planned_date: e.target.value || null }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">วันถ่าย</Label>
                <Input type="date" value={form.shoot_date ?? ""} onChange={e => setForm(p => ({ ...p, shoot_date: e.target.value || null }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox checked={form.is_sponsored} onCheckedChange={v => setForm(p => ({ ...p, is_sponsored: Boolean(v) }))} id="is_sponsored" />
              <Label htmlFor="is_sponsored" className="text-sm cursor-pointer">เป็นคอนเทนต์สปอนเซอร์</Label>
            </div>

            {jobs.length > 0 && (
              <div className="space-y-2">
                <Label>เชื่อมงานรีวิว</Label>
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

          {/* Idea notes */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
            <h3 className="font-semibold text-sm">ไอเดีย / โน้ต</h3>
            <Textarea value={form.idea_notes ?? ""} onChange={e => setForm(p => ({ ...p, idea_notes: e.target.value }))} rows={4} placeholder="จดไอเดีย จุดที่อยากพูด..." />
          </div>

          {/* Caption (Video + Photo) */}
          {(isVideoType || isPhotoType) && (
            <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Caption</h3>
                <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">รวม Emoji ได้</p>
              </div>
              <Textarea
                value={form.caption ?? ""}
                onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                rows={6}
                placeholder="เขียน Caption โพส... ✨"
                className="text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Hashtags */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
            <Label>Hashtags</Label>
            <Input value={form.hashtags ?? ""} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#แต่งบ้าน #รีวิว #homedesign" />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : item ? "บันทึกการแก้ไข" : "สร้างคอนเทนต์"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
          </div>
        </div>

        {/* ── RIGHT PANEL: editor / media ─────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* VIDEO: Story + Scene — toggle between table form and free editor */}
          {isVideoType && (
            <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
              {/* Header + toggle */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm">Story + Scene</h3>
                  <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">เขียน Story / Concept และ Script ตาม Scene</p>
                </div>
                {/* Mode toggle */}
                <div className="flex items-center gap-0.5 bg-[hsl(35,25%,93%)] rounded-lg p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={switchToTableMode}
                    className={[
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                      scriptMode === "table"
                        ? "bg-white shadow-sm text-[hsl(24,85%,50%)]"
                        : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,20%)]",
                    ].join(" ")}
                  >
                    📋 กรอกแบบฟอร์ม
                  </button>
                  <button
                    type="button"
                    onClick={switchToEditorMode}
                    className={[
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                      scriptMode === "editor"
                        ? "bg-white shadow-sm text-[hsl(24,85%,50%)]"
                        : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,20%)]",
                    ].join(" ")}
                  >
                    ✏️ แก้ไขเอง
                  </button>
                </div>
              </div>

              {/* Scene Table form mode */}
              {scriptMode === "table" && (
                <SceneTableEditor
                  rows={sceneRows}
                  onChange={handleSceneRowsChange}
                />
              )}

              {/* Free-form rich text editor mode */}
              {scriptMode === "editor" && (
                <ContentBriefEditor
                  value={form.script ?? ""}
                  onChange={v => setForm(p => ({ ...p, script: v }))}
                />
              )}
            </div>
          )}

          {/* PHOTO: Image grid upload */}
          {isPhotoType && (
            <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">ภาพ Draft</h3>
                <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">บีบอัดอัตโนมัติ ≤100KB/ภาพ</p>
              </div>
              <PhotoAlbumUpload
                images={form.images ?? []}
                onChange={imgs => setForm(p => ({ ...p, images: imgs }))}
              />
            </div>
          )}

          {/* BLOG: single script editor */}
          {!isVideoType && !isPhotoType && (
            <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">เนื้อหา / Script</h3>
                <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">เขียนเนื้อหาพร้อมแชร์ให้ลูกค้าเป็น PDF</p>
              </div>
              <ContentBriefEditor
                value={form.script ?? ""}
                onChange={v => setForm(p => ({ ...p, script: v }))}
              />
            </div>
          )}
        </div>

      </div>
    </form>
  )
}
