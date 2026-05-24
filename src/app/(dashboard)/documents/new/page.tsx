import { getCustomers } from "@/actions/customers.actions"
import { getJobs } from "@/actions/jobs.actions"
import { DocumentForm } from "@/components/documents/DocumentForm"

export default async function NewDocumentPage() {
  const [customers, jobs] = await Promise.all([getCustomers(), getJobs()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">สร้างเอกสาร</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จ</p>
      </div>
      <DocumentForm customers={customers} jobs={jobs} />
    </div>
  )
}
