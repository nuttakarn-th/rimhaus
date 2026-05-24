import { JobForm } from "@/components/jobs/JobForm"
import { createClient } from "@/lib/supabase/server"
import { getDocument } from "@/actions/documents.actions"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ from_quotation?: string }>
}) {
  const { from_quotation } = await searchParams
  const [platforms, quotation] = await Promise.all([
    getPlatforms(),
    from_quotation ? getDocument(from_quotation) : Promise.resolve(null),
  ])

  const prefill = quotation
    ? {
        brand_name: quotation.customer_name ?? "",
        payment_amount: quotation.total,
        platforms: quotation.platforms?.length ? quotation.platforms : [],
      }
    : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">สร้างงานรีวิวใหม่</h1>
        {quotation && (
          <p className="text-sm text-[hsl(24,85%,50%)] mt-1">
            ดึงข้อมูลจากใบเสนอราคา {quotation.doc_number} — {quotation.customer_name}
          </p>
        )}
        {!quotation && <p className="text-sm text-[hsl(25,10%,50%)] mt-1">กรอกข้อมูลงานรีวิวจากแบรนด์</p>}
      </div>
      <JobForm platforms={platforms} prefill={prefill} />
    </div>
  )
}
