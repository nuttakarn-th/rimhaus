"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateDocumentStatus, deleteDocument } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { Document, DocStatus } from "@/lib/types"

export function DocumentView({ document: doc }: { document: Document }) {
  const router = useRouter()
  const [status, setStatus] = useState<DocStatus>(doc.status)
  const [updating, setUpdating] = useState(false)

  async function handleStatusChange(newStatus: DocStatus) {
    setUpdating(true)
    setStatus(newStatus)
    const result = await updateDocumentStatus(doc.id, newStatus)
    setUpdating(false)
    if (!result.success) { toast.error(result.error); setStatus(doc.status); return }
    toast.success("อัปเดตสถานะแล้ว")
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("ลบเอกสารนี้ใช่มั้ย?")) return
    const result = await deleteDocument(doc.id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.push("/documents")
  }

  const typeTh = DOC_TYPE_LABELS[doc.doc_type]

  return (
    <div>
      {/* Controls (hidden when printing) */}
      <div className="print:hidden flex items-center gap-3 mb-6 flex-wrap">
        <Select value={status} onValueChange={v => handleStatusChange(v as DocStatus)} disabled={updating}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">ร่าง</SelectItem>
            <SelectItem value="sent">ส่งแล้ว</SelectItem>
            <SelectItem value="paid">ชำระแล้ว</SelectItem>
            <SelectItem value="cancelled">ยกเลิก</SelectItem>
          </SelectContent>
        </Select>
        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", DOC_STATUS_COLORS[status])}>
          {DOC_STATUS_LABELS[status]}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1.5" />พิมพ์ / PDF
          </Button>
          <Link href={`/documents/${doc.id}/edit`}>
            <Button size="sm" variant="outline">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />แก้ไข
            </Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Document (A4 print layout) */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-8 max-w-2xl print:max-w-none print:rounded-none print:border-none print:shadow-none print:p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xl font-black text-[hsl(25,20%,15%)]">🏠 Rimhaus</div>
            <div className="text-xs text-[hsl(25,10%,50%)] mt-0.5">un.finished.house</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-[hsl(24,85%,50%)]">{typeTh}</div>
            <div className="text-sm text-[hsl(25,10%,50%)] mt-0.5">เลขที่ {doc.doc_number}</div>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-[hsl(25,20%,15%)] text-xs uppercase tracking-wide mb-2">เสนอต่อ</div>
            <div className="font-semibold">{doc.customer_name ?? "-"}</div>
            {doc.customer_address && (
              <div className="text-[hsl(25,10%,50%)] text-xs leading-relaxed whitespace-pre-line">{doc.customer_address}</div>
            )}
            {doc.customer_tax_id && (
              <div className="text-xs text-[hsl(25,10%,60%)]">เลขภาษี: {doc.customer_tax_id}</div>
            )}
            {doc.customer_contact && (
              <div className="text-xs text-[hsl(25,10%,60%)]">ผู้ติดต่อ: {doc.customer_contact}</div>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-right">
            <div className="flex justify-between gap-4">
              <span className="text-[hsl(25,10%,50%)]">วันที่ออก</span>
              <span>{new Date(doc.doc_date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {doc.due_date && (
              <div className="flex justify-between gap-4">
                <span className="text-[hsl(25,10%,50%)]">กำหนดส่งงาน</span>
                <span>{new Date(doc.due_date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-[hsl(25,20%,15%)]">
              <th className="text-left py-2 text-xs font-semibold text-[hsl(25,20%,15%)] w-8">#</th>
              <th className="text-left py-2 text-xs font-semibold text-[hsl(25,20%,15%)]">รายการ</th>
              <th className="text-right py-2 text-xs font-semibold text-[hsl(25,20%,15%)] w-16">จำนวน</th>
              <th className="text-right py-2 text-xs font-semibold text-[hsl(25,20%,15%)] w-24">ราคา/หน่วย</th>
              <th className="text-right py-2 text-xs font-semibold text-[hsl(25,20%,15%)] w-28">รวม</th>
            </tr>
          </thead>
          <tbody>
            {doc.document_items?.map((item, i) => (
              <tr key={item.id} className="border-b border-[hsl(35,20%,90%)]">
                <td className="py-2.5 text-[hsl(25,10%,60%)] text-xs">{i + 1}</td>
                <td className="py-2.5 whitespace-pre-line leading-relaxed">{item.description}</td>
                <td className="py-2.5 text-right text-[hsl(25,10%,60%)]">{item.quantity}</td>
                <td className="py-2.5 text-right text-[hsl(25,10%,60%)]">{formatCurrency(item.unit_price)}</td>
                <td className="py-2.5 text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-60 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(25,10%,50%)]">ยอดรวม</span>
              <span>{formatCurrency(doc.subtotal)}</span>
            </div>
            {doc.wht_rate > 0 && (
              <div className="flex justify-between">
                <span className="text-[hsl(25,10%,50%)]">หักภาษี ณ ที่จ่าย {doc.wht_rate}%</span>
                <span className="text-red-600">- {formatCurrency(doc.wht_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t-2 border-[hsl(25,20%,15%)] pt-2">
              <span>ยอดรับสุทธิ</span>
              <span className="text-[hsl(24,85%,50%)]">{formatCurrency(doc.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div className="mt-6 pt-4 border-t border-[hsl(35,20%,88%)]">
            <div className="text-xs font-semibold text-[hsl(25,20%,35%)] mb-1">หมายเหตุ</div>
            <div className="text-xs text-[hsl(25,10%,50%)] whitespace-pre-line">{doc.notes}</div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-center">
          <div className="space-y-6">
            <div className="border-b border-[hsl(25,20%,40%)] pb-0.5 mx-4"></div>
            <div className="text-[hsl(25,10%,50%)]">ผู้รับเอกสาร / Received by</div>
          </div>
          <div className="space-y-6">
            <div className="border-b border-[hsl(25,20%,40%)] pb-0.5 mx-4"></div>
            <div className="text-[hsl(25,10%,50%)]">ผู้ออกเอกสาร / Issued by</div>
          </div>
        </div>
      </div>
    </div>
  )
}
