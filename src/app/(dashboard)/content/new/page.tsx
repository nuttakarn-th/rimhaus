import { ContentForm } from "@/components/content/ContentForm"
import { getJobs } from "@/actions/jobs.actions"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function NewContentPage() {
  const [jobs, platforms] = await Promise.all([getJobs(), getPlatforms()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">สร้างคอนเทนต์ใหม่</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">วางแผนและจัดการคอนเทนต์</p>
      </div>
      <ContentForm jobs={jobs} platforms={platforms} />
    </div>
  )
}
