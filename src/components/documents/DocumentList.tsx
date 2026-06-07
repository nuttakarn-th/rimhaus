"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Pencil, FileCheck, Receipt, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"
import { formatCurrency, cn } from "@/lib/utils"
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton"
import { DocListDownloadBtn } from "@/components/documents/DocListDownloadBtn"
import { PlatformChip } from "@/components/ui/PlatformIcon"
import type { DocumentWithLinks } from "@/actions/documents.actions"

const DOC_TYPE_BADGE: Record<string, string> = {
  quotation: "bg-orange-50 text-orange-600",
  invoice: "bg-blue-50 text-blue-600",
  receipt: "bg-green-50 text-green-600",
}
const DOC_TYPE_ICON_BG: Record<string, string> = {
  quotation: "bg-orange-50",
  invoice: "bg-blue-50",
  receipt: "bg-green-50",
}
const DOC_TYPE_ICON_COLOR: Record<string, string> = {
  quotation: "text-[hsl(24,85%,50%)]",
  invoice: "text-blue-600",
  receipt: "text-green-600",
}

function docKeywords(doc: DocumentWithLinks): string {
  return [
    doc.doc_number,
    doc.customer_name,
    doc.customers?.name,
    doc.customer_address,
    doc.customer_tax_id,
    doc.customer_contact,
    doc.doc_remarks,
    doc.payment_terms,
    doc.notes,
    doc.total.toLocaleString("th-TH"),
    new Date(doc.doc_date).toLocaleDateString("th-TH"),
    DOC_TYPE_LABELS[doc.doc_type],
    DOC_STATUS_LABELS[doc.status],
  ].filter(Boolean).join(" ").toLowerCase()
}

export function DocumentList({ docs }: { docs: DocumentWithLinks[] }) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = q ? docs.filter(d => docKeywords(d).includes(q)) : docs

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)]" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ค้นหาเลขที่ ชื่อลูกค้า เลขภาษี หมายเหตุ ราคา..."
          className="pl-8 pr-8 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(25,10%,60%)] hover:text-[hsl(25,20%,25%)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {query && (
        <p className="text-xs text-[hsl(25,10%,55%)] px-1">
          พบ {filtered.length} รายการ
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-8 text-center">
          <p className="text-sm text-[hsl(25,10%,50%)]">ไม่พบเอกสารที่ค้นหา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-3.5 flex items-center gap-3 hover:border-[hsl(24,85%,60%)] transition-colors group"
            >
              <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${DOC_TYPE_ICON_BG[doc.doc_type] ?? "bg-orange-50"}`}>
                  <FileText className={`w-4 h-4 ${DOC_TYPE_ICON_COLOR[doc.doc_type] ?? "text-[hsl(24,85%,50%)]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">{doc.doc_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_TYPE_BADGE[doc.doc_type] ?? "bg-[hsl(35,25%,94%)] text-[hsl(25,10%,60%)]"}`}>
                      {DOC_TYPE_LABELS[doc.doc_type]}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", DOC_STATUS_COLORS[doc.status])}>
                      {DOC_STATUS_LABELS[doc.status]}
                    </span>
                    {doc.doc_type === "quotation" && doc.invoice_count > 0 && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        <FileCheck className="w-3 h-3" />INV ×{doc.invoice_count}
                      </span>
                    )}
                    {doc.doc_type === "quotation" && doc.receipt_count > 0 && (
                      <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        <Receipt className="w-3 h-3" />REC ×{doc.receipt_count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[hsl(25,10%,50%)] mt-0.5 flex-wrap">
                    <span>{doc.customer_name ?? doc.customers?.name ?? "-"}</span>
                    <span>·</span>
                    <span>{new Date(doc.doc_date).toLocaleDateString("th-TH")}</span>
                    {doc.platforms && doc.platforms.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          {doc.platforms.map((p: string) => (
                            <PlatformChip key={p} platform={p} size="xs" showLabel={false} />
                          ))}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-[hsl(25,10%,65%)]">
                      สร้าง {new Date(doc.created_at).toLocaleString("th-TH", {
                        day: "numeric", month: "short", year: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 pr-2">
                  <div className="font-bold text-sm text-[hsl(24,85%,50%)]">{formatCurrency(doc.total)}</div>
                  {doc.wht_rate > 0 && (
                    <div className="text-xs text-[hsl(25,10%,60%)]">หลัง WHT {doc.wht_rate}%</div>
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-0.5 shrink-0">
                <DocListDownloadBtn docId={doc.id} />
                <Link href={`/documents/${doc.id}/edit`}>
                  <Button size="sm" variant="ghost" className="text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)]">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <DeleteDocumentButton id={doc.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
