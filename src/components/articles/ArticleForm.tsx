"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { upsertArticle } from "@/actions/article.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { X } from "lucide-react"
import type { Article } from "@/lib/types"

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const slugEdited = useRef(false)
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
    setForm(p => ({
      ...p,
      title,
      slug: slugEdited.current ? p.slug : toSlug(title),
    }))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugEdited.current = true
    setForm(p => ({ ...p, slug: e.target.value }))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !form.tags.includes(tag)) {
        setForm(p => ({ ...p, tags: [...p.tags, tag] }))
      }
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("กรุณากรอกชื่อบทความ"); return }
    setSaving(true)
    const result = await upsertArticle({
      id: article?.id,
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_image_url: form.cover_image_url || null,
      category: form.category || null,
      tags: form.tags,
      status: form.status,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(article ? "แก้ไขบทความสำเร็จ" : "บันทึกบทความสำเร็จ")
    router.push("/articles")
    router.refresh()
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Basic info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลบทความ</h3>

        <div className="space-y-1">
          <Label className="text-xs">ชื่อบทความ *</Label>
          <Input
            value={form.title}
            onChange={handleTitleChange}
            placeholder="หัวข้อบทความของคุณ"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Slug (URL)</Label>
          <Input
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="my-article-slug"
            className="font-mono text-sm"
          />
          <p className="text-xs text-[hsl(25,10%,60%)]">จะถูกใช้ใน URL: /blog/{form.slug || "slug"}</p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">หมวดหมู่</Label>
          <Input
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            placeholder="เช่น ตกแต่งบ้าน, DIY, รีวิวสินค้า"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">รูปปก (URL)</Label>
          <Input
            value={form.cover_image_url}
            onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Excerpt */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">บทสรุปย่อ</h3>
        <Textarea
          rows={2}
          value={form.excerpt}
          onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
          placeholder="สรุปสั้นๆ ว่าบทความนี้พูดถึงอะไร"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">เนื้อหา</h3>
          <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">
            รองรับ Markdown — วางลิงก์ Affiliate ได้โดยตรง{" "}
            <span className="font-mono bg-orange-50 text-orange-700 px-1 rounded">[ชื่อสินค้า](url)</span>
          </p>
        </div>
        <Textarea
          rows={14}
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          placeholder={"# หัวข้อหลัก\n\nเนื้อหาบทความ...\n\n## หัวข้อย่อย\n\nรายละเอียดเพิ่มเติม..."}
          className="font-mono text-sm resize-y min-h-[320px]"
        />
        <p className="text-xs text-[hsl(25,10%,60%)]">{form.content.length} ตัวอักษร</p>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">แท็ก</h3>
        <Input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="พิมพ์แท็กแล้วกด Enter เพื่อเพิ่ม"
        />
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-[hsl(35,30%,94%)] text-[hsl(25,20%,30%)] text-xs px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[hsl(25,10%,55%)] hover:text-[hsl(25,20%,20%)] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">สถานะ</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, status: "draft" }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.status === "draft"
                ? "bg-[hsl(25,10%,35%)] text-white"
                : "bg-[hsl(35,25%,92%)] text-[hsl(25,20%,40%)] hover:bg-[hsl(35,20%,86%)]"
            }`}
          >
            ฉบับร่าง
          </button>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, status: "published" }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.status === "published"
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "bg-[hsl(35,25%,92%)] text-[hsl(25,20%,40%)] hover:bg-[hsl(35,20%,86%)]"
            }`}
          >
            เผยแพร่
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : article ? "บันทึกการแก้ไข" : "บันทึกบทความ"}
        </Button>
      </div>
    </div>
  )
}
