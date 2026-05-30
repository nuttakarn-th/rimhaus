import { notFound } from "next/navigation"
import { getDocument } from "@/actions/documents.actions"
import { DocumentView } from "@/components/documents/DocumentView"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await getDocument(id)
  if (!doc) notFound()

  return (
    <div className="space-y-4 max-w-2xl print:max-w-none print:m-0 print:p-0 print:space-y-0">
      <Link href="/documents" className="flex items-center gap-1 text-sm text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors print:hidden">
        <ChevronLeft className="w-4 h-4" />กลับ
      </Link>
      <DocumentView document={doc} />
    </div>
  )
}
