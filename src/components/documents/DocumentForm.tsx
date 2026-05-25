"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { upsertDocument, generateDocNumber, getDocument } from "@/actions/documents.actions"
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
import { PackagePicker } from "@/components/documents/PackagePicker"
import { QuotationSearch } from "@/components/documents/QuotationSearch"
import type { Customer, Document, IssuerProfile, DocType, DocStatus, ReviewJob, RateCardPackage, Platform } from "@/lib/types"

type LineItem = { description: string; quantity: number; unit_price: number; amount: number }
const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0, amount: 0 })

const WHT_NOTICE = "กรุณาหักภาษี ณ ที่จ่าย 3% และออกหนังสือรับรองการหักภาษี ณ ที่จ่ายให้ด้วย"

const DEFAULT_PAYMENT_TERMS: Record<DocType, string> = {
  quotation: "ชำระเงินภายใน 30 วัน หลังจากส่งมอบงาน",
  invoice: "ภายใน 15 วัน หลังจากส่งมอบงาน",
  receipt: "",
}

const DEFAULT_REMARKS: Record<DocType, string> = {
  quotation: "ยืนยันราคาภายใน 30 วัน นับจากวันเสนอราคา\nสามารถแก้ไขงานได้ไม่เกิน 2 ครั้ง หากมีการแก้ไขมากกว่านี้ คิดเพิ่ม 20% ต่อครั้งจากราคาชิ้นงาน\nกรณีเป็นสินค้าที่ต้องส่งคืน แบรนด์เป็นผู้รับผิดชอบค่าใช้จ่ายในการขนส่งทั้งหมด",
  invoice: "",
  receipt: "",
}

