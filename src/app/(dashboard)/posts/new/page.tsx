import { PostForm } from "@/components/posts/PostForm"
import { getJobs } from "@/actions/jobs.actions"
import { getContentItems } from "@/actions/content.actions"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").eq("is_active", true).order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function NewPostPage() {
  const [jobs, contentItems, platforms] = await Promise.all([
    getJobs(),
    getContentItems(),
    getPlatforms(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">บันทึกโพส</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">บันทึกโพสและสถิติ Social Media</p>
      </div>
      <PostForm jobs={jobs} contentItems={contentItems} platforms={platforms} />
    </div>
  )
}
