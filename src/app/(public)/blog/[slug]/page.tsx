import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getPublicArticleBySlug, getRelatedArticles } from "@/lib/public-data"
import { ShareButtons } from "@/components/blog/ShareButtons"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

function readingTime(content: string | null): number {
  if (!content) return 1
  const text = content.replace(/<[^>]*>/g, " ").replace(/[#*_`>\[\]!]/g, "").replace(/\s+/g, " ").trim()
  return Math.max(1, Math.ceil(text.length / 350))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublicArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: article.cover_image_url
      ? { images: [{ url: article.cover_image_url }] }
      : undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getPublicArticleBySlug(slug)
  if (!article) notFound()

  const [relatedFiltered] = await Promise.all([
    getRelatedArticles(slug, article.category, 3),
  ])
  const minutes = readingTime(article.content)

  return (
    <div className="bg-background min-h-screen">

      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-[hsl(25,10%,55%)] hover:text-[hsl(24,85%,50%)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับไปบล็อก
        </Link>
      </div>

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="w-full aspect-[21/9] relative max-h-[480px] overflow-hidden bg-[hsl(35,30%,94%)] mt-4">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        </div>
      )}

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Meta */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {article.category && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-[hsl(24,85%,50%)]">
                {article.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[hsl(25,10%,60%)]">
              <Clock className="w-3 h-3" />
              อ่านประมาณ {minutes} นาที
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            <span>
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
                : ""}
            </span>
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map(tag => (
                <span key={tag} className="text-xs bg-[hsl(35,30%,94%)] text-[hsl(25,20%,40%)] px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border mb-8" />

        {/* Content — HTML (Tiptap) or Markdown */}
        {article.content && (
          article.content.trimStart().startsWith("<") ? (
            <div className="article-html" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div className="prose-article">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl text-foreground mt-8 mb-4 first:mt-0" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-foreground mt-7 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-base text-foreground/85 leading-[1.8] mb-5">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[hsl(24,85%,50%)] underline underline-offset-2 hover:text-[hsl(24,85%,40%)] transition-colors">
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 mb-5 text-foreground/85">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 mb-5 text-foreground/85">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-base leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[hsl(24,85%,50%)] pl-4 italic text-muted-foreground my-5">{children}</blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-")
                    if (isBlock) {
                      return <code className="block bg-[hsl(25,15%,12%)] text-[hsl(35,30%,85%)] p-4 rounded-xl text-sm font-mono overflow-x-auto mb-5">{children}</code>
                    }
                    return <code className="bg-[hsl(35,30%,94%)] text-[hsl(25,20%,20%)] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                  },
                  img: ({ src, alt }) => (
                    <span className="block my-6 rounded-xl overflow-hidden">
                      {src && <img src={src} alt={alt ?? ""} className="w-full h-auto rounded-xl" />}
                    </span>
                  ),
                  hr: () => <hr className="border-border my-8" />,
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          )
        )}

        {/* Share */}
        <div className="mt-10 pt-8 border-t border-border">
          <ShareButtons />
        </div>

        {/* Related articles */}
        {relatedFiltered.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-bold text-[hsl(25,20%,20%)] uppercase tracking-widest mb-5">
              บทความที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedFiltered.map(rel => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group block bg-[hsl(35,30%,97%)] hover:bg-white rounded-xl border border-[hsl(35,20%,88%)] hover:border-[hsl(35,20%,78%)] hover:shadow-sm transition-all overflow-hidden"
                >
                  {rel.cover_image_url ? (
                    <div className="aspect-video overflow-hidden bg-[hsl(35,25%,92%)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rel.cover_image_url}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[hsl(35,25%,92%)]" />
                  )}
                  <div className="p-3">
                    {rel.category && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(24,85%,50%)] mb-1">
                        {rel.category}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[hsl(25,20%,15%)] group-hover:text-[hsl(24,85%,45%)] leading-snug transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-[hsl(25,10%,60%)] mt-1">
                      {rel.published_at
                        ? new Date(rel.published_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" })
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog — bottom */}
        <div className="mt-12 pt-8 border-t border-border flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[hsl(35,20%,83%)] text-sm text-[hsl(25,20%,30%)] hover:border-[hsl(24,85%,50%)] hover:text-[hsl(24,85%,45%)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปดูบทความทั้งหมด
          </Link>
        </div>

      </div>
    </div>
  )
}