export function DocumentForm({
  document,
  customers,
  jobs,
  issuers,
  quotations,
  packages,
  platforms,
}: {
  document?: Document
  customers: Customer[]
  jobs: ReviewJob[]
  issuers: IssuerProfile[]
  quotations: Document[]
  packages: RateCardPackage[]
  platforms: Platform[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const defaultIssuer = issuers.find(i => i.is_default) ?? issuers[0]

  const [docType, setDocType] = useState<DocType>(document?.doc_type ?? "quotation")
  const [docNumber, setDocNumber] = useState(document?.doc_number ?? "")
  const [docDate, setDocDate] = useState(document?.doc_date ?? new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(document?.due_date ?? "")
  const [status, setStatus] = useState<DocStatus>(document?.status ?? "draft")

  const [issuerId, setIssuerId] = useState(document?.issuer_profile_id ?? defaultIssuer?.id ?? "")
  const [issuerName, setIssuerName] = useState(document?.issuer_name ?? defaultIssuer?.name ?? "")
  const [issuerIdCard, setIssuerIdCard] = useState(document?.issuer_id_card ?? defaultIssuer?.id_card ?? "")
  const [issuerAddress, setIssuerAddress] = useState(document?.issuer_address ?? defaultIssuer?.address ?? "")
  const [issuerPhone, setIssuerPhone] = useState(document?.issuer_phone ?? defaultIssuer?.phone ?? "")
  const [issuerEmail, setIssuerEmail] = useState(document?.issuer_email ?? defaultIssuer?.email ?? "")
  const [issuerBankName, setIssuerBankName] = useState(document?.issuer_bank_name ?? defaultIssuer?.bank_name ?? "")
  const [issuerBankBranch, setIssuerBankBranch] = useState(document?.issuer_bank_branch ?? defaultIssuer?.bank_branch ?? "")
  const [issuerAccountName, setIssuerAccountName] = useState(document?.issuer_account_name ?? defaultIssuer?.account_name ?? "")
  const [issuerAccountNumber, setIssuerAccountNumber] = useState(document?.issuer_account_number ?? defaultIssuer?.account_number ?? "")
  const [issuerSignatureUrl, setIssuerSignatureUrl] = useState(document?.issuer_signature_url ?? defaultIssuer?.signature_url ?? "")
  const [issuerHeaderImageUrl, setIssuerHeaderImageUrl] = useState(document?.issuer_header_image_url ?? defaultIssuer?.header_image_url ?? "")
  const [issuerContactLine, setIssuerContactLine] = useState(document?.issuer_contact_line ?? defaultIssuer?.contact_line ?? "")

  const [customerId, setCustomerId] = useState(document?.customer_id ?? "")
  const [customerName, setCustomerName] = useState(document?.customer_name ?? "")
  const [customerAddress, setCustomerAddress] = useState(document?.customer_address ?? "")
  const [customerTaxId, setCustomerTaxId] = useState(document?.customer_tax_id ?? "")
  const [customerContact, setCustomerContact] = useState(document?.customer_contact ?? "")

  const [linkedQuotationId, setLinkedQuotationId] = useState(document?.linked_quotation_id ?? "")
  const [docPlatforms, setDocPlatforms] = useState<string[]>(document?.platforms ?? [])
  const [whtMode, setWhtMode] = useState<"none" | "deduct" | "grossup">(() => {
    const rate = document?.wht_rate ?? 0
    if (rate < 0) return "grossup"
    if (rate > 0) return "deduct"
    return "none"
  })
  const [discountType, setDiscountType] = useState<"%" | "฿">((document?.discount_type as "%" | "฿") ?? "%")
  const [discountValue, setDiscountValue] = useState(document?.discount_value ?? 0)
  const [paymentTerms, setPaymentTerms] = useState(document?.payment_terms ?? DEFAULT_PAYMENT_TERMS[document?.doc_type ?? "quotation"])
  const [docRemarks, setDocRemarks] = useState(document?.doc_remarks ?? DEFAULT_REMARKS[document?.doc_type ?? "quotation"])
  const [notes, setNotes] = useState(document?.notes ?? "")
  const [items, setItems] = useState<LineItem[]>(
    document?.document_items?.map(i => ({
      description: i.description, quantity: i.quantity,
      unit_price: i.unit_price, amount: i.amount,
    })) ?? [emptyItem()]
  )

  // Auto-generate doc number for new docs
  useEffect(() => {
    if (!document) generateDocNumber(docType).then(setDocNumber)
  }, [docType, document])

  // Update defaults when doc type changes (new doc only)
  useEffect(() => {
    if (!document) {
      setPaymentTerms(DEFAULT_PAYMENT_TERMS[docType])
      setDocRemarks(DEFAULT_REMARKS[docType])
    }
  }, [docType, document])

  // Fill issuer from profile selection
  useEffect(() => {
    if (!issuerId) return
    const p = issuers.find(i => i.id === issuerId)
    if (!p) return
    setIssuerName(p.name); setIssuerIdCard(p.id_card ?? "")
    setIssuerAddress(p.address ?? ""); setIssuerPhone(p.phone ?? "")
    setIssuerEmail(p.email ?? ""); setIssuerBankName(p.bank_name ?? "")
    setIssuerBankBranch(p.bank_branch ?? ""); setIssuerAccountName(p.account_name ?? "")
    setIssuerAccountNumber(p.account_number ?? ""); setIssuerSignatureUrl(p.signature_url ?? "")
    setIssuerHeaderImageUrl(p.header_image_url ?? ""); setIssuerContactLine(p.contact_line ?? "")
  }, [issuerId, issuers])

  // Fill customer from dropdown
  useEffect(() => {
    if (!customerId) return
    const c = customers.find(c => c.id === customerId)
    if (!c) return
    setCustomerName(c.name); setCustomerAddress(c.address ?? "")
    setCustomerTaxId(c.tax_id ?? ""); setCustomerContact(c.contact_name ?? "")
  }, [customerId, customers])

  // Fill ALL data from linked quotation (full fetch)
  useEffect(() => {
    if (!linkedQuotationId || docType === "quotation") return
    getDocument(linkedQuotationId).then(qt => {
      if (!qt) return
      // Customer
      setCustomerName(qt.customer_name ?? "")
      setCustomerAddress(qt.customer_address ?? "")
      setCustomerTaxId(qt.customer_tax_id ?? "")
      setCustomerContact(qt.customer_contact ?? "")
      // Issuer snapshot from quotation
      if (qt.issuer_name) {
        setIssuerId(qt.issuer_profile_id ?? "")
        setIssuerName(qt.issuer_name ?? "")
        setIssuerIdCard(qt.issuer_id_card ?? "")
        setIssuerAddress(qt.issuer_address ?? "")
        setIssuerPhone(qt.issuer_phone ?? "")
        setIssuerEmail(qt.issuer_email ?? "")
        setIssuerBankName(qt.issuer_bank_name ?? "")
        setIssuerBankBranch(qt.issuer_bank_branch ?? "")
        setIssuerAccountName(qt.issuer_account_name ?? "")
        setIssuerAccountNumber(qt.issuer_account_number ?? "")
        setIssuerSignatureUrl(qt.issuer_signature_url ?? "")
        setIssuerHeaderImageUrl(qt.issuer_header_image_url ?? "")
        setIssuerContactLine(qt.issuer_contact_line ?? "")
      }
      // Line items + WHT + platforms
      if (qt.document_items && qt.document_items.length > 0) {
        setItems(qt.document_items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          amount: i.amount,
        })))
        setWhtMode((qt.wht_rate ?? 0) > 0 ? "deduct" : "none")
      }
      // Platforms from quotation
      if (qt.platforms && qt.platforms.length > 0) {
        setDocPlatforms(qt.platforms)
      }
    })
  }, [linkedQuotationId, docType])

  // Auto-add/remove WHT notice in payment terms when checkbox toggled
  useEffect(() => {
    if (whtMode !== "none") {
      setPaymentTerms(prev => prev.includes(WHT_NOTICE) ? prev : prev ? `${prev}\n${WHT_NOTICE}` : WHT_NOTICE)
    } else {
      setPaymentTerms(prev => prev.replace(`\n${WHT_NOTICE}`, "").replace(WHT_NOTICE, "").trim())
    }
  }, [whtMode])

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

  function handleSetWhtMode(mode: "deduct" | "grossup") {
    const next = whtMode === mode ? "none" : mode
    const wasGrossup = whtMode === "grossup"
    const willGrossup = next === "grossup"
    setItems(prev => prev.map(item => {
      let price = item.unit_price
      if (wasGrossup) price = Math.round(price * 0.97 * 100) / 100
      if (willGrossup) price = Math.round(price / 0.97 * 100) / 100
      const amount = Math.round(price * item.quantity * 100) / 100
      return { ...item, unit_price: price, amount }
    }))
    setWhtMode(next)
  }

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const discountAmount = discountValue > 0
    ? (discountType === "%" ? Math.round(subtotal * discountValue / 100 * 100) / 100 : discountValue)
    : 0
  const afterDiscount = subtotal - discountAmount
  const whtAmount = whtMode !== "none" ? Math.round(afterDiscount * 0.03 * 100) / 100 : 0
  // grossup: total = grossed-up subtotal (shown to customer, they withhold 3% themselves)
  // deduct:  total = afterDiscount - whtAmount
  const total = whtMode === "grossup" ? afterDiscount : afterDiscount - whtAmount

  async function handleSave() {
    if (!customerName.trim()) { toast.error("กรุณาระบุชื่อลูกค้า"); return }
    if (items.some(i => !i.description.trim())) { toast.error("กรุณากรอกรายการทุกช่อง"); return }
    setSaving(true)
    const result = await upsertDocument({
      id: document?.id,
      customer_id: customerId || null,
      linked_quotation_id: linkedQuotationId || null,
      doc_type: docType,
      doc_number: docNumber,
      doc_date: docDate,
      due_date: dueDate || null,
      status,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_tax_id: customerTaxId,
      customer_contact: customerContact,
      subtotal, discount_type: discountType, discount_value: discountValue, discount_amount: discountAmount, wht_rate: whtMode === "grossup" ? -3 : whtMode === "deduct" ? 3 : 0, wht_amount: whtAmount, total,
      notes, doc_remarks: docRemarks, payment_terms: paymentTerms,
      issuer_profile_id: issuerId || null,
      issuer_name: issuerName, issuer_id_card: issuerIdCard,
      issuer_address: issuerAddress, issuer_phone: issuerPhone,
      issuer_email: issuerEmail, issuer_bank_name: issuerBankName,
      issuer_bank_branch: issuerBankBranch, issuer_account_name: issuerAccountName,
      issuer_account_number: issuerAccountNumber, issuer_signature_url: issuerSignatureUrl,
      issuer_header_image_url: issuerHeaderImageUrl, issuer_contact_line: issuerContactLine,
      platforms: docPlatforms,
      items: items.map((item, i) => ({ ...item, sort_order: i })),
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("บันทึกสำเร็จ")
    router.push(`/documents/${result.data.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-5 max-w-2xl w-full">
      {/* Document header */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ข้อมูลเอกสาร</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">วันที่</Label>
            <Input type="date" value={docDate} onChange={e => setDocDate(e.target.value)} />
          </div>
          {docType === "quotation" && (
            <div className="space-y-1">
              <Label className="text-xs">กำหนดส่งงาน</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          )}
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
        {docType === "quotation" && platforms.filter(p => p.is_active).length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">แพลตฟอร์ม (สำหรับระบุในเอกสาร)</Label>
            <div className="flex flex-wrap gap-3 pt-1">
              {platforms.filter(p => p.is_active).map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={docPlatforms.includes(p.id)}
                    onCheckedChange={() =>
                      setDocPlatforms(prev =>
                        prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                      )
                    }
                  />
                  <span className="text-sm font-medium" style={{ color: docPlatforms.includes(p.id) ? p.color : undefined }}>
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        {(docType === "invoice" || docType === "receipt") && docPlatforms.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">แพลตฟอร์ม</Label>
            <p className="text-sm text-[hsl(25,20%,25%)] bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2">
              {docPlatforms.map(id => {
                const p = platforms.find(pl => pl.id === id)
                return p ? p.label : id
              }).join(", ")}
            </p>
          </div>
        )}
        {(docType === "invoice" || docType === "receipt") && quotations.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs">อ้างอิงใบเสนอราคา</Label>
            <QuotationSearch
              quotations={quotations}
              value={linkedQuotationId}
              onChange={setLinkedQuotationId}
            />
            {linkedQuotationId && (
              <p className="text-xs text-[hsl(24,85%,50%)] flex items-center gap-1 mt-1">
                ✓ ดึงข้อมูลผู้ออกเอกสาร ลูกค้า และรายการทั้งหมดอัตโนมัติ
              </p>
            )}
          </div>
        )}
      </div>

      {/* Issuer */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ผู้ออกเอกสาร</h3>
          {linkedQuotationId && issuerName && (
            <span className="text-xs text-[hsl(24,85%,50%)] bg-orange-50 px-2 py-0.5 rounded-full">ดึงจากใบเสนอราคา</span>
          )}
        </div>
        {/* When quotation is linked, show compact locked display; profile selector hidden */}
        {linkedQuotationId && issuerName ? (
          <div className="text-sm text-[hsl(25,20%,25%)] bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2.5 space-y-0.5">
            <p className="font-semibold">{issuerName}</p>
            {issuerPhone && <p className="text-xs text-[hsl(25,10%,50%)]">{issuerPhone}</p>}
            {issuerSignatureUrl && <p className="text-xs text-green-600">✓ มีลายเซ็น</p>}
          </div>
        ) : (
          <>
            {issuers.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">เลือกจากโปรไฟล์</Label>
                <Select value={issuerId} onValueChange={setIssuerId}>
                  <SelectTrigger><SelectValue placeholder="เลือกผู้ออกเอกสาร..." /></SelectTrigger>
                  <SelectContent>
                    {issuers.map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.name}{i.is_default ? " ★" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">ชื่อ *</Label>
              <Input value={issuerName} onChange={e => setIssuerName(e.target.value)} placeholder="ณัฐกานต์ ทาจันทร์" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ที่อยู่</Label>
              <Textarea rows={2} value={issuerAddress} onChange={e => setIssuerAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">เบอร์โทร</Label>
                <Input value={issuerPhone} onChange={e => setIssuerPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">อีเมล</Label>
                <Input value={issuerEmail} onChange={e => setIssuerEmail(e.target.value)} />
              </div>
            </div>
            {issuerSignatureUrl && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span>✓ มีลายเซ็นแนบ</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">ลูกค้า</h3>
          {linkedQuotationId && customerName && (
            <span className="text-xs text-[hsl(24,85%,50%)] bg-orange-50 px-2 py-0.5 rounded-full">ดึงจากใบเสนอราคา</span>
          )}
        </div>
        {linkedQuotationId && customerName ? (
          <div className="text-sm text-[hsl(25,20%,25%)] bg-[hsl(35,30%,97%)] rounded-lg px-3 py-2.5 space-y-0.5">
            <p className="font-semibold">{customerName}</p>
            {customerTaxId && <p className="text-xs text-[hsl(25,10%,50%)]">เลขภาษี: {customerTaxId}</p>}
            {customerContact && <p className="text-xs text-[hsl(25,10%,50%)]">ผู้ติดต่อ: {customerContact}</p>}
          </div>
        ) : (
          <>
            {customers.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">เลือกจากฐานข้อมูล (ไม่บังคับ)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="เลือกลูกค้า..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
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
              <Textarea rows={2} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">เลขภาษี</Label>
                <Input value={customerTaxId} onChange={e => setCustomerTaxId(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ผู้ติดต่อ</Label>
                <Input value={customerContact} onChange={e => setCustomerContact(e.target.value)} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">รายการ</h3>
          {linkedQuotationId ? (
            <span className="text-xs text-[hsl(24,85%,50%)] bg-orange-50 px-2 py-0.5 rounded-full">ดึงจากใบเสนอราคา</span>
          ) : (
            <div className="flex items-center gap-2">
              {packages.length > 0 && (
                <PackagePicker
                  packages={packages}
                  onSelect={pkg => setItems(p => [...p, {
                    description: pkg.name + (pkg.description ? `\n${pkg.description}` : ""),
                    quantity: 1,
                    unit_price: pkg.price ?? 0,
                    amount: pkg.price ?? 0,
                  }])}
                />
              )}
              <Button size="sm" variant="outline" onClick={() => setItems(p => [...p, emptyItem()])}>
                <Plus className="w-3.5 h-3.5 mr-1" />เพิ่มรายการ
              </Button>
            </div>
          )}
        </div>
        {linkedQuotationId ? (
          <div className="divide-y divide-[hsl(35,20%,92%)]">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-4 text-sm">
                <p className="text-[hsl(25,20%,20%)] whitespace-pre-line flex-1">{item.description}</p>
                <span className="text-[hsl(25,10%,50%)] shrink-0 text-right">
                  {item.quantity} × {new Intl.NumberFormat("th-TH").format(item.unit_price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="space-y-1">
                  {idx === 0 && <Label className="text-xs">รายละเอียด</Label>}
                  <Textarea rows={2} value={item.description}
                    onChange={e => updateItem(idx, "description", e.target.value)}
                    placeholder="จ้างบริการออกแบบสื่อสิ่งพิมพ์..." className="text-xs" />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="w-20 shrink-0 space-y-1">
                    {idx === 0 && <Label className="text-xs">จำนวน</Label>}
                    <Input type="number" min={1} value={item.quantity}
                      onChange={e => updateItem(idx, "quantity", Number(e.target.value))} />
                  </div>
                  <div className="flex-1 space-y-1">
                    {idx === 0 && <Label className="text-xs">ราคา/หน่วย</Label>}
                    <Input type="number" min={0}
                      value={item.unit_price === 0 ? "" : item.unit_price}
                      onChange={e => updateItem(idx, "unit_price", e.target.value === "" ? 0 : Number(e.target.value))}
                      placeholder="5000" />
                  </div>
                  <div className="shrink-0">
                    {items.length > 1 ? (
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 px-2"
                        onClick={() => setItems(p => p.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    ) : <div className="w-9" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[hsl(25,20%,15%)]">สรุปยอด</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(25,10%,50%)]">ยอดรวม</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {/* Discount row */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[hsl(25,10%,50%)] shrink-0">ส่วนลด</span>
            <div className="flex items-center gap-1.5">
              <div className="flex rounded-lg border border-[hsl(35,20%,88%)] overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setDiscountType("%")}
                  className={`px-2 py-1 transition-colors ${discountType === "%" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-white text-[hsl(25,10%,50%)] hover:bg-[hsl(35,30%,97%)]"}`}
                >%</button>
                <button
                  type="button"
                  onClick={() => setDiscountType("฿")}
                  className={`px-2 py-1 transition-colors ${discountType === "฿" ? "bg-[hsl(24,85%,50%)] text-white" : "bg-white text-[hsl(25,10%,50%)] hover:bg-[hsl(35,30%,97%)]"}`}
                >฿</button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue || ""}
                onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-24 text-right text-sm border border-[hsl(35,20%,88%)] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[hsl(24,85%,50%)]"
              />
              {discountAmount > 0 && (
                <span className="text-red-600 text-sm min-w-[80px] text-right">- {formatCurrency(discountAmount)}</span>
              )}
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-[hsl(25,10%,50%)]">
              <span>หลังส่วนลด</span>
              <span>{formatCurrency(afterDiscount)}</span>
            </div>
          )}
          {docType === "quotation" ? (
            <div className="space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <Checkbox checked={whtMode === "deduct"} onCheckedChange={() => handleSetWhtMode("deduct")} />
                  <span className="text-[hsl(25,10%,50%)] text-sm">หักภาษี ณ ที่จ่าย 3%</span>
                </span>
                {whtMode === "deduct" && <span className="text-red-600 text-sm">- {formatCurrency(whtAmount)}</span>}
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2">
                  <Checkbox checked={whtMode === "grossup"} onCheckedChange={() => handleSetWhtMode("grossup")} />
                  <span className="text-[hsl(25,10%,50%)] text-sm">เพิ่มราคา ก่อนหัก 3% <span className="text-xs text-[hsl(25,10%,65%)]">(÷ 0.97)</span></span>
                </span>
                {whtMode === "grossup" && <span className="text-xs text-[hsl(25,10%,50%)]">ลูกค้าหัก {formatCurrency(whtAmount)}</span>}
              </label>
            </div>
          ) : (
            whtMode !== "none" && (
              <div className="flex justify-between text-[hsl(25,10%,50%)]">
                <span>หักภาษี ณ ที่จ่าย 3%</span>
                <span className="text-red-600">- {formatCurrency(whtAmount)}</span>
              </div>
            )
          )}
          <div className="flex justify-between font-bold text-base border-t border-[hsl(35,20%,88%)] pt-2">
            <span>{whtMode === "grossup" ? "ยอดในเอกสาร" : "ยอดรับสุทธิ"}</span>
            <span className="text-[hsl(24,85%,50%)]">{formatCurrency(total)}</span>
          </div>
          {whtMode === "grossup" && (
            <div className="flex justify-between text-xs text-[hsl(25,10%,50%)]">
              <span>ยอดรับจริงหลังลูกค้าหัก 3%</span>
              <span>{formatCurrency(total - whtAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Remarks & payment terms */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5 space-y-4">
        {docType !== "receipt" && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-[hsl(25,20%,15%)]">หมายเหตุ (แสดงในเอกสาร)</Label>
            <Textarea rows={3} value={docRemarks} onChange={e => setDocRemarks(e.target.value)}
              placeholder="ยืนยันราคาภายใน 30 วัน..." />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-[hsl(25,20%,15%)]">เงื่อนไขการชำระเงิน</Label>
          <Textarea rows={3} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
            placeholder="ชำระเงินภายใน 30 วัน หลังจากส่งมอบงาน" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">บันทึกภายใน (ไม่แสดงในเอกสาร)</Label>
          <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="หมายเหตุสำหรับตัวเอง..." />
        </div>
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
