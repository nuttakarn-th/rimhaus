import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getPublicSettings, getPublicArticles, getPublicAlbumsWithItems, getPublicPartners, getPublicPortfolioItems } from "@/lib/public-data"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const siteName = settings?.page_name ?? "Rimhaus"
  return {
    title: siteName,
    description: `${siteName} — แรงบันดาลใจตกแต่งบ้าน ออกแบบมุมบ้านด้วย AI และบทความที่คุณชอบ`,
    openGraph: {
      title: siteName,
      description: `${siteName} — แรงบันดาลใจตกแต่งบ้าน ออกแบบมุมบ้านด้วย AI และบทความที่คุณชอบ`,
    },
  }
}

export default async function HomePage() {
  const [settings, articles, albums, partners, portfolioItems] = await Promise.all([
    getPublicSettings(),
    getPublicArticles(),
    getPublicAlbumsWithItems(),
    getPublicPartners(),
    getPublicPortfolioItems(),
  ])

  const recentArticles = articles.slice(0, 3)
  const recentPhotos = portfolioItems.filter(i => i.type === "photo").slice(0, 6)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden w-full -mt-14 min-h-screen bg-gradient-to-br from-[hsl(25,20%,12%)] via-[hsl(22,25%,18%)] to-[hsl(30,20%,14%)] text-white">
        {settings?.hero_bg_image_url && (
          <>
            <div
              className="absolute inset-0"
              style={{ backgroundImage: `url(${settings.hero_bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/95" />
          </>
        )}
        {!settings?.hero_bg_image_url && (
          <>
            <div className="pointer-events-none absolute top-0 right-0 w-[32rem] h-[32rem] rounded-full bg-[hsl(24,85%,50%)]/8 -translate-y-1/3 translate-x-1/3" />
            <div className="pointer-events-none absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-white/3 -translate-x-1/2" />
          </>
        )}

        <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-20">
          <div className="hero-anim hero-anim-1 mb-5">
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white/35">Home Decor · AI Design · Community</span>
          </div>

          <h1
            className="text-[5rem] sm:text-[9rem] leading-none text-white mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            {settings?.page_name ?? "Rimhaus"}
          </h1>

          <div className="hero-anim hero-anim-2">
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              แรงบันดาลใจตกแต่งบ้าน · ออกแบบมุมบ้านด้วย AI · บทความ & ไอเดีย
            </p>
          </div>

          <div className="hero-anim hero-anim-3 flex flex-wrap gap-3 justify-center mt-8">
            <Link
              href="/redesign"
              className="inline-flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg hover:bg-[hsl(24,85%,45%)] transition-all active:scale-[0.98]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              ลอง AI Room Redesign
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-white/25 text-white/75 font-bold px-6 py-3 rounded-2xl text-sm hover:border-white/50 hover:text-white transition-all"
            >
              อ่าน Blog →
            </Link>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40 animate-bounce">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </section>

      <div className="bg-background">

        {/* ── AI Room Redesign Feature ──────────────────────── */}
        <ScrollReveal>
          <div className="px-4 sm:px-6 pt-6 pb-2">
            <div className="bg-[hsl(25,20%,12%)] rounded-3xl overflow-hidden">
              <div className="px-6 py-10 sm:py-14 text-center">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[hsl(24,85%,50%)]">✦ New Feature</span>
                <h2
                  className="text-4xl sm:text-6xl text-white mt-2 mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
                >
                  AI Room Redesign
                </h2>
                <p className="text-sm text-white/50 max-w-sm mx-auto mb-8 leading-relaxed">
                  อัพโหลดรูปมุมบ้านของคุณ เลือกสไตล์ แล้วให้ AI แต่งใหม่ในแบบที่คุณฝัน
                  พร้อมสินค้าแนะนำที่เหมาะกับสไตล์นั้น
                </p>
                <Link
                  href="/redesign"
                  className="inline-flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-lg hover:bg-[hsl(24,85%,45%)] transition-all active:scale-[0.98]"
                >
                  ลองเลย — ฟรี
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <div className="flex gap-2 justify-center mt-7 flex-wrap">
                  {["Mid-Century Modern", "Japandi", "Minimal", "Cozy / Hygge", "Vintage", "Biophilic"].map(s => (
                    <span key={s} className="text-[11px] font-medium text-white/30 border border-white/10 px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Blog Preview ──────────────────────────────────── */}
        {recentArticles.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
            <HeadingReveal>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-tx">บทความ</span>
                  <h2
                    className="text-3xl text-foreground mt-0.5 leading-tight"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
                  >
                    ไอเดียตกแต่งบ้าน
                  </h2>
                </div>
                <Link href="/blog" className="text-xs font-bold text-brand-tx hover:underline shrink-0 mb-1">ดูทั้งหมด →</Link>
              </div>
            </HeadingReveal>
            <div className="space-y-3">
              {recentArticles.map((article, i) => (
                <ScrollReveal key={article.id} delay={i * 60}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group flex gap-4 items-start bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    {article.cover_image_url ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary">
                        <Image
                          src={article.cover_image_url}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl shrink-0 bg-[hsl(35,25%,93%)] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(25,10%,65%)" strokeWidth="1.5">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {article.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-tx">{article.category}</span>
                      )}
                      <h3 className="font-bold text-sm text-foreground mt-0.5 line-clamp-2 leading-snug group-hover:text-brand-tx transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      )}
                    </div>
                    <svg className="shrink-0 mt-1 text-muted-foreground/40 group-hover:text-brand-tx transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Gallery Preview ───────────────────────────────── */}
        {albums.length > 0 && (
          <section className="bg-[hsl(25,20%,12%)] w-full pt-8 pb-0 overflow-hidden">
            {albums.length <= 2 ? (
              <div className="flex gap-3 px-4">
                {albums.map((album, i) => {
                  const cover = album.items[0]?.image_url ?? album.cover_image_url
                  return (
                    <ScrollReveal key={album.id} delay={i * 80} className="flex-1 min-w-0">
                      <Link href="/gallery" className="group relative block overflow-hidden rounded-2xl bg-white/10 aspect-[3/4]">
                        {cover ? (
                          <Image src={cover} alt={album.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 90vw, 45vw" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-sm font-bold text-white leading-tight line-clamp-1">{album.name}</p>
                          {album.description && <p className="text-xs text-white/55 mt-0.5 line-clamp-1">{album.description}</p>}
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>
            ) : (
              <div
                className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
              >
                {albums.map((album, i) => {
                  const cover = album.items[0]?.image_url ?? album.cover_image_url
                  return (
                    <div key={album.id} className="shrink-0 w-[58vw] sm:w-52 snap-start">
                      <ScrollReveal delay={i * 60}>
                        <Link href="/gallery" className="group relative block overflow-hidden rounded-2xl bg-white/10 aspect-[3/4]">
                          {cover ? (
                            <Image src={cover} alt={album.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 58vw, 208px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-sm font-bold text-white leading-tight line-clamp-1">{album.name}</p>
                            {album.description && <p className="text-xs text-white/55 mt-0.5 line-clamp-1">{album.description}</p>}
                          </div>
                        </Link>
                      </ScrollReveal>
                    </div>
                  )
                })}
              </div>
            )}
            <HeadingReveal>
              <div className="flex items-end justify-between px-4 pt-2 pb-4">
                <div className="leading-none">
                  <h2
                    className="text-[4.5rem] sm:text-[7rem] font-black text-primary tracking-tighter leading-none"
                    style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)" }}
                  >Gallery</h2>
                  <p className="text-xs text-white/35 mt-1 tracking-widest uppercase">มุมต่างๆ ของบ้าน</p>
                </div>
                <div className="pb-3 shrink-0">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 text-xs font-bold text-white/70 hover:border-white/60 hover:text-white transition-all"
                  >
                    ดูทั้งหมด
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            </HeadingReveal>
          </section>
        )}

        {/* ── Portfolio Preview ─────────────────────────────── */}
        {recentPhotos.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
            <HeadingReveal>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-tx">ผลงาน</span>
                  <h2
                    className="text-3xl text-foreground mt-0.5 leading-tight"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
                  >
                    Photo Content
                  </h2>
                </div>
                <Link href="/portfolio" className="text-xs font-bold text-brand-tx hover:underline shrink-0 mb-1">ดูทั้งหมด →</Link>
              </div>
            </HeadingReveal>
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 40}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl bg-secondary shadow-sm">
                    <div className="relative aspect-[3/4]">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.title ?? ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 33vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[hsl(35,25%,93%)]">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(25,10%,70%)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        </div>
                      )}
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Partners ──────────────────────────────────────── */}
        {partners.length > 0 && (
          <ScrollReveal>
            <section className="py-8 px-4 bg-[hsl(35,30%,97%)]">
              <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-5">แบรนด์ที่เคยร่วมงาน</p>
              <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {partners.map((p, i) => (
                  <ScrollReveal key={p.id} variant="scale" delay={Math.min(i, 17) * 30}>
                    <div className="relative h-8 w-full">
                      <Image
                        src={p.logo_url}
                        alt={p.name ?? ""}
                        fill
                        className="object-contain px-1.5 py-0.5"
                        sizes="(max-width: 640px) 33vw, 16vw"
                      />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <div className="text-center mt-5">
                <Link href="/partners" className="text-xs font-bold text-brand-tx hover:underline">ดูแบรนด์ทั้งหมด →</Link>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── Brand CTA ─────────────────────────────────────── */}
        <ScrollReveal>
          <section className="max-w-3xl mx-auto px-4 pb-12 sm:pb-16 pt-6">
            <div className="bg-[hsl(25,20%,12%)] rounded-3xl px-6 py-10 text-center">
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[hsl(24,85%,50%)]">For Brands</span>
              <h2
                className="text-4xl text-white mt-2 mb-2 leading-tight"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
              >
                Let&apos;s work together.
              </h2>
              <p className="text-sm text-white/45 mb-7">ดูราคา แพ็กเกจ และผลงาน เพื่อเริ่มต้นร่วมงานกัน</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/ratecard"
                  className="inline-flex items-center gap-2 border border-white/25 text-white/75 font-bold px-6 py-3 rounded-2xl text-sm hover:border-white/50 hover:text-white transition-all"
                >
                  ดู Rate Card
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                {settings?.contact_line && (
                  <a
                    href={`https://line.me/ti/p/~${settings.contact_line}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#06C755] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#05b34c] transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    ติดต่อ LINE
                  </a>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="bg-[hsl(22,18%,10%)] border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <span
              className="font-black text-white text-base sm:text-xl shrink-0"
              style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)" }}
            >
              {settings?.page_name ?? "Rimhaus"}
            </span>
            <div className="hidden sm:block w-px h-9 bg-white/15 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                <Link href="/ratecard" className="text-sm text-white/50 hover:text-white/90 transition-colors">Rate Card</Link>
                <Link href="/blog" className="text-sm text-white/50 hover:text-white/90 transition-colors">Blog</Link>
                <Link href="/redesign" className="text-sm text-white/50 hover:text-white/90 transition-colors">AI Room</Link>
                {albums.length > 0 && <Link href="/gallery" className="text-sm text-white/50 hover:text-white/90 transition-colors">Gallery</Link>}
                {portfolioItems.length > 0 && <Link href="/portfolio" className="text-sm text-white/50 hover:text-white/90 transition-colors">Portfolio</Link>}
                {partners.length > 0 && <Link href="/partners" className="text-sm text-white/50 hover:text-white/90 transition-colors">Partners</Link>}
              </div>
              <p className="text-xs text-white/25">© {new Date().getFullYear()} {settings?.page_name} · All rights reserved.</p>
            </div>
            {(settings?.contact_line || settings?.contact_email) && (
              <div className="flex flex-col gap-1 sm:text-right shrink-0">
                {settings.contact_line && (
                  <a href={`https://line.me/ti/p/~${settings.contact_line}`} target="_blank" rel="noopener noreferrer" className="text-sm text-white/45 hover:text-white/80 transition-colors">
                    LINE: {settings.contact_line}
                  </a>
                )}
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="text-sm text-white/45 hover:text-white/80 transition-colors">
                    {settings.contact_email}
                  </a>
                )}
              </div>
            )}
          </div>
        </footer>

      </div>
    </>
  )
}
