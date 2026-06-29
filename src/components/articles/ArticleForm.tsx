"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { upsertArticle } from "@/actions/article.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ContentBriefEditor } from "@/components/content/ContentBriefEditor"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { X, Upload, Loader2 } from "lucide-react"
import type { Article } from "@/lib/types"

const BUCKET = "content-images"

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

async function resizeImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise(resolve => {
    const img = new window.Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob ?? file), "image/jpeg", quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const slugEdited = useRef(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    cover_image_url: article?.cover_image_url ?? "",
    category: article?.category ?? "",
    status: (article?.status ?? "draft") as "draft" | "published",
    tags: article?.tags ?? [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(p => ({ ...p, title, slug: slugEdited.current ? p.slug : toSlug(title) }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugEdited.current = true
    setForm(p => ({ ...p, slug: e.target.value }))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !form.tags.includes(tag)) setForm(p => ({ ...p, tags: [...p.tags, tag] }))
      setTagInput("")
    }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("กรุณาล็อกอินก่อน"); return }
      const resized = await resizeImage(file, 1200, 0.85)
      const path = `${user.id}/${Date.now()}-cover.jpg`
      const { error } = await supabase.storage.from(BUCKET).upload(path, resized, { contentType: "image/jpeg", upsert: false })
      if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); return }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      setForm(p => ({ ...p, cover_image_url: data.publicUrl }))
      toast.success("อัปโหลดรูปปกสำเร็จ")
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด")
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleSave(statusOverride?: "draft" | "published") {
    if (!form.title.trim()) { toast.error("กรุณากรอกชื่อบทความ"); return }
    setSaving(true)
    const status = statusOverride ?? form.status
    const result = await upsertArticle({
      id: article?.id,
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_image_url: form.cover_image_url || null,
      category: form.category || null,
      tags: form.tags,
      status,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(status === "published" ? "เผยแพร่บทความสำเร็จ" : "บันทึกฉบับร่างสำเร็จ")
    router.push("/articles")
    router.refresh()
  }

  const wordCount = form.content.replace(/<[^>]*>/g, "").trim().length

  return (
    <div className="max-w-5xl space-y-4">

      {/* Title + Slug bar */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <input
          value={form.title}
          onChange={handleTitleChange}
          placeholder="ชื่อบทความ..."
          className="w-full text-xl font-semibold border-0 outline-none placeholder:text-muted-foreground/40 bg-transparent"
        />
        <div className="flex items-center gap-2 pt-1 border-t border-[hsl(35,20%,92%)]">
          <span className="text-xs text-muted-foreground shrink-0 font-mono">/blog/</span>
          <Input
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="article-slug"
            className="font-mono text-xs text-muted-foreground h-7 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">

        {/* Left: excerpt + content editor */}
        <div className="space-y-4">

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
            <Label className="text-xs text-muted-foreground">บทสรุปย่อ (แสดงใน preview card และ SEO)</Label>
            <Textarea
              rows={2}
              value={form.excerpt}
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="สรุปสั้นๆ ว่าบทความนี้พูดถึงอะไร..."
              className="resize-none text-sm"
            />
          </div>

          {/* Rich-text content */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[hsl(35,20%,92%)]">
              <span className="text-xs font-semibold text-[hsl(25,20%,20%)]">เนื้อหา</span>
            </div>
            <ContentBriefEditor
              value={form.content}
              onChange={content => setForm(p => ({ ...p, content }))}
              placeholder="เริ่มเขียนบทความที่นี่..."
            />
            <div className="px-4 py-2 border-t border-[hsl(35,20%,92%)] text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{wordCount.toLocaleString()} ตัวอักษร</span>
              <span className="text-[10px] opacity-60">รองรับ Bold · Italic · Heading · ตาราง · ลิงก์ · รูปภาพ</span>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 lg:sticky lg:top-[72px]">

          {/* Publish actions */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">การเผยแพร่</h3>
              {article && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  form.status === "published"
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {form.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
              )}
            </div>
            <Button
              className="w-full bg-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,44%)] text-white shadow-sm"
              onClick={() => handleSave("published")}
              disabled={saving}
            >
              {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />กำลังบันทึก...</> : "เผยแพร่บทความ"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              บันทึกฉบับร่าง
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground text-sm"
              onClick={() => router.back()}
              disabled={saving}
            >
              ยกเลิก
            </Button>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 space-y-3">
            <h3 className="font-semibold text-sm">รูปปก</h3>

            {form.cover_image_url ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[hsl(35,20%,94%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, cover_image_url: "" }))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="text-xs text-[hsl(24,85%,50%)] hover:underline disabled:opacity-50"
                >
                  เปลี่ยนรูป
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-[hsl(35,20%,83%)] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors disabled:opacity-50"
              >
                {uploadingCover ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs font-medium">คลิกเพื่ออัปโหลดรูปปก</span>
                    <span className="text-[10px] opacity-70">JPG, PNG — แนะนำ 1200×630</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleCoverUpload(f)
                e.target.value = ""
              }}
            />

            <div className="space-y-1 pt-1 border-t border-[hsl(35,20%,92%)]">
              <p className="text-[10px] text-muted-foreground">หรือวาง URL รูปภาพ</p>
              <Input
                value={form.cover_image_url}
                onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
                placeholder="https://..."
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 space-y-2">
            <Label className="text-xs font-semibold">หมวดหมู่</Label>
            <Input
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              placeholder="เช่น Mid-Century Modern, DIY, รีวิว"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4 space-y-2">
            <Label className="text-xs font-semibold">แท็ก</Label>
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="พิมพ์แล้วกด Enter"
            />
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-[hsl(35,30%,94%)] text-[hsl(25,20%,30%)] text-xs px-2 py-0.5 rounded-full">
                    {tag}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} className="text-muted-foreground hover:text-foreground">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
