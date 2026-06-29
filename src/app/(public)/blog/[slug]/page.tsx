import Image from "next/image"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { getPublicArticleBySlug, getPublicArticles } from "@/lib/public-data"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
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

  return (
    <div className="bg-background min-h-screen">

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="w-full aspect-[21/9] relative max-h-[480px] overflow-hidden bg-[hsl(35,30%,94%)]">
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
          {article.category && (
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[hsl(24,85%,50%)]">
              {article.category}
            </span>
          )}
          <h1
            className="text-3xl sm:text-5xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-base text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
              : ""}
          </p>
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
            <div
              className="article-html"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="prose-article">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-foreground mt-8 mb-4 first:mt-0" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400 }}>{children}</h1>
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
      </div>
    </div>
  )
}
