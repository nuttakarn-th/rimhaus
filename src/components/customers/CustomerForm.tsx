"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertCustomer } from "@/actions/customers.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Customer } from "@/lib/types"

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    contact_name: customer?.contact_name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? "",
    tax_id: customer?.tax_id ?? "",
    notes: customer?.notes ?? "",
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("กรุณากรอกชื่อบริษัท/แบรนด์"); return }
    setSaving(true)
    const result = await upsertCustomer({ id: customer?.id, ...form })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(customer ? "แก้ไขสำเร็จ" : "เพิ่มลูกค้าสำเร็จ")
    router.push("/customers")
    router.refresh()
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลบริษัท / แบรนด์</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อบริษัท / แบรนด์ *</Label>
          <Input value={form.name} onChange={set("name")} placeholder="บริษัท ABC จำกัด" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">เลขประจำตัวผู้เสียภาษี (13 หลัก)</Label>
          <Input value={form.tax_id} onChange={set("tax_id")} placeholder="0123456789012" maxLength={13} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ที่อยู่</Label>
          <Textarea rows={3} value={form.address} onChange={set("address")} placeholder="123 ถนน... แขวง... เขต... กรุงเทพ 10XXX" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ผู้ติดต่อ</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อผู้ติดต่อ</Label>
          <Input value={form.contact_name} onChange={set("contact_name")} placeholder="คุณมิ้น" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">โทรศัพท์</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="081-234-5678" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">อีเมล</Label>
            <Input value={form.email} onChange={set("email")} placeholder="brand@example.com" type="email" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
        <Label className="text-xs">หมายเหตุ</Label>
        <Textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="บันทึกเพิ่มเติม..." />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : customer ? "บันทึกการแก้ไข" : "เพิ่มลูกค้า"}
        </Button>
      </div>
    </div>
  )
}
