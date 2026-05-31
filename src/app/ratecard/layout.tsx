import type { Metadata } from "next"
import { getSettings } from "@/actions/ratecard.actions"
import { getPortfolioItems, getPartners } from "@/actions/portfolio.actions"
import { getGalleryItems } from "@/actions/gallery.actions"
import { RateCardNav } from "@/components/ratecard/RateCardNav"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const title = settings?.og_title || settings?.page_name || "Rate Card"
  const description = settings?.og_description || `Rate Card ของ ${settings?.page_name ?? "Content Creator"}`
  const image = settings?.og_image_url || settings?.hero_bg_image_url || settings?.image_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function RateCardLayout({ children }: { children: React.ReactNode }) {
  const [settings, portfolioItems, partners, galleryItems] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getPartners(),
    getGalleryItems(),
  ])

  return (
    <div className="min-h-screen">
      <RateCardNav
        pageName={settings?.page_name ?? "Rimhaus"}
        hasPortfolio={portfolioItems.length > 0}
        hasPartners={partners.length > 0}
        hasGallery={galleryItems.length > 0}
        contactLine={settings?.contact_line ?? null}
      />
      {children}
    </div>
  )
}
