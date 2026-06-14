import Image from "next/image"
import { getPublicPartners, getPublicSettings } from "@/lib/public-data"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"

export default async function PartnersPage() {
  const [partners, settings] = await Promise.all([
    getPublicPartners(),
    getPublicSettings(),
  ])

  if (partners.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4">
        <h1
          className="text-5xl text-foreground"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
        >
          All Partner
        </h1>
        <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล Partner</p>
      </div>
    )
  }

  return (
    <div className="bg-background">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-4 pt-10 pb-8 text-center">
        <ScrollReveal>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">COLLABORATION</p>
        </ScrollReveal>
        <HeadingReveal>
          <h1
            className="text-5xl sm:text-7xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            All Partner
          </h1>
        </HeadingReveal>
        <ScrollReveal delay={150}>
          <p className="text-xs text-muted-foreground mt-2">ร่วมงานกับ {partners.length} แบรนด์</p>
        </ScrollReveal>
      </div>

      {/* ── Grid ────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {partners.map((p, i) => (
            <ScrollReveal key={p.id} delay={Math.min(i, 11) * 40}>
              <div className="flex flex-col items-center gap-2 p-3 hover:scale-105 transition-transform duration-200">
                <Image
                  src={p.logo_url}
                  alt={p.name ?? "Partner"}
                  width={112}
                  height={56}
                  className="h-14 w-full object-contain"
                />
                {p.name && (
                  <p className="text-[10px] text-foreground/55 text-center font-bold leading-tight">{p.name}</p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────── */}
      {settings?.contact_line && (
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-4 pb-16">
            <div className="bg-[hsl(25,20%,12%)] rounded-3xl px-6 py-10 text-center">
              <p
                className="text-3xl sm:text-4xl text-white mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
              >
                Let's work together.
              </p>
              <p className="text-sm text-white/50 mb-6">Talk content, ideas & pricing — let's connect.</p>
              <a
                href={`https://line.me/ti/p/~${settings.contact_line}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#06C755] text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-lg hover:bg-[#05b34c] hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE: {settings.contact_line}
              </a>
            </div>
          </div>
        </ScrollReveal>
      )}

    </div>
  )
}
