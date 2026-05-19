import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { SocialPost, Platform } from "@/lib/types"
import { Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { DeletePostButton } from "./DeletePostButton"

interface PostCardProps {
  post: SocialPost
  platforms: Platform[]
}

export function PostCard({ post, platforms }: PostCardProps) {
  const platform = platforms.find(p => p.id === post.platform)
  const color = platform?.color ?? "#6b7280"
  const label = platform?.label ?? post.platform

  return (
    <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Platform header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: `${color}15`, borderBottom: `2px solid ${color}` }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold" style={{ color }}>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: color }}>
            {post.status === "posted" ? "โพสแล้ว" : post.status === "draft" ? "ร่าง" : post.status === "scheduled" ? "กำหนดเวลา" : "เก็บเข้าคลัง"}
          </span>
          <DeletePostButton id={post.id} />
        </div>
      </div>

      {/* Content */}
      <Link href={`/posts/${post.id}`} className="block p-4 hover:bg-[hsl(35,25%,98%)]">
        <h3 className="font-semibold text-[hsl(25,20%,15%)] line-clamp-2 mb-1">{post.post_title}</h3>
        {post.post_date && (
          <p className="text-xs text-[hsl(25,10%,50%)] mb-3">{formatDate(post.post_date)}</p>
        )}
        {post.post_url && (
          <a href={post.post_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-[hsl(24,85%,50%)] hover:underline block mb-3 truncate">
            🔗 ดูโพส
          </a>
        )}

        {/* Metrics */}
        {(post.views || post.likes || post.comments || post.shares || post.saves) ? (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[hsl(35,20%,92%)]">
            {post.views != null && (
              <div className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
                <Eye className="w-3 h-3" />{post.views.toLocaleString("th-TH")}
              </div>
            )}
            {post.likes != null && (
              <div className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
                <Heart className="w-3 h-3" />{post.likes.toLocaleString("th-TH")}
              </div>
            )}
            {post.comments != null && (
              <div className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
                <MessageCircle className="w-3 h-3" />{post.comments.toLocaleString("th-TH")}
              </div>
            )}
            {post.shares != null && (
              <div className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
                <Share2 className="w-3 h-3" />{post.shares.toLocaleString("th-TH")}
              </div>
            )}
            {post.saves != null && (
              <div className="flex items-center gap-1 text-xs text-[hsl(25,10%,50%)]">
                <Bookmark className="w-3 h-3" />{post.saves.toLocaleString("th-TH")}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-300 pt-3 border-t border-[hsl(35,20%,92%)]">ยังไม่มีสถิติ</p>
        )}
      </Link>
    </div>
  )
}
