"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createJob, updateJob, type JobFormValues } from "@/actions/jobs.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PRODUCT_CATEGORIES, REVIEW_TYPE_LABELS, JOB_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants"
import type { ReviewJob, Platform } from "@/lib/types"
import { toast } from "sonner"

interface JobFormProps {
  job?: ReviewJob
  platforms: Platform[]
}

const defaultValues: JobFormValues = {
  brand_name: "",
  product_name: "",
  product_category: "",
  review_type: "short_video",
  platforms: [],
  deadline: null,
  payment_amount: 0,
  payment_status: "pending",
  status: "accepted",
  product_received: false,
  product_value: null,
  notes: "",
}

export function JobForm({ job, platforms }: JobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<JobFormValues>(
    job
      ? {
          brand_name: job.brand_name,
          product_name: job.product_name,
          product_category: job.product_category ?? "",
          review_type: job.review_type,
          platforms: job.platforms,
          deadline: job.deadline,
          payment_amount: job.payment_amount,
          payment_status: job.payment_status,
          status: job.status,
          product_received: job.product_received,
          product_value: job.product_value,
          notes: job.notes ?? "",
        }
      : defaultValues
  )

  function togglePlatform(id: string) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter(p => p !== id)
        : [...prev.platforms, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brand_name || !form.product_name) {
      toast.error("กรุณากรอกชื่อแบรนด์และสินค้า")
      return
    }
    if (form.platforms.length === 0) {
      toast.error("กรุณาเลือกอย่างน้อย 1 แพลตฟอร์ม")
      return
    }
    setLoading(true)

    const result = job ? await updateJob(job.id, form) : await createJob(form)

    if (!result.success) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success(job ? "แก้ไขงานสำเร็จ" : "สร้างงานใหม่สำเร็จ")
    router.push(job ? `/jobs/${job.id}` : "/jobs")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Brand & Product */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold text-[hsl(25,20%,15%)]">ข้อมูลแบรนด์และสินค้า</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ชื่อแบรนด์ *</Label>
            <Input value={form.brand_name} onChange={e => setForm(p => ({ ...p, brand_name: e.target.value }))} placeholder="เช่น IKEA, Hafele" required />
          </div>
          <div className="space-y-2">
            <Label>ชื่อสินค้า *</Label>
            <Input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} placeholder="เช่น โซฟาสีเทา รุ่น X" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>หมวดหมู่สินค้า</Label>
            <Select value={form.product_category ?? ""} onValueChange={v => setForm(p => ({ ...p, product_category: v }))}>
              <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ประเภทรีวิว *</Label>
            <Select value={form.review_type} onValueChange={v => setForm(p => ({ ...p, review_type: v as JobFormValues["review_type"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REVIEW_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold text-[hsl(25,20%,15%)]">แพลตฟอร์ม *</h3>
        <div className="flex flex-wrap gap-3">
          {platforms.filter(p => p.is_active).map(p => (
            <label key={p.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.platforms.includes(p.id)}
                onCheckedChange={() => togglePlatform(p.id)}
              />
              <span className="text-sm font-medium" style={{ color: form.platforms.includes(p.id) ? p.color : undefined }}>
                {p.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment & Timeline */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold text-[hsl(25,20%,15%)]">การเงินและกำหนดเวลา</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ค่าจ้าง (บาท) *</Label>
            <Input type="number" min="0" value={form.payment_amount} onChange={e => setForm(p => ({ ...p, payment_amount: Number(e.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label>สถานะการรับเงิน</Label>
            <Select value={form.payment_status} onValueChange={v => setForm(p => ({ ...p, payment_status: v as JobFormValues["payment_status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>กำหนดส่งงาน</Label>
            <Input type="date" value={form.deadline ?? ""} onChange={e => setForm(p => ({ ...p, deadline: e.target.value || null }))} />
          </div>
          <div className="space-y-2">
            <Label>สถานะงาน</Label>
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as JobFormValues["status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        <h3 className="font-semibold text-[hsl(25,20%,15%)]">สินค้า</h3>
        <div className="flex items-center gap-3">
          <Checkbox checked={form.product_received} onCheckedChange={v => setForm(p => ({ ...p, product_received: Boolean(v) }))} id="product_received" />
          <Label htmlFor="product_received">ได้รับสินค้าแล้ว</Label>
        </div>
        <div className="space-y-2">
          <Label>มูลค่าสินค้า (บาท)</Label>
          <Input type="number" min="0" value={form.product_value ?? ""} onChange={e => setForm(p => ({ ...p, product_value: e.target.value ? Number(e.target.value) : null }))} placeholder="กรณีได้รับสินค้าแทนค่าจ้าง" />
        </div>
        <div className="space-y-2">
          <Label>หมายเหตุ</Label>
          <Textarea value={form.notes ?? ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="รายละเอียดเพิ่มเติม..." />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : job ? "บันทึกการแก้ไข" : "สร้างงานใหม่"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          ยกเลิก
        </Button>
      </div>
    </form>
  )
}
