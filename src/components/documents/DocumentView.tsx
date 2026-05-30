"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateDocumentStatus, deleteDocument } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, Pencil, Trash2 } from "lucide-react"
import { DocScaler } from "@/components/documents/DocScaler"
import { toast } from "sonner"
import { bahtText, cn } from "@/lib/utils"
import { DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"
import { DownloadPDFButton } from "@/components/documents/DownloadPDFButton"
import type { Document, DocStatus } from "@/lib/types"

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "numeric", day: "numeric" })
}

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

  const isQuotation = doc.doc_type === "quotation"
  const isInvoice = doc.doc_type === "invoice"
  const isReceipt = doc.doc_type === "receipt"

  const titleMap: Record<string, string> = {
    quotation: "ใบเสนอราคา",
    invoice: "ใบส่งมอบงาน/ใบแจ้งหนี้",
    receipt: "ใบเสร็จรับเงิน",
  }
  const titleColorMap: Record<string, string> = {
    quotation: "text-[hsl(24,85%,50%)]",
    invoice: "text-blue-600",
    receipt: "text-green-600",
  }
  const title = titleMap[doc.doc_type]
  const titleColor = titleColorMap[doc.doc_type] ?? "text-[hsl(25,20%,10%)]"

  const remarkLines = (doc.doc_remarks ?? "").split("\n").filter(Boolean)
  const hasBank = doc.issuer_account_number || doc.issuer_bank_name

  return (
    <div>
      {/* Controls — hidden on print */}
      <div className="print:hidden mb-4 space-y-2">
        {/* Quotation CTA row */}
        {isQuotation && (
          <Link href={`/jobs/new?from_quotation=${doc.id}`} className="block">
            <Button variant="outline" className="w-full text-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)] hover:bg-orange-50">
              <ClipboardList className="w-4 h-4 mr-2" />สร้างงานรีวิวจาก QT นี้
            </Button>
          </Link>
        )}
        {/* Status row */}
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={v => handleStatusChange(v as DocStatus)} disabled={updating}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
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
        </div>
        {/* Actions row */}
        <div className="flex items-center gap-2">
          <DownloadPDFButton doc={doc} className="flex-1 sm:flex-none" />
          <Link href={`/documents/${doc.id}/edit`} className="flex-1 sm:flex-none">
            <Button size="sm" variant="outline" className="w-full">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />แก้ไข
            </Button>
          </Link>
          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 shrink-0" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ===== A4 DOCUMENT — scale-to-fit on mobile ===== */}
      <DocScaler>
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] print:rounded-none print:border-none print:shadow-none"
        style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', sans-serif" }}>
        <div id="doc-printarea" className="p-4 sm:p-8 print:p-0 max-w-[794px] mx-auto print:max-w-none">

          {/* Header: issuer left, title+number right */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-sm leading-relaxed">
              {/* Logo / header image */}
              {doc.issuer_header_image_url && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.issuer_header_image_url}
                    alt="Logo"
                    className="max-h-14 max-w-[260px] object-contain"
                  />
                </div>
              )}
              <div className="font-bold text-base text-[hsl(25,20%,10%)]">{doc.issuer_name ?? "—"}</div>
              {doc.issuer_address && (
                <div className="text-[hsl(25,10%,35%)] whitespace-pre-line mt-0.5 text-xs leading-snug">
                  {doc.issuer_address}
                </div>
              )}
              {(doc.issuer_phone || doc.issuer_email) && (
                <div className="text-[hsl(25,10%,35%)] text-xs mt-0.5">
                  {doc.issuer_phone && <>เบอร์โทรศัพท์ {doc.issuer_phone}</>}
                  {doc.issuer_phone && doc.issuer_email && "  "}
                  {doc.issuer_email && <>อีเมล {doc.issuer_email}</>}
                </div>
              )}
              {doc.issuer_id_card && (
                <div className="text-[hsl(25,10%,35%)] text-xs mt-0.5">
                  เลขที่บัตรประชาชน {doc.issuer_id_card}
                </div>
              )}
            </div>

            <div className="text-right shrink-0 ml-4">
              <div className={`text-lg sm:text-2xl font-black tracking-tight whitespace-nowrap ${titleColor}`}>{title}</div>
              <div className="mt-2 text-sm space-y-0.5">
                <div className="flex justify-end gap-4 items-center">
                  <span className="text-[hsl(25,10%,45%)]">เลขที่</span>
                  <span className="font-semibold underline underline-offset-4 min-w-[6rem] text-right">{doc.doc_number}</span>
                  <span className="text-[hsl(25,10%,45%)] opacity-0">.</span>
                </div>
                <div className="flex justify-end gap-4 items-center">
                  <span className="text-[hsl(25,10%,45%)]">วันที่</span>
                  <span className="font-semibold underline underline-offset-4 min-w-[6rem] text-right">{formatThaiDate(doc.doc_date)}</span>
                  <span className="text-[hsl(25,10%,45%)] opacity-0">.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="mb-5 text-sm">
            <div className="flex gap-4">
              <span className="font-bold text-[hsl(25,20%,10%)] w-12 shrink-0">{isInvoice ? "ATTN:" : "เสนอ"}</span>
              <span className="font-bold text-[hsl(25,20%,10%)]">{doc.customer_name ?? "—"}</span>
            </div>
            {doc.customer_address && (
              <div className="flex gap-4 mt-0.5">
                <span className="font-bold text-[hsl(25,20%,10%)] w-12 shrink-0">ที่อยู่</span>
                <div>
                  <div className="text-[hsl(25,10%,35%)] text-xs leading-snug whitespace-pre-line">{doc.customer_address}</div>
                  {doc.customer_tax_id && (
                    <div className="text-xs text-[hsl(25,10%,45%)]">เลขที่ภาษี {doc.customer_tax_id}</div>
                  )}
                </div>
              </div>
            )}
            {!doc.customer_address && doc.customer_tax_id && (
              <div className="flex gap-4 mt-0.5">
                <span className="w-12 shrink-0" />
                <div className="text-xs text-[hsl(25,10%,45%)]">เลขที่ภาษี {doc.customer_tax_id}</div>
              </div>
            )}
          </div>

          {/* Platforms */}
          {doc.platforms && doc.platforms.length > 0 && (
            <div className="mb-4 flex gap-4 text-sm">
              <span className="font-bold text-[hsl(25,20%,10%)] w-12 shrink-0">Platform</span>
              <span className="text-[hsl(25,10%,35%)]">{doc.platforms.map(p => {
                const labels: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", lemon8: "Lemon8", shopee: "Shopee" }
                return labels[p] ?? p
              }).join(", ")}</span>
            </div>
          )}

          {/* Items table */}
          <table className="w-full text-sm mb-1 border-collapse">
            <thead>
              <tr className="bg-[hsl(25,20%,15%)] text-white">
                <th className="py-2 px-3 text-center text-xs font-semibold w-10">ลำดับ</th>
                <th className="py-2 px-3 text-left text-xs font-semibold">รายการ</th>
                <th className="py-2 px-3 text-center text-xs font-semibold w-16">หน่วย</th>
                <th className="py-2 px-3 text-right text-xs font-semibold w-28">ราคา<br />ต่อหน่วย</th>
                <th className="py-2 px-3 text-right text-xs font-semibold w-28">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {doc.document_items?.map((item, i) => (
                <tr key={item.id} className="border-b border-[hsl(35,20%,88%)]">
                  <td className="py-1.5 px-3 text-center text-[hsl(25,10%,50%)]">{i + 1}</td>
                  <td className="py-1.5 px-3 whitespace-pre-line leading-snug">{item.description}</td>
                  <td className="py-1.5 px-3 text-center text-[hsl(25,10%,50%)]">{item.quantity}</td>
                  <td className="py-1.5 px-3 text-right text-[hsl(25,10%,40%)]">
                    {item.unit_price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-3 text-right font-medium">
                    {item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {/* Empty rows to fill space */}
              {Array.from({ length: Math.max(0, 3 - (doc.document_items?.length ?? 0)) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-[hsl(35,20%,88%)]">
                  <td className="py-1.5 px-3">&nbsp;</td>
                  <td className="py-1.5 px-3" />
                  <td className="py-1.5 px-3" />
                  <td className="py-1.5 px-3" />
                  <td className="py-1.5 px-3" />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[hsl(25,20%,15%)]">
                <td colSpan={3} className="py-2 px-3 text-sm">
                  <span className="font-bold">รวมทั้งสิ้น</span>
                  {" "}
                  <span className="text-[hsl(25,10%,45%)]">
                    ({bahtText(doc.total)})
                  </span>
                </td>
                {(() => {
                  const hasDiscount = (doc.discount_amount ?? 0) > 0
                  const hasWht = doc.wht_rate > 0  // grossup (wht_rate=-3) hides WHT line
                  return (
                    <>
                      <td className="py-2 px-3 text-right text-xs text-[hsl(25,10%,45%)]">
                        {hasDiscount && (
                          <><span>ส่วนลด {doc.discount_type === "%" ? `${doc.discount_value}%` : ""}</span><br /></>
                        )}
                        {hasWht && (
                          <span>หัก ณ ที่จ่าย 3%</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {hasDiscount && (
                          <>
                            <div className="text-[hsl(25,10%,40%)] text-xs">
                              {doc.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-red-600 text-xs">
                              -{(doc.discount_amount ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </div>
                          </>
                        )}
                        {hasWht && (
                          <div className="text-red-600 text-xs">
                            -{doc.wht_amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        <div className="font-bold text-base border-t border-[hsl(25,20%,20%)] mt-1 pt-1">
                          {doc.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                    </>
                  )
                })()}
              </tr>
            </tfoot>
          </table>

          {/* Remarks */}
          {(remarkLines.length > 0 || doc.payment_terms || hasBank) && (
            <div className="mt-4 text-xs text-[hsl(25,10%,30%)] space-y-2">
              {remarkLines.length > 0 && (
                <div>
                  <div className="font-bold text-[hsl(25,20%,15%)]">หมายเหตุ :</div>
                  <ul className="mt-0.5 space-y-0.5">
                    {remarkLines.map((line, i) => (
                      <li key={i} className="flex gap-1.5"><span>●</span><span>{line}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {doc.payment_terms && (
                <div>
                  <div className="font-bold text-[hsl(25,20%,15%)]">เงื่อนไขการชำระเงิน :</div>
                  {doc.payment_terms.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="mt-0.5">● {line}</div>
                  ))}
                </div>
              )}
              {hasBank && (
                <div>
                  <div className="font-bold text-[hsl(25,20%,15%)]">ข้อมูลการชำระเงิน :</div>
                  <div className="mt-0.5">ชื่อบัญชี: {doc.issuer_account_name}</div>
                  <div>เลขที่บัญชี: {doc.issuer_account_number} ธนาคาร {doc.issuer_bank_name}
                    {doc.issuer_bank_branch ? ` สาขา ${doc.issuer_bank_branch}` : ""}
                  </div>
                  {isInvoice && doc.issuer_phone && (
                    <div>เบอร์ติดต่อ {doc.issuer_phone}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery note for invoice */}
          {isInvoice && (
            <div className="mt-3 text-xs font-semibold text-[hsl(25,20%,15%)]">
              ได้รับงานตามรายการข้างต้นไว้โดยถูกต้องและเรียบร้อย
            </div>
          )}

          {/* Signature section */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Left: Customer/receiver */}
            <div className="border border-[hsl(35,20%,80%)] rounded p-3 text-xs text-center space-y-2">
              <div className="font-bold text-[hsl(25,20%,15%)] text-left">
                {isInvoice ? "ผู้รับงาน" : (isQuotation ? "ลูกค้า/ผู้อนุมัติ" : "ผู้จ่ายเงิน")}
              </div>
              <div className="h-8" />
              <div className="border-b border-[hsl(25,20%,40%)] mx-4" />
              <div className="text-[hsl(25,10%,45%)]">(........................................................)</div>
              <div className="text-[hsl(25,10%,45%)]">วันที่...... /...... /......</div>
            </div>

            {/* Right: Issuer/sender */}
            <div className="border border-[hsl(35,20%,80%)] rounded p-3 text-xs text-center space-y-1.5">
              <div className="font-bold text-[hsl(25,20%,15%)] text-left">
                {isInvoice ? "ผู้ส่งงาน" : (isQuotation ? "ผู้เสนอราคา" : "ผู้รับเงิน")}
              </div>
              <div className="flex items-end justify-center h-10">
                {doc.issuer_signature_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={doc.issuer_signature_url} alt="ลายเซ็น"
                    className="max-h-9 max-w-[140px] object-contain" />
                ) : (
                  <div className="h-8" />
                )}
              </div>
              <div className="border-b border-[hsl(25,20%,40%)] mx-4" />
              <div className="text-[hsl(25,10%,35%)] font-medium">({doc.issuer_name})</div>
              <div className="text-[hsl(25,10%,45%)]">วันที่ {formatThaiDate(doc.doc_date)}</div>
            </div>
          </div>

          {/* Footer for quotation */}
          {isQuotation && (doc.issuer_contact_line || doc.issuer_email) && (
            <div className="mt-4 text-xs text-[hsl(25,10%,40%)]">
              {doc.issuer_contact_line ? (
                <>ยืนยันใบเสนอราคา : โอนเงินและส่ง Line ยืนยันที่{" "}
                  <span className="font-semibold text-[hsl(25,20%,15%)]">{doc.issuer_contact_line}</span>
                </>
              ) : (
                <>ยืนยันใบเสนอราคา : โอนเงินและส่งเมลยืนยันที่{" "}
                  <a href={`mailto:${doc.issuer_email}`} className="underline text-[hsl(24,85%,50%)]">
                    {doc.issuer_email}
                  </a>
                </>
              )}
            </div>
          )}

        </div>
      </div>
      </DocScaler>
    </div>
  )
}
