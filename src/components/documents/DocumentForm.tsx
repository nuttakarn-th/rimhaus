"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { upsertDocument, generateDocNumber } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { DOC_TYPE_LABELS } from "@/lib/constants"
import type { Customer, Document, DocType, DocStatus, ReviewJob } from "@/lib/types"

type LineItem = { description: string; quantity: number; unit_price: number; amount: number }

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0, amount: 0 })

export function DocumentForm({
  document,
  customers,
  jobs,
}: {
  document?: Document
  customers: Customer[]
  jobs: ReviewJob[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [docType, setDocType] = useState<DocType>(document?.doc_type ?? "quotation")
  const [docNumber, setDocNumber] = useState(document?.doc_number ?? "")
  const [docDate, setDocDate] = useState(document?.doc_date ?? new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(document?.due_date ?? "")
  const [status, setStatus] = useState<DocStatus>(document?.status ?? "draft")
  const [customerId, setCustomerId] = useState(document?.customer_id ?? "")
  const [jobId, setJobId] = useState(document?.review_job_id ?? "")
  const [customerName, setCustomerName] = useState(document?.customer_name ?? "")
  const [customerAddress, setCustomerAddress] = useState(document?.customer_address ?? "")
  const [customerTaxId, setCustomerTaxId] = useState(document?.customer_tax_id ?? "")
  const [customerContact, setCustomerContact] = useState(document?.customer_contact ?? "")
  const [whtEnabled, setWhtEnabled] = useState((document?.wht_rate ?? 0) > 0)
  const [notes, setNotes] = useState(document?.notes ?? "")
  const [items, setItems] = useState<LineItem[]>(
    document?.document_items?.map(i => ({
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      amount: i.amount,
    })) ?? [emptyItem()]
  )

  // Auto-generate doc number for new documents
  useEffect(() => {
    if (!document) {
      generateDocNumber(docType).then(setDocNumber)
    }
  }, [docType, document])

  // Auto-fill customer info when selecting from dropdown
  useEffect(() => {
    if (!customerId) return
    const c = customers.find(c => c.id === customerId)
    if (!c) return
    setCustomerName(c.name)
    setCustomerAddress(c.address ?? "")
    setCustomerTaxId(c.tax_id ?? "")
    setCustomerContact(c.contact_name ?? "")
  }, [customerId, customers])

  // Auto-fill from job
  useEffect(() => {
    if (!jobId) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    if (!customerName) setCustomerName(job.brand_name)
    if (items.length === 1 && !items[0].description) {
      const desc = `${job.product_name}`
      const price = job.payment_amount
      setItems([{ description: desc, quantity: 1, unit_price: price, amount: price }])
    }
  }, [jobId, jobs])

  function calcSubtotal() {
    return items.reduce((sum, i) => sum + (i.amount || 0), 0)
  }

  function calcWht() {
    return whtEnabled ? Math.round(calcSubtotal() * 0.03 * 100) / 100 : 0
  }

  function calcTotal() {
    return calcSubtotal() - calcWht()
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[idx], [field]: value }
      if (field === "quantity" || field === "unit_price") {
        item.amount = Math.round(Number(item.quantity) * Number(item.unit_price) * 100) / 100
      }
      next[idx] = item
      return next
    })
  }

  async function handleSave() {
    if (!customerName.trim()) { toast.error("กรุณาระบุชื่อลูกค้า"); return }
    if (items.some(i => !i.description.trim())) { toast.error("กรุณากรอกรายการทุกช่อง"); return }
    setSaving(true)
    const subtotal = calcSubtotal()
    const whtAmount = calcWht()
    const total = calcTotal()
    const result = await upsertDocument({
      id: document?.id,
      customer_id: customerId || null,
      review_job_id: jobId || null,
      doc_type: docType,
      doc_number: docNumber,
      doc_date: docDate,
      due_date: dueDate || null,
      status,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_tax_id: customerTaxId,
      customer_contact: customerContact,
      subtotal,
      wht_rate: whtEnabled ? 3 : 0,
      wht_amount: whtAmount,
      total,
      notes,
      items: items.map((item, i) => ({ ...item, sort_order: i })),
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("บันทึกสำเร็จ")
    router.push(`/documents/${result.data.id}`)
    router.refresh()
  }

  const subtotal = calcSubtotal()
  const whtAmount = calcWht()
  const total = calcTotal()

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลเอกสาร</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">ประเภทเอกสาร</Label>
            <Select value={docType} onValueChange={v => setDocType(v as DocType)} disabled={!!document}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(DOC_TYPE_LABELS) as [DocType, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">เลขที่</Label>
            <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="QT-2026-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">วันที่</Label>
            <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">กำหนดส่งงาน</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">สถานะ</Label>
          <Select value={status} onValueChange={v => setStatus(v as DocStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">ร่าง</SelectItem>
              <SelectItem value="sent">ส่งแล้ว</SelectItem>
              <SelectItem value="paid">ชำระแล้ว</SelectItem>
              <SelectItem value="cancelled">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ลูกค้า</h3>
        {customers.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">เลือกจากฐานข้อมูล (ไม่บังคับ)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="เลือกลูกค้า..." /></SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs">ชื่อบริษัท / แบรนด์ *</Label>
          <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="บริษัท ABC จำกัด" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ที่อยู่</Label>
          <Textarea rows={2} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="123 ถนน... แขวง... เขต... กรุงเทพ 10XXX" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">เลขภาษี</Label>
            <Input value={customerTaxId} onChange={e => setCustomerTaxId(e.target.value)} placeholder="0123456789012" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ผู้ติดต่อ</Label>
            <Input value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="คุณมิ้น" />
          </div>
        </div>
      </div>

      {/* Job link */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
          <Label className="text-xs font-semibold text-[hsl(25,20%,15%)]">เชื่อมกับงานรีวิว (ไม่บังคับ)</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger><SelectValue placeholder="เลือกงาน..." /></SelectTrigger>
            <SelectContent>
              {jobs.map(j => (
                <SelectItem key={j.id} value={j.id}>{j.brand_name} — {j.product_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line items */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">รายการ</h3>
          <Button size="sm" variant="outline" onClick={() => setItems(p => [...p, emptyItem()])}>
            <Plus className="w-3.5 h-3.5 mr-1" />เพิ่มรายการ
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6 space-y-1">
                {idx === 0 && <Label className="text-xs">รายละเอียด</Label>}
                <Input
                  value={item.description}
                  onChange={e => updateItem(idx, "description", e.target.value)}
                  placeholder="Short VDO Tiktok รีวิว..."
                />
              </div>
              <div className="col-span-2 space-y-1">
                {idx === 0 && <Label className="text-xs">จำนวน</Label>}
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                />
              </div>
              <div className="col-span-3 space-y-1">
                {idx === 0 && <Label className="text-xs">ราคา (บาท)</Label>}
                <Input
                  type="number"
                  min={0}
                  value={item.unit_price}
                  onChange={e => updateItem(idx, "unit_price", Number(e.target.value))}
                  placeholder="4000"
                />
              </div>
              <div className="col-span-1 flex justify-end pb-0.5">
                {items.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600 px-2"
                    onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">สรุปยอด</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(25,10%,50%)]">ยอดรวม</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={whtEnabled} onCheckedChange={v => setWhtEnabled(Boolean(v))} />
              <span className="text-[hsl(25,10%,50%)]">หักภาษี ณ ที่จ่าย 3%</span>
            </label>
            <span className="text-red-600">- {formatCurrency(whtAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-[hsl(35,20%,88%)] pt-2">
            <span>ยอดรับ</span>
            <span className="text-[hsl(24,85%,50%)]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-2">
        <Label className="text-xs font-semibold text-[hsl(25,20%,15%)]">หมายเหตุ</Label>
        <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="หมายเหตุเพิ่มเติม..." />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : document ? "บันทึกการแก้ไข" : "สร้างเอกสาร"}
        </Button>
      </div>
    </div>
  )
}
