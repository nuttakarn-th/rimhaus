import Link from "next/link"
import { getPosts } from "@/actions/posts.actions"
import { PostCard } from "@/components/posts/PostCard"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { Plus, FileImage } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Platform } from "@/lib/types"

async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("platforms").select("*").eq("is_active", true).order("sort_order")
  return (data as Platform[]) ?? []
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>
}) {
  const params = await searchParams
  const [posts, platforms] = await Promise.all([
    getPosts({ platform: params.platform }),
    getPlatforms(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">จัดการโพส</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-1">ติดตามโพสและสถิติ Social Media</p>
        </div>
        <Link href="/posts/new">
          <Button><Plus className="w-4 h-4 mr-1" />บันทึกโพส</Button>
        </Link>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/posts"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !params.platform ? "bg-[hsl(24,85%,50%)] text-white" : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
          }`}>
          ทั้งหมด
        </Link>
        {platforms.map(p => (
          <Link key={p.id} href={`/posts?platform=${p.id}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              params.platform === p.id ? "text-white" : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            }`}
            style={params.platform === p.id ? { backgroundColor: p.color } : undefined}>
            {p.label}
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title="ยังไม่มีโพส"
          description="บันทึกโพสที่โพสไปแล้วเพื่อติดตาม engagement และ reach"
          action={{ label: "บันทึกโพสแรก", href: "/posts/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} platforms={platforms} />
          ))}
        </div>
      )}
    </div>
  )
}
