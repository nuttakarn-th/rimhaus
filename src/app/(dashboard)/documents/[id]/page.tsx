import { notFound } from "next/navigation"
import { getDocument } from "@/actions/documents.actions"
import { DocumentView } from "@/components/documents/DocumentView"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ClipboardList } from "lucide-react"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await getDocument(id)
  if (!doc) notFound()

  return (
    <div className="space-y-4 max-w-2xl print:max-w-none print:m-0 print:p-0 print:space-y-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/documents" className="flex items-center gap-1 text-sm text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors">
          <ChevronLeft className="w-4 h-4" />กลับ
        </Link>
        {doc.doc_type === "quotation" && (
          <Link href={`/jobs/new?from_quotation=${id}`}>
            <Button size="sm" variant="outline" className="text-[hsl(24,85%,50%)] border-[hsl(24,85%,50%)]">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              สร้างงานรีวิวจาก QT นี้
            </Button>
          </Link>
        )}
      </div>
      <DocumentView document={doc} />
    </div>
  )
}
