import Link from "next/link"
import Image from "next/image"
import { getPublicArticles } from "@/lib/public-data"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"

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

      {/* Articles grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">ยังไม่มีบทความ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ScrollReveal key={article.id} delay={Math.min(i, 8) * 60}>
                <Link href={`/blog/${article.slug}`} className="group block">
                  <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    {/* Cover image */}
                    <div className="aspect-video relative bg-[hsl(35,30%,94%)] overflow-hidden">
                      {article.cover_image_url ? (
                        <Image
                          src={article.cover_image_url}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className="text-4xl opacity-20"
                            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                          >
                            R
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-2">
                      {article.category && (
                        <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[hsl(24,85%,50%)]">
                          {article.category}
                        </span>
                      )}
                      <h2 className="font-semibold text-sm text-foreground leading-snug group-hover:text-[hsl(24,85%,50%)] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
                          : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
