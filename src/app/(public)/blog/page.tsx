import { getPublicArticles } from "@/lib/public-data"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"
import { BlogList } from "@/components/blog/BlogList"

export default async function BlogPage() {
  const articles = await getPublicArticles()

  return (
    <div className="bg-background">

      {/* Header */}
      <div className="px-4 pt-10 pb-8 text-center">
        <ScrollReveal>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">ARTICLES</p>
        </ScrollReveal>
        <HeadingReveal>
          <h1
            className="text-5xl sm:text-7xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            Blog
          </h1>
        </HeadingReveal>
      </div>

      {/* Articles grid with filter */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <BlogList articles={articles} />
      </div>
    </div>
  )
}
