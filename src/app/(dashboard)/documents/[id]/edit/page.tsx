import { notFound } from "next/navigation"
import { getDocument, getQuotations } from "@/actions/documents.actions"
import { getCustomers } from "@/actions/customers.actions"
import { getJobs } from "@/actions/jobs.actions"
import { getIssuers } from "@/actions/issuers.actions"
import { getAllPackages } from "@/actions/ratecard.actions"
import { DocumentForm } from "@/components/documents/DocumentForm"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [doc, customers, jobs, issuers, quotations, packages, platforms] = await Promise.all([
    getDocument(id), getCustomers(), getJobs(), getIssuers(), getQuotations(), getAllPackages(), getPlatforms(),
  ])
  if (!doc) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขเอกสาร</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">{doc.doc_number}</p>
      </div>
      <DocumentForm document={doc} customers={customers} jobs={jobs} issuers={issuers} quotations={quotations} packages={packages} platforms={platforms} />
    </div>
  )
}
