import Link from "next/link"
import { getDocumentsWithLinks } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Pencil, FileCheck, Receipt } from "lucide-react"
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"
import { formatCurrency, cn } from "@/lib/utils"
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton"
import { DocListDownloadBtn } from "@/components/documents/DocListDownloadBtn"
import type { DocType } from "@/lib/types"

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

const TABS: { type: DocType | "all"; label: string }[] = [
  { type: "all", label: "ทั้งหมด" },
  { type: "quotation", label: "ใบเสนอราคา" },
  { type: "invoice", label: "ใบแจ้งหนี้" },
  { type: "receipt", label: "ใบเสร็จ" },
]

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const docType = (["quotation", "invoice", "receipt"].includes(type ?? "") ? type : undefined) as DocType | undefined
  const docs = await getDocumentsWithLinks(docType)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เอกสาร</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จ</p>
        </div>
        <Link href="/documents/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />สร้างเอกสาร
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(35,20%,88%)] overflow-x-auto">
        {TABS.map(tab => {
          const active = (tab.type === "all" && !type) || tab.type === type
          return (
            <Link
              key={tab.type}
              href={tab.type === "all" ? "/documents" : `/documents?type=${tab.type}`}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)]"
                  : "border-transparent text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)]"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <FileText className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-[hsl(25,10%,50%)] text-sm">ยังไม่มีเอกสาร</p>
          <Link href="/documents/new" className="mt-3 inline-block">
            <Button size="sm" variant="outline">สร้างเอกสารแรก</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-3.5 flex items-center gap-3 hover:border-[hsl(24,85%,60%)] transition-colors group"
            >
              {/* Clickable main area */}
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
                    {/* Linked doc badges — shown only on quotations */}
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
                        <span className="text-[hsl(24,85%,50%)]">{doc.platforms.map((p: string) => {
                          const labels: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", lemon8: "Lemon8", shopee: "Shopee" }
                          return labels[p] ?? p
                        }).join(", ")}</span>
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

              {/* Actions */}
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
