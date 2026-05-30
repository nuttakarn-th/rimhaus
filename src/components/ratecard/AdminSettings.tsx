"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { upsertSettings } from "@/actions/ratecard.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { PlatformBubble, PLATFORM_LABELS } from "@/components/ui/PlatformIcon"
import type { RateCardSettings } from "@/lib/types"

const PLATFORM_KEYS = ["facebook", "instagram", "tiktok", "lemon8", "youtube", "shopee"] as const

export function AdminSettings({ settings }: { settings: RateCardSettings | null }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const platformFileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPlatform, setUploadingPlatform] = useState<string | null>(null)
  const [form, setForm] = useState({
    page_name: settings?.page_name ?? "",
    page_category: settings?.page_category ?? "",
    contact_line: settings?.contact_line ?? "",
    contact_email: settings?.contact_email ?? "",
    contact_phone: settings?.contact_phone ?? "",
    notes: (settings?.notes ?? []).join("\n"),
    image_url: settings?.image_url ?? "",
    hero_heading: settings?.hero_heading ?? "",
    hero_subtitle: settings?.hero_subtitle ?? "",
  })
  const [platformLogos, setPlatformLogos] = useState<Record<string, string>>(
    settings?.platform_logos ?? {}
  )
  const [platformUrls, setPlatformUrls] = useState<Record<string, string>>(
    settings?.platform_urls ?? {}
  )
  const [savingUrls, setSavingUrls] = useState(false)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/rate-card.${ext}`
    const { error } = await supabase.storage.from("rate-card").upload(path, file, { upsert: true })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    setForm(p => ({ ...p, image_url: publicUrl }))
    await upsertSettings({ image_url: publicUrl })
    toast.success("อัปโหลดรูปสำเร็จ")
    setUploading(false)
    router.refresh()
  }

  async function handlePlatformLogoUpload(platform: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPlatform(platform)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingPlatform(null); return }
    const ext = file.name.split(".").pop() ?? "png"
    const path = `${user.id}/platform-logos/${platform}.${ext}`
    const { error } = await supabase.storage.from("rate-card").upload(path, file, { upsert: true })
    if (error) { toast.error("อัปโหลดไม่สำเร็จ: " + error.message); setUploadingPlatform(null); return }
    const { data: { publicUrl } } = supabase.storage.from("rate-card").getPublicUrl(path)
    const updated = { ...platformLogos, [platform]: publicUrl }
    setPlatformLogos(updated)
    await upsertSettings({ platform_logos: updated })
    toast.success(`อัปโหลด ${PLATFORM_LABELS[platform] ?? platform} logo สำเร็จ`)
    setUploadingPlatform(null)
    router.refresh()
    // Reset file input
    if (platformFileRefs.current[platform]) {
      platformFileRefs.current[platform]!.value = ""
    }
  }

  async function handleRemovePlatformLogo(platform: string) {
    const updated = { ...platformLogos }
    delete updated[platform]
    setPlatformLogos(updated)
    await upsertSettings({ platform_logos: updated })
    toast.success("ลบ logo แล้ว")
    router.refresh()
  }

  async function handleSavePlatformUrls() {
    setSavingUrls(true)
    const cleaned = Object.fromEntries(
      Object.entries(platformUrls).filter(([, v]) => v.trim())
    )
    await upsertSettings({ platform_urls: cleaned })
    setSavingUrls(false)
    toast.success("บันทึก URL สำเร็จ")
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    const result = await upsertSettings({
      page_name: form.page_name,
      page_category: form.page_category,
      contact_line: form.contact_line,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      notes: form.notes.split("\n").map(s => s.trim()).filter(Boolean),
      image_url: form.image_url || null,
      hero_heading: form.hero_heading || null,
      hero_subtitle: form.hero_subtitle || null,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("บันทึกสำเร็จ")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Rate card image */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">รูป Rate Card</h3>
        {form.image_url && (
          <div className="rounded-xl overflow-hidden border border-[hsl(35,20%,88%)] max-h-64 flex items-center justify-center bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image_url} alt="Rate Card" className="max-h-64 object-contain" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploading ? "กำลังอัปโหลด..." : form.image_url ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
        </Button>
        {form.image_url && (
          <div className="space-y-1">
            <Label className="text-xs">หรือวาง URL รูปภาพ</Label>
            <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
          </div>
        )}
      </div>

      {/* Platform logos + URLs */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">โลโก้ & ลิงก์ Social Media</h3>
          <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">อัปโหลดโลโก้และใส่ URL เพื่อให้ลูกค้ากดเข้าหน้าเพจได้จากหน้า Rate Card</p>
        </div>
        <div className="space-y-2">
          {PLATFORM_KEYS.map(p => {
            const logoUrl = platformLogos[p]
            const isUploading = uploadingPlatform === p
            return (
              <div key={p} className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(35,20%,90%)] bg-[hsl(35,30%,98%)]">
                {/* Logo preview */}
                {logoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[hsl(35,20%,88%)] flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt={p} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <PlatformBubble platform={p} size={40} className="shrink-0" />
                )}

                {/* Fields */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[hsl(25,20%,25%)]">{PLATFORM_LABELS[p] ?? p}</span>
                    <div className="flex gap-1 shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => { platformFileRefs.current[p] = el }}
                        onChange={e => handlePlatformLogoUpload(p, e)}
                      />
                      <button
                        onClick={() => platformFileRefs.current[p]?.click()}
                        disabled={isUploading}
                        className="text-[10px] px-2 py-1 rounded bg-[hsl(24,85%,50%)] text-white font-medium hover:bg-[hsl(24,85%,45%)] disabled:opacity-50 transition-colors"
                      >
                        {isUploading ? "..." : logoUrl ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
                      </button>
                      {logoUrl && (
                        <button
                          onClick={() => handleRemovePlatformLogo(p)}
                          className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                  <Input
                    value={platformUrls[p] ?? ""}
                    onChange={e => setPlatformUrls(prev => ({ ...prev, [p]: e.target.value }))}
                    placeholder={`https://www.${p === "tiktok" ? "tiktok.com/@" : p === "lemon8" ? "lemon8-app.com/@" : `${p}.com/`}...`}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            )
          })}
        </div>
        <Button size="sm" variant="outline" onClick={handleSavePlatformUrls} disabled={savingUrls}>
          {savingUrls ? "กำลังบันทึก..." : "บันทึก URL ทั้งหมด"}
        </Button>
      </div>

      {/* Hero heading */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">หัวข้อ Hero (หน้าแรก)</h3>
        <div className="space-y-1">
          <Label className="text-xs">หัวข้อหลัก</Label>
          <Input value={form.hero_heading} onChange={e => setForm(p => ({ ...p, hero_heading: e.target.value }))} placeholder="คนติดบ้านที่บ้านไม่เคยเสร็จ 🏠" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">หัวข้อรอง</Label>
          <Input value={form.hero_subtitle} onChange={e => setForm(p => ({ ...p, hero_subtitle: e.target.value }))} placeholder="Home & Living Creator · แต่งบ้านไม่มีวันพอ" />
        </div>
      </div>

      {/* Page info */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ข้อมูลเพจ</h3>
        <div className="space-y-1">
          <Label className="text-xs">ชื่อเพจ</Label>
          <Input value={form.page_name} onChange={e => setForm(p => ({ ...p, page_name: e.target.value }))} placeholder="เมื่อไหร่บ้านจะเสร็จ?" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">หมวดหมู่</Label>
          <Input value={form.page_category} onChange={e => setForm(p => ({ ...p, page_category: e.target.value }))} placeholder="Home & Living, Home Decor" />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">ข้อมูลติดต่อ</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">LINE ID</Label>
            <Input value={form.contact_line} onChange={e => setForm(p => ({ ...p, contact_line: e.target.value }))} placeholder="rissa.rako" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">โทร</Label>
            <Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="093 137 7433" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="email@example.com" />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] text-sm">เงื่อนไข (1 บรรทัด = 1 ข้อ)</h3>
        <Textarea rows={4} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={"เก็บค่าบริการ 2 งวด...\nราคาสุทธิ (Net)..."} />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </div>
  )
}
