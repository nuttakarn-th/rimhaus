"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"
import { PackageCard } from "@/components/ratecard/PackageCard"
import type { RateCardPackage } from "@/lib/types"

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
  lemon8: "Lemon8",
}

function SectionHeader({ title, tag, sub, num }: { title: string; tag?: string; sub?: string; num?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 mb-2 text-center">
      {num && (
        <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-brand-tx/50 mb-0.5">{num}</span>
      )}
      <h2
        className="text-3xl sm:text-4xl leading-tight text-foreground"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
      >
        {title}
      </h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {tag && <span className="text-xs font-bold text-brand-tx bg-orange-50 px-3 py-0.5 rounded-full border border-orange-200">{tag}</span>}
    </div>
  )
}

export function PackageFilter({
  packages,
  platformLogos,
}: {
  packages: RateCardPackage[]
  platformLogos: Record<string, string>
}) {
  const grouped = {
    per_platform: packages.filter(p => p.category === "per_platform"),
    bundle:       packages.filter(p => p.category === "bundle"),
    addon:        packages.filter(p => p.category === "addon"),
    barter:       packages.filter(p => p.category === "barter"),
  }

  const allPlatforms = Array.from(new Set([
    ...grouped.per_platform.flatMap(p => p.platforms ?? []),
    ...grouped.bundle.flatMap(p => p.platforms ?? []),
  ]))

  const showTabs = allPlatforms.length >= 2
  const [active, setActive] = useState<string | null>(null)

  const filterByPlatform = (pkgs: RateCardPackage[]) => {
    if (!active) return pkgs
    return pkgs.filter(p => p.platforms?.includes(active))
  }

  const filteredPerPlatform = filterByPlatform(grouped.per_platform)
  const filteredBundle = filterByPlatform(grouped.bundle)

  return (
    <>
      {showTabs && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          <button
            onClick={() => setActive(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              !active
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            ทั้งหมด
          </button>
          {allPlatforms.map(p => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                active === p
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {PLATFORM_LABELS[p] ?? p}
            </button>
          ))}
        </div>
      )}

      {filteredPerPlatform.length > 0 && (
        <ScrollReveal>
          <section>
            <HeadingReveal><SectionHeader title="Single Platform" num="01" /></HeadingReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filteredPerPlatform.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 75}>
                  <PackageCard pkg={p} platformLogos={platformLogos} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {filteredBundle.length > 0 && (
        <ScrollReveal>
          <section>
            <HeadingReveal><SectionHeader title="All Platforms" tag="ประหยัดกว่า" num="02" /></HeadingReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filteredBundle.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 75}>
                  <PackageCard pkg={p} platformLogos={platformLogos} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {grouped.addon.length > 0 && (
        <ScrollReveal>
          <section>
            <HeadingReveal><SectionHeader title="Additional Services" num="03" /></HeadingReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {grouped.addon.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 75}>
                  <PackageCard pkg={p} platformLogos={platformLogos} />
                </ScrollReveal>
              ))}
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
    </>
  )
}
