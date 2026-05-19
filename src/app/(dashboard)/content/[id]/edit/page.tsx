import { notFound } from "next/navigation"
import { getContentItem } from "@/actions/content.actions"
import { getJobs } from "@/actions/jobs.actions"
import { ContentForm } from "@/components/content/ContentForm"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [item, jobs, platforms] = await Promise.all([getContentItem(id), getJobs(), getPlatforms()])
  if (!item) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขคอนเทนต์</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">{item.title}</p>
      </div>
      <ContentForm item={item} jobs={jobs} platforms={platforms} />
    </div>
  )
}
