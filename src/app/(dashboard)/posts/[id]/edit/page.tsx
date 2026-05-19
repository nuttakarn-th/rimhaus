import { notFound } from "next/navigation"
import { getPost } from "@/actions/posts.actions"
import { getJobs } from "@/actions/jobs.actions"
import { getContentItems } from "@/actions/content.actions"
import { PostForm } from "@/components/posts/PostForm"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, jobs, contentItems, platforms] = await Promise.all([
    getPost(id),
    getJobs(),
    getContentItems(),
    getPlatforms(),
  ])
  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขโพส</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">{post.post_title}</p>
      </div>
      <PostForm post={post} jobs={jobs} contentItems={contentItems} platforms={platforms} />
    </div>
  )
}
