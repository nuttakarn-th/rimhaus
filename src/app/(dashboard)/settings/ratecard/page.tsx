import Link from "next/link"
import { getAllPackages, getSettings } from "@/actions/ratecard.actions"
import { getPortfolioItems, getPartners } from "@/actions/portfolio.actions"
import { getAlbums, getGalleryItems } from "@/actions/gallery.actions"
import { AdminPackages } from "@/components/ratecard/AdminPackages"
import { AdminSettings } from "@/components/ratecard/AdminSettings"
import { AdminPortfolio } from "@/components/ratecard/AdminPortfolio"
import { AdminPartners } from "@/components/ratecard/AdminPartners"
import { AdminGallery } from "@/components/ratecard/AdminGallery"
import { ExternalLink } from "lucide-react"

const TABS = [
  { id: "packages",  label: "แพ็กเกจ" },
  { id: "settings",  label: "ตั้งค่าหน้า" },
  { id: "gallery",   label: "Gallery" },
  { id: "portfolio", label: "Portfolio" },
  { id: "partners",  label: "แบรนด์" },
] as const

type TabId = typeof TABS[number]["id"]

export default async function AdminRateCardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab = "packages" } = await searchParams
  const tab: TabId = TABS.some(t => t.id === rawTab) ? (rawTab as TabId) : "packages"

  let content: React.ReactNode
  if (tab === "packages") {
    const packages = await getAllPackages()
    content = <AdminPackages packages={packages} />
  } else if (tab === "settings") {
    const settings = await getSettings()
    content = <AdminSettings settings={settings} />
  } else if (tab === "gallery") {
    const [albums, items] = await Promise.all([getAlbums(), getGalleryItems()])
    content = <AdminGallery albums={albums} items={items} />
  } else if (tab === "portfolio") {
    const items = await getPortfolioItems()
    content = <AdminPortfolio items={items} />
  } else {
    const partners = await getPartners()
    content = <AdminPartners partners={partners} />
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">Rate Card</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">จัดการ Packages และข้อมูลสำหรับลูกค้า</p>
        </div>
        <Link
          href="/"
          rel="noopener noreferrer"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-[hsl(24,85%,50%)] hover:underline shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          ดูหน้าลูกค้า
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <Link
            key={t.id}
            href={`/settings/ratecard?tab=${t.id}`}
            className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${
              tab === t.id
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,25%)] hover:bg-[hsl(35,20%,92%)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        {content}
      </div>
    </div>
  )
}
