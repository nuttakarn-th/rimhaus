import Link from "next/link"
import { getArticles } from "@/actions/article.actions"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, BookOpen } from "lucide-react"
import { DeleteArticleButton } from "@/components/articles/DeleteArticleButton"

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">บทความ</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">เขียนและจัดการบทความสำหรับ Blog</p>
        </div>
        <Link href="/articles/new">
          <Button size="sm">
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
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[hsl(25,20%,15%)] truncate">{article.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      article.status === "published"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {article.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {article.category && (
                      <span className="text-xs text-[hsl(25,10%,55%)]">{article.category}</span>
                    )}
                    <span className="text-xs text-[hsl(25,10%,65%)]">
                      {new Date(article.created_at).toLocaleDateString("th-TH")}
                    </span>
                    {article.slug && (
                      <span className="text-xs font-mono text-[hsl(25,10%,65%)] truncate">/blog/{article.slug}</span>
                    )}
                  </div>
                  {article.excerpt && (
                    <p className="text-xs text-[hsl(25,10%,50%)] mt-1.5 line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/articles/${article.id}/edit`}>
                    <Button size="sm" variant="ghost"><Pencil className="w-3.5 h-3.5" /></Button>
                  </Link>
                  <DeleteArticleButton id={article.id} title={article.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
