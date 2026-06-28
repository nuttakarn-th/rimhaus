import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { notFound } from "next/navigation"
import { getArticleById } from "@/actions/article.actions"
import { ArticleForm } from "@/components/articles/ArticleForm"

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticleById(id)
  if (!article) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "บทความ", href: "/articles" }, { label: "แก้ไขบทความ" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขบทความ</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">{article.title}</p>
      </div>
      <ArticleForm article={article} />
    </div>
  )
}
