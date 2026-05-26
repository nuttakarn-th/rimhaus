"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPost, updatePost, type PostFormValues } from "@/actions/posts.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ReviewJob, ContentItem, Platform, SocialPost } from "@/lib/types"
import { toast } from "sonner"

interface PostFormProps {
  post?: SocialPost
  jobs: ReviewJob[]
  contentItems: ContentItem[]
  platforms: Platform[]
  prefill?: { review_job_id?: string }
}

export function PostForm({ post, jobs, contentItems, platforms, prefill }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<PostFormValues>(
    post
      ? {
          platform: post.platform,
          post_title: post.post_title,
          post_url: post.post_url ?? "",
          caption: post.caption ?? "",
          hashtags: post.hashtags ?? "",
          post_date: post.post_date ? String(post.post_date).split("T")[0] : null,
          status: post.status,
          views: post.views ?? null,
          likes: post.likes ?? null,
          comments: post.comments ?? null,
          shares: post.shares ?? null,
          saves: post.saves ?? null,
          reach: post.reach ?? null,
          notes: post.notes ?? "",
          review_job_id: post.review_job_id ?? null,
          content_item_id: post.content_item_id ?? null,
        }
      : {
          platform: "",
          post_title: "",
          post_url: "",
          caption: "",
          hashtags: "",
          post_date: new Date().toISOString().split("T")[0],
          status: "posted",
          views: null,
          likes: null,
          comments: null,
          shares: null,
          saves: null,
          reach: null,
          notes: "",
          review_job_id: prefill?.review_job_id ?? null,
          content_item_id: null,
        }
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.platform) { toast.error("กรุณาเลือกแพลตฟอร์ม"); return }
    if (!form.post_title) { toast.error("กรุณากรอกชื่อโพส"); return }
    setLoading(true)

    const result = post ? await updatePost(post.id, form) : await createPost(form)
    if (!result.success) { toast.error(result.error); setLoading(false); return }

    toast.success(post ? "แก้ไขโพสสำเร็จ" : "บันทึกโพสสำเร็จ")
    router.push(post ? `/posts/${post.id}` : "/posts")
    router.refresh()
  }

  function setMetric(key: keyof PostFormValues, value: string) {
    setForm(p => ({ ...p, [key]: value ? Number(value) : null }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold">ข้อมูลโพส</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>แพลตฟอร์ม *</Label>
            <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
              <SelectTrigger><SelectValue placeholder="เลือกแพลตฟอร์ม" /></SelectTrigger>
              <SelectContent>
                {platforms.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>สถานะ</Label>
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as PostFormValues["status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">โพสแล้ว</SelectItem>
                <SelectItem value="scheduled">กำหนดเวลา</SelectItem>
                <SelectItem value="draft">ร่าง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>ชื่อโพส *</Label>
          <Input value={form.post_title} onChange={e => setForm(p => ({ ...p, post_title: e.target.value }))} placeholder="เช่น รีวิวโซฟา IKEA" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>วันที่โพส</Label>
            <Input type="date" value={form.post_date ?? ""} onChange={e => setForm(p => ({ ...p, post_date: e.target.value || null }))} />
          </div>
          <div className="space-y-2">
            <Label>URL โพส</Label>
            <Input value={form.post_url ?? ""} onChange={e => setForm(p => ({ ...p, post_url: e.target.value }))} placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Caption</Label>
          <Textarea value={form.caption ?? ""} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} rows={3} placeholder="ข้อความในโพส..." />
        </div>
        <div className="space-y-2">
          <Label>Hashtags</Label>
          <Input value={form.hashtags ?? ""} onChange={e => setForm(p => ({ ...p, hashtags: e.target.value }))} placeholder="#แต่งบ้าน #รีวิว" />
        </div>

        {(jobs.length > 0 || contentItems.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {jobs.length > 0 && (
              <div className="space-y-2">
                <Label>เชื่อมกับงานรีวิว</Label>
                <Select value={form.review_job_id ?? "none"} onValueChange={v => setForm(p => ({ ...p, review_job_id: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue placeholder="เลือกงาน..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เชื่อม</SelectItem>
                    {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.brand_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {contentItems.length > 0 && (
              <div className="space-y-2">
                <Label>เชื่อมกับคอนเทนต์</Label>
                <Select value={form.content_item_id ?? "none"} onValueChange={v => setForm(p => ({ ...p, content_item_id: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue placeholder="เลือกคอนเทนต์..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เชื่อม</SelectItem>
                    {contentItems.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold">สถิติ (กรอกได้ทีหลัง)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "views", label: "ยอดวิว" },
            { key: "likes", label: "ไลค์" },
            { key: "comments", label: "คอมเมนต์" },
            { key: "shares", label: "แชร์" },
            { key: "saves", label: "บันทึก" },
            { key: "reach", label: "Reach" },
          ].map(m => (
            <div key={m.key} className="space-y-2">
              <Label>{m.label}</Label>
              <Input
                type="number"
                min="0"
                value={form[m.key as keyof PostFormValues] ?? ""}
                onChange={e => setMetric(m.key as keyof PostFormValues, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : post ? "บันทึกการแก้ไข" : "บันทึกโพส"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
      </div>
    </form>
  )
}
