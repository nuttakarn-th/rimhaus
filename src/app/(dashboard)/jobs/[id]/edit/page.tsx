import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { notFound } from "next/navigation"
import { getJob } from "@/actions/jobs.actions"
import { JobForm } from "@/components/jobs/JobForm"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [job, platforms] = await Promise.all([getJob(id), getPlatforms()])
  if (!job) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "งานรีวิว", href: "/jobs" }, { label: "แก้ไขงาน" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขงานรีวิว</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">{job.brand_name} — {job.product_name}</p>
      </div>
      <JobForm job={job} platforms={platforms} />
    </div>
  )
}
