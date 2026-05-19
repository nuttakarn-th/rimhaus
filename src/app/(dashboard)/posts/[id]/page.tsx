import { notFound } from "next/navigation"
import Link from "next/link"
import { getPost } from "@/actions/posts.actions"
import { DeletePostButton } from "@/components/posts/DeletePostButton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil, ExternalLink } from "lucide-react"

const POST_STATUS_LABELS: Record<string, string> = {
  draft: "ร่าง",
  scheduled: "กำหนดเวลา",
  posted: "โพสแล้ว",
  archived: "เก็บถาวร",
}

const POST_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  archived: "bg-[hsl(35,25%,92%)] text-[hsl(25,20%,40%)]",
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const metrics = [
    { label: "ยอดวิว", value: post.views },
    { label: "ไลค์", value: post.likes },
    { label: "คอมเมนต์", value: post.comments },
    { label: "แชร์", value: post.shares },
    { label: "บันทึก", value: post.saves },
    { label: "Reach", value: post.reach },
  ]

  const hasMetrics = metrics.some(m => m.value != null)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">{post.post_title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${POST_STATUS_COLORS[post.status]}`}>
              {POST_STATUS_LABELS[post.status]}
            </span>
          </div>
          <p className="text-[hsl(25,10%,50%)] mt-1 capitalize">{post.platform}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/posts/${id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="w-3.5 h-3.5 mr-1" />แก้ไข</Button>
          </Link>
          <DeletePostButton id={id} redirectTo="/posts" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[hsl(25,10%,50%)]">วันที่โพส</dt>
            <dd className="font-medium mt-0.5">{post.post_date ? formatDate(String(post.post_date)) : "-"}</dd>
          </div>
          <div>
            <dt className="text-[hsl(25,10%,50%)]">สร้างเมื่อ</dt>
            <dd className="font-medium mt-0.5">{formatDate(post.created_at)}</dd>
          </div>
        </dl>

        {post.post_url && (
          <div className="mt-4 pt-4 border-t border-[hsl(35,20%,88%)]">
            <a href={post.post_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[hsl(24,85%,50%)] hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              เปิดดูโพส
            </a>
          </div>
        )}

        {post.caption && (
          <div className="mt-4 pt-4 border-t border-[hsl(35,20%,88%)]">
            <dt className="text-[hsl(25,10%,50%)] text-sm mb-1">Caption</dt>
            <p className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap">{post.caption}</p>
          </div>
        )}

        {post.hashtags && (
          <div className="mt-4 pt-4 border-t border-[hsl(35,20%,88%)]">
            <dt className="text-[hsl(25,10%,50%)] text-sm mb-1">Hashtags</dt>
            <p className="text-sm text-[hsl(24,85%,50%)]">{post.hashtags}</p>
          </div>
        )}
      </div>

      {hasMetrics && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <h3 className="font-semibold mb-4">สถิติ</h3>
          <div className="grid grid-cols-3 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="text-center p-3 bg-[hsl(35,25%,96%)] rounded-lg">
                <p className="text-2xl font-bold text-[hsl(25,20%,15%)]">
                  {m.value != null ? m.value.toLocaleString() : "—"}
                </p>
                <p className="text-xs text-[hsl(25,10%,50%)] mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.notes && (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
          <h3 className="font-semibold mb-3">โน้ต</h3>
          <p className="text-sm text-[hsl(25,20%,25%)] whitespace-pre-wrap">{post.notes}</p>
        </div>
      )}
    </div>
  )
}
