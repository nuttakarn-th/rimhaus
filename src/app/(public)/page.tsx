import Link from "next/link"
import Image from "next/image"
import { getPublicSettings, getPublicPackages, getPublicPortfolioItems, getPublicPartners, getPublicAlbumsWithItems } from "@/lib/public-data"
import { formatCurrency } from "@/lib/utils"
import { PlatformBubble, PlatformIcon } from "@/components/ui/PlatformIcon"
import { PackageCalculator } from "@/components/ratecard/PackageCalculator"
import { PackageTermsBadge } from "@/components/ratecard/PackageTermsBadge"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { StatCounter } from "@/components/ui/StatCounter"
import type { RateCardPackage } from "@/lib/types"

function parseStatText(text: string): { num: number; suffix: string; decimals: number } | null {
  const m = text.trim().match(/^([0-9,]+(?:\.[0-9]+)?)(.*)$/)
  if (!m) return null
  const num = parseFloat(m[1].replace(/,/g, ""))
  if (isNaN(num) || num === 0) return null
  const decimals = m[1].includes(".") ? m[1].split(".")[1].length : 0
  return { num, suffix: m[2].trim(), decimals }
}

const PLATFORMS = ["facebook", "tiktok", "instagram", "lemon8"]

// ── Package Card ──────────────────────────────────────────────────
function PackageCard({ pkg, platformLogos }: { pkg: RateCardPackage; platformLogos?: Record<string, string> }) {
  const saving = pkg.original_price && pkg.price ? pkg.original_price - pkg.price : null
  const isPerPlatform = pkg.category === "per_platform"
  const hasPlatforms = pkg.platforms && pkg.platforms.length > 0
  return (
    <div className={[
      "group relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden",
      "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
      pkg.is_featured
        ? "border-primary shadow-md shadow-orange-100"
        : isPerPlatform
          ? "border-blue-400 shadow-md shadow-blue-50"
          : "border-border hover:border-[hsl(24,85%,55%)]",
    ].join(" ")}>
      {pkg.is_featured && (
        <div className="bg-gradient-to-r from-[hsl(24,85%,50%)] to-[hsl(35,85%,55%)] px-3 pt-1.5 pb-2 sm:px-3 sm:pt-1.5 sm:pb-2 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 w-full justify-center">
            <span className="text-xs font-black text-white tracking-wide">🔥 All Platforms</span>
            {saving && (
              <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                ประหยัด {formatCurrency(saving)}
              </span>
            )}
          </div>
          {hasPlatforms && (
            <div className="flex items-center justify-center gap-1.5">
              {pkg.platforms!.map(p => {
                const logo = platformLogos?.[p]
                return logo ? (
                  <div key={p} className="w-6 h-6 rounded-full overflow-hidden bg-white border border-white/30 flex items-center justify-center shrink-0">
                    <Image src={logo} alt={p} width={24} height={24} className="object-cover" />
                  </div>
                ) : (
                  <PlatformBubble key={p} platform={p} size={24} noHover />
                )
              })}
              {pkg.content_type === "video" && <span className="text-sm leading-none">🎬</span>}
              {pkg.content_type === "photo" && <span className="text-sm leading-none">📷</span>}
            </div>
          )}
        </div>
      )}
      {isPerPlatform && (
        <div className={`px-3 py-1.5 flex items-center justify-center gap-2 ${hasPlatforms ? "bg-foreground" : "bg-gradient-to-r from-blue-500 to-blue-400"}`}>
          {hasPlatforms ? (
            <>
              <div className="flex items-center gap-1.5">
                {pkg.platforms!.map(p => {
                  const logo = platformLogos?.[p]
                  return logo ? (
                    <div key={p} className="w-6 h-6 rounded-full overflow-hidden bg-white border border-white/30 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo} alt={p} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <PlatformBubble key={p} platform={p} size={24} noHover />
                  )
                })}
                {pkg.content_type === "video" && (
                  <span className="text-base leading-none" title="VDO">🎬</span>
                )}
                {pkg.content_type === "photo" && (
                  <span className="text-base leading-none" title="Photo">📷</span>
                )}
              </div>
              {saving && (
                <span className="text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full ml-auto">
                  ประหยัด {formatCurrency(saving)}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-xs font-black text-white tracking-wide">📦 Single Platform</span>
              {saving && (
                <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                  ประหยัด {formatCurrency(saving)}
                </span>
              )}
            </>
          )}
        </div>
      )}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 text-center">
        <h3 className="font-black text-foreground text-sm leading-snug">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug sm:leading-relaxed">{pkg.description}</p>
        )}
        {pkg.sub_items && pkg.sub_items.length > 0 ? (
          <div className="mt-auto pt-2 space-y-1 border-t border-border">
            {pkg.sub_items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-brand-tx">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        ) : pkg.price != null ? (
          <div className="mt-auto pt-2 border-t border-border">
            {pkg.original_price && (
              <div className="text-[10px] sm:text-xs text-ink-dim line-through mb-0.5">
                {formatCurrency(pkg.original_price)}
              </div>
            )}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg sm:text-lg font-black text-primary">{formatCurrency(pkg.price)}</span>
              {pkg.unit && <span className="text-[9px] sm:text-[10px] text-muted-foreground">{pkg.unit}</span>}
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-2 border-t border-border text-sm font-bold text-foreground">
            ติดต่อสอบถาม →
          </div>
        )}
      </div>
      {pkg.terms && (
        <div className="border-t border-border px-3 flex items-center justify-center min-h-[44px]">
          <PackageTermsBadge name={pkg.name} terms={pkg.terms} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-orange-50/30 to-transparent" />
    </div>
  )
}

function SectionHeader({ title, tag, sub }: { title: string; tag?: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 mb-2 text-center">
      <h2
        className="text-xl sm:text-2xl tracking-tight leading-tight text-foreground"
        style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
      >
        {title}
      </h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {tag && <span className="text-xs font-bold text-brand-tx bg-orange-50 px-3 py-0.5 rounded-full border border-orange-200">{tag}</span>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default async function HomePage() {
  const [packages, settings, portfolioItems, partners, albums] = await Promise.all([
    getPublicPackages(),
    getPublicSettings(),
    getPublicPortfolioItems(),
    getPublicPartners(),
    getPublicAlbumsWithItems(),
  ])

  const grouped = {
    per_platform: packages.filter(p => p.category === "per_platform"),
    bundle:       packages.filter(p => p.category === "bundle"),
    addon:        packages.filter(p => p.category === "addon"),
    barter:       packages.filter(p => p.category === "barter"),
  }

  const videos = portfolioItems.filter(i => i.type === "video")
  const photos = portfolioItems.filter(i => i.type === "photo")
  const totalGalleryItems = albums.reduce((sum, a) => sum + a.items.length, 0)

  type HeroStat = { num: number; decimals: number; suffix: string; label: string }
  const heroStats: HeroStat[] = []
  if (settings?.stat_followers) {
    const p = parseStatText(settings.stat_followers)
    if (p) heroStats.push({ ...p, label: "ผู้ติดตาม" })
  }
  if (settings?.stat_reach) {
    const p = parseStatText(settings.stat_reach)
    if (p) heroStats.push({ ...p, label: "Avg. Reach" })
  }
  if (settings?.stat_engagement) {
    const p = parseStatText(settings.stat_engagement)
    if (p) heroStats.push({ ...p, label: "Engagement" })
  }
  if (settings?.stat_views) {
    const p = parseStatText(settings.stat_views)
    if (p) heroStats.push({ ...p, label: "Total Views" })
  }

  return (
    <>
      {/* ── Full-screen Hero ──────────────────────────────── */}
      <section
        className="relative overflow-hidden w-full -mt-14 aspect-square sm:aspect-auto sm:min-h-[620px] sm:max-h-[72vh] lg:min-h-screen lg:max-h-none bg-gradient-to-br from-[hsl(25,20%,12%)] via-[hsl(22,25%,18%)] to-[hsl(30,20%,14%)] text-white"
        style={settings?.hero_bg_image_url ? { backgroundImage: `url(${settings.hero_bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {settings?.hero_bg_image_url && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
        )}
        {!settings?.hero_bg_image_url && (
          <>
            <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full bg-[hsl(24,85%,50%)]/10 -translate-y-1/2 translate-x-1/2" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          </>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-8 pt-14 pb-12 sm:pb-14 lg:pb-20 space-y-3">
          <div className="hero-anim hero-anim-1">
            <h1
              className="text-4xl sm:text-5xl tracking-tight leading-tight text-white"
              style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
            >
              {settings?.hero_heading ?? settings?.page_name ?? "Rate Card"}
            </h1>
            {(settings?.hero_subtitle ?? settings?.page_category) && (
              <p className="mt-2 text-sm text-white/65 font-medium">
                {settings?.hero_subtitle ?? settings?.page_category}
              </p>
            )}
          </div>

          <div className="hero-anim hero-anim-2">
            <div className="flex justify-center gap-2 flex-wrap">
              {PLATFORMS.map(p => {
                const logoUrl = settings?.platform_logos?.[p]
                const platformUrl = settings?.platform_urls?.[p]
                const bubble = logoUrl ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white shadow border border-white/30 flex items-center justify-center">
                    <Image src={logoUrl} alt={p} width={28} height={28} className="object-cover" />
                  </div>
                ) : (
                  <PlatformBubble platform={p} size={28} noHover={!!platformUrl} />
                )
                return platformUrl ? (
                  <a key={p} href={platformUrl} target="_blank" rel="noopener noreferrer" title={p}
                     className="transition-transform hover:scale-110 rounded-full">
                    {bubble}
                  </a>
                ) : (
                  <span key={p}>{bubble}</span>
                )
              })}
            </div>
          </div>

          {heroStats.length >= 2 && (
            <div className="hero-anim hero-anim-3 w-full">
              <div className="flex items-stretch justify-center bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden divide-x divide-white/15">
                {heroStats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 px-3 py-4 gap-1 min-w-0">
                    <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                      <StatCounter
                        to={stat.num}
                        decimals={stat.decimals}
                        suffix={stat.suffix}
                        delay={350 + i * 120}
                        duration={1600}
                      />
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/75 font-medium leading-tight text-center">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-50 animate-bounce">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Below-hero content ────────────────────────────── */}
      <div className="bg-background">

      {partners.length > 0 && (
        <ScrollReveal>
        <section className="pt-4 sm:pt-5">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-4">
            แบรนด์ที่เคยร่วมงาน
          </p>
          <div
            className="grid grid-rows-2 grid-flow-col gap-x-5 gap-y-3 overflow-x-auto sm:overflow-x-visible sm:auto-cols-fr pb-2 px-4 sm:px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {partners.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-1 w-14 sm:w-auto">
                <Image src={p.logo_url} alt={p.name ?? ""} width={72} height={24} className="h-6 w-14 sm:w-full sm:max-w-[72px] object-contain mx-auto" />
                {p.name && (
                  <span className="text-[8px] text-ink-dim text-center leading-tight line-clamp-1">{p.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-5">

      {videos.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Short VDO" sub="คลิก! เพื่อดูโพสต้นทาง" />
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {videos.map(item => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 group block">
                <div className="relative w-28 overflow-hidden rounded-2xl bg-foreground shadow-md">
                  <div className="relative aspect-[9/16]">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title ?? ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.5"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-black/35 border border-white/40 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  {item.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-[9px] text-white font-medium line-clamp-2">{item.title}</p>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/portfolio" className="text-xs font-bold text-primary hover:underline">
              ดูผลงานวิดีโอทั้งหมด →
            </Link>
          </div>
        </section>
        </ScrollReveal>
      )}

      {photos.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Photo Content" sub="คลิก! เพื่อดูโพสต้นทาง" />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.slice(0, 8).map(item => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                 className="group relative block overflow-hidden rounded-xl bg-secondary shadow-sm">
                <div className="relative aspect-[3/4]">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title ?? ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 33vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(25,10%,70%)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/portfolio" className="text-xs font-bold text-primary hover:underline">
              {photos.length > 8 ? `ชม Content ทั้งหมด (${photos.length} รูป) →` : "ชม Portfolio ทั้งหมด →"}
            </Link>
          </div>
        </section>
        </ScrollReveal>
      )}

      {albums.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Gallery" sub="มุมต่างๆ ของบ้าน" />
          <div className="grid grid-cols-2 gap-2">
            {albums.map(album => {
              const cover = album.cover_image_url ?? album.items[0]?.image_url
              return (
                <Link
                  key={album.id}
                  href="/gallery"
                  className="group relative block overflow-hidden rounded-2xl bg-secondary aspect-square shadow-sm"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={album.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(25,10%,70%)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <p className="text-sm font-bold text-white leading-tight line-clamp-1">{album.name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
          {totalGalleryItems > 0 && (
            <div className="text-center mt-4">
              <Link href="/gallery"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-foreground text-sm font-bold text-foreground hover:bg-foreground hover:text-white transition-all">
                ดูทั้งหมด
              </Link>
            </div>
          )}
        </section>
        </ScrollReveal>
      )}

      {settings?.contact_line && (
        <ScrollReveal>
        <section>
          <a
            href={`https://line.me/ti/p/~${settings.contact_line}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#06C755] text-white text-base font-bold rounded-2xl shadow-lg hover:bg-[#05b34c] hover:shadow-xl transition-all active:scale-[0.98]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            สอบถามราคา / จองคิว ผ่าน LINE
          </a>
        </section>
        </ScrollReveal>
      )}

      <ScrollReveal>
      <div className="py-2 sm:py-4 flex items-center gap-4" aria-hidden="true">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">ราคา</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
      </div>
      </ScrollReveal>

      <ScrollReveal>
      <section>
        <div className="flex flex-col items-center mb-4 text-center gap-2">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">แพ็กเกจ & ราคา</p>
          <h2
            className="text-5xl sm:text-6xl tracking-tight leading-tight text-foreground"
            style={{ fontFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)", fontWeight: 700 }}
          >
            Rate Card
          </h2>
        </div>
        {settings?.image_url && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <Image src={settings.image_url} alt="Rate Card" width={800} height={600} className="w-full h-auto object-contain" />
          </div>
        )}
      </section>
      </ScrollReveal>

      {grouped.per_platform.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Single Platform" />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {grouped.per_platform.map(p => <PackageCard key={p.id} pkg={p} platformLogos={settings?.platform_logos ?? {}} />)}
          </div>
        </section>
        </ScrollReveal>
      )}

      {grouped.bundle.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="All Platforms" tag="ประหยัดกว่า" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {grouped.bundle.map(p => <PackageCard key={p.id} pkg={p} platformLogos={settings?.platform_logos ?? {}} />)}
          </div>
        </section>
        </ScrollReveal>
      )}

      {grouped.addon.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Additional Services" />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {grouped.addon.map(p => <PackageCard key={p.id} pkg={p} platformLogos={settings?.platform_logos ?? {}} />)}
          </div>
        </section>
        </ScrollReveal>
      )}

      {grouped.barter.length > 0 && (
        <ScrollReveal>
        <section>
          <SectionHeader title="Barter" />
          <div className="rounded-2xl border-2 border-[hsl(35,60%,80%)] bg-gradient-to-br from-[hsl(40,60%,97%)] to-[hsl(35,50%,93%)] p-5">
            {grouped.barter[0].description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{grouped.barter[0].description}</p>
            )}
          </div>
        </section>
        </ScrollReveal>
      )}

      {/* ── Package Calculator ────────────────────────────── */}
      {settings?.show_calculator !== false && packages.filter(p => p.category !== "barter" && p.price != null).length > 0 && (
        <ScrollReveal>
        <PackageCalculator
          packages={packages}
          contactLine={settings?.contact_line ?? null}
          pageName={settings?.page_name ?? null}
          platformLogos={settings?.platform_logos ?? {}}
        />
        </ScrollReveal>
      )}

      {settings?.notes && settings.notes.length > 0 && (
        <ScrollReveal>
        <section className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📋</span>
            <h3 className="font-bold text-sm text-muted-foreground">เงื่อนไข</h3>
          </div>
          <ul className="space-y-2">
            {settings.notes.map((note, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                <span className="shrink-0 text-primary font-bold">·</span>
                {note}
              </li>
            ))}
          </ul>
        </section>
        </ScrollReveal>
      )}

      {settings && (
        <ScrollReveal>
        <section className="relative overflow-hidden bg-foreground rounded-2xl p-5 text-white space-y-3">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-16 w-16 h-16 rounded-full bg-white/5" />
          <h3 className="font-black text-lg">ติดต่อเรา 👋</h3>
          <div className="space-y-3">
            {settings.contact_line && (
              <a href={`https://line.me/ti/p/~${settings.contact_line}`} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 text-sm hover:opacity-90">
                <div className="w-8 h-8 rounded-lg bg-[#06C755] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <span className="font-medium">{settings.contact_line}</span>
              </a>
            )}
            {settings.contact_email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <a href={`mailto:${settings.contact_email}`} className="font-medium hover:underline">{settings.contact_email}</a>
              </div>
            )}
            {settings.contact_phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <a href={`tel:${settings.contact_phone}`} className="font-medium hover:underline">{settings.contact_phone}</a>
              </div>
            )}
          </div>
        </section>
        </ScrollReveal>
      )}

      <p className="text-center text-xs text-ink-dim pb-4">
        {settings?.page_name} · un.finished.house
      </p>

      </div>
      </div>
    </>
  )
}
