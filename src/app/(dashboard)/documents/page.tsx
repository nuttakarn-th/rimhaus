import Link from "next/link"
import { getDocumentsWithLinks } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { DocumentList } from "@/components/documents/DocumentList"
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
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
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
        <DocumentList docs={docs} />
      )}
    </div>
  )
}
