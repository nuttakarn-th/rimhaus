import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ArticleForm } from "@/components/articles/ArticleForm"

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ label: "บทความ", href: "/articles" }, { label: "เขียนบทความใหม่" }]} />
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เขียนบทความใหม่</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">สร้างบทความสำหรับ Blog</p>
      </div>
      <ArticleForm />
    </div>
  )
}
