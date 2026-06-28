import type { Metadata } from "next"
import { getPublicSettings, getPublicPortfolioItems, getPublicPartners, getPublicGalleryItems } from "@/lib/public-data"
import { RateCardNav } from "@/components/ratecard/RateCardNav"
import { ScrollToTop } from "@/components/ui/ScrollToTop"

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const siteName = settings?.page_name ?? "Rimhaus"
  const image = settings?.og_image_url || settings?.hero_bg_image_url || settings?.image_url
  const imageList = image ? [{ url: image, width: 1200, height: 630, alt: siteName }] : []

  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteName, template: `%s · ${siteName}` },
    description: `${siteName} — แรงบันดาลใจตกแต่งบ้าน ออกแบบด้วย AI บทความ และ Gallery`,
    openGraph: {
      siteName,
      locale: "th_TH",
      type: "website",
      images: imageList,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      images: image ? [image] : [],
    },
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, portfolioItems, partners, galleryItems] = await Promise.all([
    getPublicSettings(),
    getPublicPortfolioItems(),
    getPublicPartners(),
    getPublicGalleryItems(),
  ])

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-foreground focus:text-white focus:text-sm focus:font-bold focus:shadow-lg"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <RateCardNav
        pageName={settings?.page_name ?? "Rimhaus"}
        hasPortfolio={portfolioItems.length > 0}
        hasPartners={partners.length > 0}
        hasGallery={galleryItems.length > 0}
        contactLine={settings?.contact_line ?? null}
      />
      <main id="main-content" className="page-enter">{children}</main>
      <ScrollToTop />
    </div>
  )
}
