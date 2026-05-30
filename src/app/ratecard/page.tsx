export const dynamic = "force-dynamic"

import { getPackages, getSettings } from "@/actions/ratecard.actions"
import { formatCurrency } from "@/lib/utils"
import { PlatformIcon, PlatformBubble, PLATFORM_CI } from "@/components/ui/PlatformIcon"
import type { RateCardPackage } from "@/lib/types"

const PLATFORMS = ["facebook", "tiktok", "instagram", "lemon8"]

// ── Package Card ──────────────────────────────────────────────────
function PackageCard({ pkg }: { pkg: RateCardPackage }) {
  const saving = pkg.original_price && pkg.price ? pkg.original_price - pkg.price : null
  return (
    <div className={[
      "group relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden",
      "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
      pkg.is_featured
        ? "border-[hsl(24,85%,50%)] shadow-md shadow-orange-100"
        : "border-[hsl(35,20%,90%)] hover:border-[hsl(24,85%,55%)]",
    ].join(" ")}>

      {/* Featured accent strip */}
      {pkg.is_featured && (
        <div className="bg-gradient-to-r from-[hsl(24,85%,50%)] to-[hsl(35,85%,55%)] px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-black text-white tracking-wide">⭐ เหมาทุกอย่าง</span>
          {saving && (
            <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
              ประหยัด {formatCurrency(saving)}
            </span>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-black text-[hsl(25,20%,12%)] text-sm leading-snug">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-xs text-[hsl(25,10%,52%)] leading-relaxed">{pkg.description}</p>
        )}

        {pkg.sub_items && pkg.sub_items.length > 0 ? (
          <div className="mt-auto pt-3 space-y-1.5 border-t border-[hsl(35,25%,92%)]">
            {pkg.sub_items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-[hsl(25,10%,50%)]">{item.label}</span>
                <span className="font-bold text-[hsl(24,85%,50%)]">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        ) : pkg.price != null ? (
          <div className="mt-auto pt-3 border-t border-[hsl(35,25%,92%)]">
            {pkg.original_price && (
              <div className="text-xs text-[hsl(25,10%,60%)] line-through mb-0.5">
                {formatCurrency(pkg.original_price)}
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[hsl(24,85%,50%)]">{formatCurrency(pkg.price)}</span>
              {pkg.unit && <span className="text-[10px] text-[hsl(25,10%,55%)]">{pkg.unit}</span>}
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-3 border-t border-[hsl(35,25%,92%)] text-sm font-bold text-violet-600">
            ติดต่อสอบถาม →
          </div>
        )}
      </div>

      {/* Hover glow overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-orange-50/30 to-transparent" />
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────
function SectionHeader({ emoji, title, tag }: { emoji: string; title: string; tag?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[hsl(24,85%,50%)] flex items-center justify-center text-xl shadow-md">
        {emoji}
      </div>
      <h2 className="font-black text-[hsl(25,20%,12%)] text-xl tracking-tight">{title}</h2>
      {tag && <span className="text-xs font-bold text-[hsl(24,85%,50%)] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">{tag}</span>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default async function RateCardPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()])

  const grouped = {
    per_platform: packages.filter(p => p.category === "per_platform"),
    bundle:       packages.filter(p => p.category === "bundle"),
    addon:        packages.filter(p => p.category === "addon"),
    barter:       packages.filter(p => p.category === "barter"),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="text-center space-y-5">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[hsl(25,20%,12%)] tracking-tight leading-tight">
            {settings?.page_name ?? "Rate Card"}
          </h1>
          {settings?.page_category && (
            <p className="text-sm text-[hsl(25,10%,50%)] font-medium">
              {settings.page_category}
            </p>
          )}
        </div>

        {/* Platform circles — icon only */}
        <div className="flex justify-center gap-3 flex-wrap pt-1">
          {PLATFORMS.map(p => (
            <PlatformBubble key={p} platform={p} size={44} />
          ))}
        </div>

        {/* LINE CTA */}
        {settings?.contact_line && (
          <a
            href={`https://line.me/ti/p/~${settings.contact_line}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#06C755] text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINE: {settings.contact_line}
          </a>
        )}
      </div>

      {/* ── Social Stats ─────────────────────────────────── */}
      {settings?.social_stats && (settings.social_stats.ig_followers || settings.social_stats.ig_engagement_rate) && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-pink-100 rounded-2xl p-5">
          <div className="absolute top-3 right-3">
            <PlatformIcon platform="instagram" size={20} />
          </div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {settings.social_stats.ig_followers != null && (
              <div className="text-center">
                <p className="text-2xl font-black text-[hsl(25,20%,12%)]">
                  {settings.social_stats.ig_followers >= 1000
                    ? `${(settings.social_stats.ig_followers / 1000).toFixed(1)}K`
                    : settings.social_stats.ig_followers.toLocaleString()}
                </p>
                <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">Followers</p>
              </div>
            )}
            {settings.social_stats.ig_engagement_rate != null && (
              <>
                <div className="w-px h-10 bg-pink-200" />
                <div className="text-center">
                  <p className="text-2xl font-black text-[hsl(25,20%,12%)]">
                    {settings.social_stats.ig_engagement_rate}%
                  </p>
                  <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">Engagement Rate</p>
                </div>
              </>
            )}
            {settings.social_stats.ig_avg_reach != null && (
              <>
                <div className="w-px h-10 bg-pink-200" />
                <div className="text-center">
                  <p className="text-2xl font-black text-[hsl(25,20%,12%)]">
                    {settings.social_stats.ig_avg_reach >= 1000
                      ? `${(settings.social_stats.ig_avg_reach / 1000).toFixed(1)}K`
                      : settings.social_stats.ig_avg_reach.toLocaleString()}
                  </p>
                  <p className="text-xs text-[hsl(25,10%,50%)] mt-0.5">Avg. Reach / วัน</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Rate Card Image ───────────────────────────────── */}
      {settings?.image_url && (
        <div className="rounded-2xl overflow-hidden border border-[hsl(35,20%,88%)] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.image_url} alt="Rate Card" className="w-full object-contain" />
        </div>
      )}

      {/* ── Per Platform ─────────────────────────────────── */}
      {grouped.per_platform.length > 0 && (
        <section>
          <SectionHeader emoji="📦" title="ต่อแพลตฟอร์ม" />
          <div className="grid grid-cols-2 gap-3">
            {grouped.per_platform.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </section>
      )}

      {/* ── Bundle ───────────────────────────────────────── */}
      {grouped.bundle.length > 0 && (
        <section>
          <SectionHeader emoji="🎁" title="เหมาทุกแพลตฟอร์ม" tag="ประหยัดกว่า" />
          <div className="grid grid-cols-2 gap-3">
            {grouped.bundle.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </section>
      )}

      {/* ── Add-ons ──────────────────────────────────────── */}
      {grouped.addon.length > 0 && (
        <section>
          <SectionHeader emoji="✨" title="เพิ่มเติม" />
          <div className="grid grid-cols-2 gap-3">
            {grouped.addon.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </section>
      )}

      {/* ── Barter ───────────────────────────────────────── */}
      {grouped.barter.length > 0 && (
        <section>
          <SectionHeader emoji="🔄" title="ระบบ Barter" />
          <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
            {grouped.barter[0].description && (
              <p className="text-sm text-violet-700 leading-relaxed">{grouped.barter[0].description}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Notes ────────────────────────────────────────── */}
      {settings?.notes && settings.notes.length > 0 && (
        <section className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📋</span>
            <h3 className="font-bold text-sm text-[hsl(25,20%,25%)]">เงื่อนไข</h3>
          </div>
          <ul className="space-y-2">
            {settings.notes.map((note, i) => (
              <li key={i} className="text-xs text-[hsl(25,10%,50%)] flex gap-2 leading-relaxed">
                <span className="shrink-0 text-[hsl(24,85%,50%)] font-bold">·</span>
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Contact ──────────────────────────────────────── */}
      {settings && (
        <section className="relative overflow-hidden bg-[hsl(25,20%,12%)] rounded-2xl p-6 text-white space-y-4">
          {/* decorative circle */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-16 w-16 h-16 rounded-full bg-white/5" />

          <h3 className="font-black text-lg">ติดต่อเรา 👋</h3>
          <div className="space-y-3">
            {settings.contact_line && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#06C755] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <span className="font-medium">{settings.contact_line}</span>
              </div>
            )}
            {settings.contact_email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <a href={`mailto:${settings.contact_email}`} className="font-medium hover:underline">
                  {settings.contact_email}
                </a>
              </div>
            )}
            {settings.contact_phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <a href={`tel:${settings.contact_phone}`} className="font-medium hover:underline">
                  {settings.contact_phone}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-[hsl(25,10%,65%)] pb-4">
        {settings?.page_name} · un.finished.house
      </p>
    </div>
  )
}
