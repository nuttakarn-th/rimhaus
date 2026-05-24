import Link from "next/link"
import { getDocuments } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import { DOC_TYPE_LABELS, DOC_STATUS_LABELS, DOC_STATUS_COLORS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { DocType } from "@/lib/types"

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
  const docs = await getDocuments(docType)

  return (
    <div className="space-y-6 max-w-3xl">
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
      <div className="flex gap-1 border-b border-[hsl(35,20%,88%)]">
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
            <Link key={doc.id} href={`/documents/${doc.id}`} className="block">
              <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] px-5 py-4 flex items-center gap-4 hover:border-[hsl(24,85%,60%)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[hsl(24,85%,50%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[hsl(25,20%,15%)]">{doc.doc_number}</span>
                    <span className="text-xs text-[hsl(25,10%,60%)] bg-[hsl(35,25%,94%)] px-2 py-0.5 rounded-full">
                      {DOC_TYPE_LABELS[doc.doc_type]}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", DOC_STATUS_COLORS[doc.status])}>
                      {DOC_STATUS_LABELS[doc.status]}
                    </span>
                  </div>
                  <div className="text-xs text-[hsl(25,10%,50%)] mt-0.5">
                    {doc.customer_name ?? doc.customers?.name ?? "-"} · {new Date(doc.doc_date).toLocaleDateString("th-TH")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-[hsl(24,85%,50%)]">{formatCurrency(doc.total)}</div>
                  {doc.wht_rate > 0 && (
                    <div className="text-xs text-[hsl(25,10%,60%)]">หลัง WHT {doc.wht_rate}%</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
