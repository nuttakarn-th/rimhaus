import type { Metadata } from "next"
import { getSettings } from "@/actions/ratecard.actions"
import { getPortfolioItems, getPartners } from "@/actions/portfolio.actions"
import { getGalleryItems } from "@/actions/gallery.actions"
import { RateCardNav } from "@/components/ratecard/RateCardNav"

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const title = settings?.og_title || settings?.page_name || "Rate Card"
  const description = settings?.og_description || `Rate Card ของ ${settings?.page_name ?? "Content Creator"}`
  const image = settings?.og_image_url || settings?.hero_bg_image_url || settings?.image_url

  const imageList = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : []

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings?.page_name ?? title,
      locale: "th_TH",
      type: "website",
      images: imageList,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, portfolioItems, partners, galleryItems] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getPartners(),
    getGalleryItems(),
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
      <main id="main-content">{children}</main>
    </div>
  )
}
