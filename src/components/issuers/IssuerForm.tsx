"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertIssuer, updateIssuerSignature, updateIssuerHeaderImage } from "@/actions/issuers.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Pen, Image } from "lucide-react"
import { toast } from "sonner"
import type { IssuerProfile } from "@/lib/types"

export function IssuerForm({ issuer }: { issuer?: IssuerProfile }) {
  const router = useRouter()
  const sigRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingSig, setUploadingSig] = useState(false)
  const [uploadingHeader, setUploadingHeader] = useState(false)
  const [form, setForm] = useState({
    name: issuer?.name ?? "",
    id_card: issuer?.id_card ?? "",
    address: issuer?.address ?? "",
    phone: issuer?.phone ?? "",
    email: issuer?.email ?? "",
    contact_line: issuer?.contact_line ?? "",
    bank_name: issuer?.bank_name ?? "",
    bank_branch: issuer?.bank_branch ?? "",
    account_name: issuer?.account_name ?? "",
    account_number: issuer?.account_number ?? "",
    signature_url: issuer?.signature_url ?? "",
    header_image_url: issuer?.header_image_url ?? "",
    is_default: issuer?.is_default ?? false,
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function uploadImage(
    file: File,
    pathPrefix: string,
    onSuccess: (url: string) => void,
    setLoading: (v: boolean) => void,
  ) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const ext = file.name.split(".").pop() ?? "png"
    const path = `${user.id}/${pathPrefix}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from("signatures").upload(path, file, { upsert: true })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setLoading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("signatures").getPublicUrl(path)
    onSuccess(publicUrl)
    setLoading(false)
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadImage(file, "signature", async (url) => {
      setForm(p => ({ ...p, signature_url: url }))
      if (issuer?.id) { await updateIssuerSignature(issuer.id, url) }
      toast.success("อัปโหลดลายเซ็นสำเร็จ")
    }, setUploadingSig)
  }

  async function handleHeaderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadImage(file, "header", async (url) => {
      setForm(p => ({ ...p, header_image_url: url }))
      if (issuer?.id) { await updateIssuerHeaderImage(issuer.id, url) }
      toast.success("อัปโหลดภาพหัวเอกสารสำเร็จ")
    }, setUploadingHeader)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("กรุณากรอกชื่อ"); return }
    setSaving(true)
    const result = await upsertIssuer({ id: issuer?.id, ...form })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(issuer ? "แก้ไขสำเร็จ" : "เพิ่มผู้ออกเอกสารสำเร็จ")
    router.push("/settings/issuers")
    router.refresh()
  }

  return (
    <div className="space-y-5 max-w-xl">

      {/* Header image */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ภาพหัวกระดาษ (Logo)</h3>
          <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">แสดงด้านบนซ้ายของเอกสารเหนือชื่อผู้ออกเอกสาร</p>
        </div>
        {form.header_image_url ? (
          <div className="border border-[hsl(35,20%,88%)] rounded-lg p-3 bg-gray-50 flex items-start justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.header_image_url} alt="Header" className="max-h-16 object-contain" />
          </div>
        ) : (
          <div className="border-2 border-dashed border-[hsl(35,20%,80%)] rounded-lg p-5 flex flex-col items-center gap-2 text-[hsl(25,10%,60%)]">
            <Image className="w-6 h-6" />
            <span className="text-xs">ยังไม่มีภาพหัวกระดาษ</span>
          </div>
        )}
        <input ref={headerRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleHeaderUpload} />
        <Button size="sm" variant="outline" onClick={() => headerRef.current?.click()} disabled={uploadingHeader}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploadingHeader ? "กำลังอัปโหลด..." : form.header_image_url ? "เปลี่ยนภาพ" : "อัปโหลดภาพ"}
        </Button>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลส่วนตัว</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อ-นามสกุล *</Label>
          <Input value={form.name} onChange={set("name")} placeholder="ณัฐกานต์ ทาจันทร์" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">เลขที่บัตรประชาชน</Label>
          <Input value={form.id_card} onChange={set("id_card")} placeholder="1 4599 00204 81 1" maxLength={17} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ที่อยู่</Label>
          <Textarea rows={3} value={form.address} onChange={set("address")} placeholder="เลขที่ 99/41 หมู่4 ตำบลป่าแดด อำเภอเมือง จังหวัดเชียงใหม่ 50100" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">เบอร์โทรศัพท์</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="081-998-5255" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">อีเมล</Label>
            <Input value={form.email} onChange={set("email")} placeholder="example@email.com" type="email" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Line ID</Label>
            <Input value={form.contact_line} onChange={set("contact_line")} placeholder="@unfinishedhouse" />
          </div>
        </div>
      </div>

      {/* Bank info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลบัญชีธนาคาร</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อบัญชี</Label>
          <Input value={form.account_name} onChange={set("account_name")} placeholder="นายณัฐกานต์ ทาจันทร์" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">เลขที่บัญชี</Label>
          <Input value={form.account_number} onChange={set("account_number")} placeholder="663-2-12832-9" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">ธนาคาร</Label>
            <Input value={form.bank_name} onChange={set("bank_name")} placeholder="กสิกรไทย" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">สาขา</Label>
            <Input value={form.bank_branch} onChange={set("bank_branch")} placeholder="เซ็นทรัลแอร์พอร์ต เชียงใหม่" />
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ลายเซ็น</h3>
        {form.signature_url ? (
          <div className="border border-[hsl(35,20%,88%)] rounded-lg p-3 bg-gray-50 flex items-center justify-center h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.signature_url} alt="ลายเซ็น" className="max-h-24 object-contain" />
          </div>
        ) : (
          <div className="border-2 border-dashed border-[hsl(35,20%,80%)] rounded-lg p-6 flex flex-col items-center gap-2 text-[hsl(25,10%,60%)]">
            <Pen className="w-6 h-6" />
            <span className="text-xs">ยังไม่มีลายเซ็น</span>
          </div>
        )}
        <input ref={sigRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleSignatureUpload} />
        <Button size="sm" variant="outline" onClick={() => sigRef.current?.click()} disabled={uploadingSig}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploadingSig ? "กำลังอัปโหลด..." : form.signature_url ? "เปลี่ยนลายเซ็น" : "อัปโหลดลายเซ็น PNG"}
        </Button>
        <p className="text-xs text-[hsl(25,10%,60%)]">แนะนำ: PNG พื้นหลังโปร่งใส ขนาดไม่เกิน 2MB</p>
      </div>

      {/* Default toggle */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={form.is_default} onCheckedChange={v => setForm(p => ({ ...p, is_default: Boolean(v) }))} />
          <div>
            <div className="text-sm font-medium text-[hsl(25,20%,15%)]">ตั้งเป็นค่าเริ่มต้น</div>
            <div className="text-xs text-[hsl(25,10%,55%)]">เลือกชื่อนี้เป็นผู้ออกเอกสารโดยอัตโนมัติ</div>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : issuer ? "บันทึกการแก้ไข" : "เพิ่มผู้ออกเอกสาร"}
        </Button>
      </div>
    </div>
  )
}
