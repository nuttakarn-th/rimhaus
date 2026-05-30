import { getSettings } from "@/actions/ratecard.actions"
import { getPortfolioItems, getPartners } from "@/actions/portfolio.actions"
import { getGalleryItems } from "@/actions/gallery.actions"
import { RateCardNav } from "@/components/ratecard/RateCardNav"

export default async function RateCardLayout({ children }: { children: React.ReactNode }) {
  const [settings, portfolioItems, partners, galleryItems] = await Promise.all([
    getSettings(),
    getPortfolioItems(),
    getPartners(),
    getGalleryItems(),
  ])

  return (
    <div className="min-h-screen bg-[hsl(35,30%,97%)]">
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
