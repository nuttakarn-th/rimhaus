import Link from "next/link"
import { getArticles } from "@/actions/article.actions"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from "lucide-react"
import { ArticleList } from "@/components/articles/ArticleList"

export default async function ArticlesPage() {
  const articles = await getArticles()

  const published = articles.filter(a => a.status === "published").length
  const draft = articles.filter(a => a.status === "draft").length

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">บทความ</h1>
          {articles.length > 0 ? (
            <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">
              {articles.length} บทความ
              <span className="mx-1.5 text-[hsl(35,20%,78%)]">·</span>
              <span className="text-green-600">{published} เผยแพร่</span>
              {draft > 0 && (
                <>
                  <span className="mx-1.5 text-[hsl(35,20%,78%)]">·</span>
                  <span className="text-amber-600">{draft} ร่าง</span>
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">เขียนและจัดการบทความสำหรับ Blog</p>
          )}
        </div>
        <Link href="/articles/new">
          <Button size="sm" className="shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1.5" />เขียนบทความ
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 text-center">
          <BookOpen className="w-10 h-10 text-[hsl(25,10%,75%)] mx-auto mb-3" />
          <p className="text-sm text-[hsl(25,10%,50%)]">ยังไม่มีบทความ</p>
          <p className="text-xs text-[hsl(25,10%,65%)] mt-1">เริ่มเขียนบทความแรกของคุณ</p>
          <Link href="/articles/new" className="mt-4 inline-block">
            <Button size="sm" variant="outline">เขียนบทความแรก</Button>
          </Link>
        </div>
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}
