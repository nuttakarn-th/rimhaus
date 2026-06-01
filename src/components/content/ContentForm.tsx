"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { type ContentFormValues } from "@/actions/content.actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CONTENT_TYPES, CONTENT_STATUS_LABELS, CONTENT_PILLAR_LABELS } from "@/lib/constants"
import type { ContentItem, ReviewJob, Platform, ContentPillar } from "@/lib/types"
import { toast } from "sonner"
import { ContentBriefEditor } from "@/components/content/ContentBriefEditor"
import { PhotoAlbumUpload } from "@/components/content/PhotoAlbumUpload"
import { JobCombobox } from "@/components/content/JobCombobox"
import { ScriptGenerator } from "@/components/content/ScriptGenerator"

interface ContentFormProps {
  item?: ContentItem
  jobs: ReviewJob[]
  platforms: Platform[]
  prefill?: { review_job_id?: string }
}

const VIDEO_TYPES = ["short_video", "long_video", "story", "reel"]
const SCRIPT_GEN_TYPES = ["short_video", "long_video", "reel"]

const TH = `background-color:hsl(24,85%,88%);font-size:8pt;font-weight:600;padding:6px 8px;text-align:center;border:1px solid hsl(35,20%,82%);`
const TD = `font-size:7pt;padding:6px 8px;vertical-align:top;border:1px solid hsl(35,20%,82%);`

function esc(s: string) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>") }

function scriptResultToTable(r: { hook?:string; story?:string; solution?:string; cta?:string; full_script?:string }): string {
  const sections = [
    { label: "🪝 Hook", text: r.hook },
    { label: "📖 Story", text: r.story },
    { label: "💡 Solution", text: r.solution },
    { label: "📣 CTA", text: r.cta },
  ].filter(s => s.text)

  const rows = sections.length > 0
    ? sections.map(s => `<tr><td style="${TD}"></td><td style="${TD}"><strong>${s.label}</strong><br>${esc(s.text!)}</td><td style="${TD}"></td></tr>`).join("")
    : `<tr><td style="${TD}"></td><td style="${TD}">${esc(r.full_script ?? "")}</td><td style="${TD}"></td></tr>`

  return `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="${TH}">Scene / Visual</th><th style="${TH}">Voice Over</th><th style="${TH}">Text Pop-up</th></tr></thead><tbody>${rows}</tbody></table>`
}

export function ContentForm({ item, jobs, platforms, prefill }: ContentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
          content_pillar: item.content_pillar,
          is_sponsored: item.is_sponsored,
          link: item.link ?? "",
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
          content_pillar: null,
          is_sponsored: false,
          link: "",
          review_job_id: prefill?.review_job_id ?? null,
        }
  )

  const isVideoType = VIDEO_TYPES.includes(form.content_type)
  const isPhotoType = form.content_type === "photo"
  const isScriptGenType = SCRIPT_GEN_TYPES.includes(form.content_type)

  const TABLE_TEMPLATE = `<table><thead><tr><th>Scene / Visual</th><th>Voice Over</th><th>Text Pop-up</th></tr></thead><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>`
  const STORY_TEMPLATE = `<h2>Story / Concept</h2><p>เล่าเรื่องหรือแนวคิดหลักของคอนเทนต์...</p><h2>Scene</h2><p>Scene 1: ...</p><p>Scene 2: ...</p><p>Scene 3: ...</p>`

  // Strip legacy scene-table marker if present; keep only the HTML table
  const cleanScript = (form.script ?? "").replace(/^<!--scene-table:.*?-->/, "")
  const hasExistingScript = !!item?.script

  const [scriptMode, setScriptMode] = useState<"table" | "editor">(
    hasExistingScript ? "editor" : "table"
  )

  function switchToTableMode() { setScriptMode("table") }
  function switchToEditorMode() { setScriptMode("editor") }

  function togglePlatform(id: string) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(id) ? prev.platforms.filter(p => p !== id) : [...prev.platforms, id],
    }))
  }

  function startTimer() {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setElapsed(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast.error("กรุณากรอกชื่อคอนเทนต์"); return }
    setLoading(true)
    startTimer()

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("กรุณาเข้าสู่ระบบ"); stopTimer(); setLoading(false); return }

      const payload = { ...form, user_id: user.id }
      const { error } = item
        ? await supabase.from("content_items").update(payload).eq("id", item.id).eq("user_id", user.id)
        : await supabase.from("content_items").insert(payload)

      stopTimer()
      if (error) { toast.error(error.message); setLoading(false); return }

      toast.success(item ? "แก้ไขคอนเทนต์สำเร็จ" : "สร้างคอนเทนต์สำเร็จ")
      router.push(item ? `/content/${item.id}` : "/content")
      router.refresh()
    } catch (err) {
      stopTimer()
      setLoading(false)
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
      console.error(err)
    }
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
              <Label>Content Pillar</Label>
              <Select
                value={form.content_pillar ?? "none"}
                onValueChange={v => setForm(p => ({ ...p, content_pillar: v === "none" ? null : v as ContentPillar }))}
              >
                <SelectTrigger><SelectValue placeholder="เลือก pillar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— ไม่ระบุ —</SelectItem>
                  {(Object.entries(CONTENT_PILLAR_LABELS) as [ContentPillar, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <JobCombobox
                  jobs={jobs}
                  value={form.review_job_id ?? null}
                  onChange={id => setForm(p => ({ ...p, review_job_id: id }))}
                />
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

          {/* Link */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
            <div>
              <Label>Link ไฟล์ต้นฉบับ</Label>
              <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">จะแสดงปุ่ม "คลิกเพื่อดูภาพใหญ่" ใน Brief และ PDF</p>
            </div>
            <Input
              value={form.link ?? ""}
              onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
              placeholder="https://drive.google.com/... หรือ Dropbox / WeTransfer"
            />
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

              {/* Script AI Generator */}
              {isScriptGenType && (
                <ScriptGenerator
                  onApply={result => {
                    setForm(p => ({ ...p, script: scriptResultToTable(result) }))
                    setScriptMode("table")
                  }}
                />
              )}

              {/* Table mode — pre-filled 3-column table */}
              {scriptMode === "table" && (
                <ContentBriefEditor
                  value={cleanScript}
                  onChange={v => setForm(p => ({ ...p, script: v }))}
                  defaultContent={TABLE_TEMPLATE}
                />
              )}

              {/* Free-form editor mode */}
              {scriptMode === "editor" && (
                <ContentBriefEditor
                  value={cleanScript}
                  onChange={v => setForm(p => ({ ...p, script: v }))}
                  defaultContent={STORY_TEMPLATE}
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

      {/* Submit — always at the very bottom */}
      <div className="flex gap-3 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? `กำลังบันทึก... ${elapsed}s` : item ? "บันทึกการแก้ไข" : "สร้างคอนเทนต์"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
      </div>
    </form>
  )
}
