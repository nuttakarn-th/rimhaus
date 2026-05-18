import { JobForm } from "@/components/jobs/JobForm"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function NewJobPage() {
  const platforms = await getPlatforms()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">สร้างงานรีวิวใหม่</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">กรอกข้อมูลงานรีวิวจากแบรนด์</p>
      </div>
      <JobForm platforms={platforms} />
    </div>
  )
}
