import Link from "next/link"
import { getAllPackages, getSettings } from "@/actions/ratecard.actions"
import { getPortfolioItems, getPartners } from "@/actions/portfolio.actions"
import { AdminPackages } from "@/components/ratecard/AdminPackages"
import { AdminSettings } from "@/components/ratecard/AdminSettings"
import { AdminPortfolio } from "@/components/ratecard/AdminPortfolio"
import { AdminPartners } from "@/components/ratecard/AdminPartners"
import { ExternalLink } from "lucide-react"

export default async function AdminRateCardPage() {
  const [packages, settings, portfolioItems, partners] = await Promise.all([
    getAllPackages(),
    getSettings(),
    getPortfolioItems(),
    getPartners(),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">Rate Card</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-0.5">จัดการ Packages และข้อมูลสำหรับลูกค้า</p>
        </div>
        <Link
          href="/ratecard"
          rel="noopener noreferrer"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-[hsl(24,85%,50%)] hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          ดูหน้าลูกค้า
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <AdminPackages packages={packages} />
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <AdminSettings settings={settings} />
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <AdminPortfolio items={portfolioItems} />
      </div>

      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6">
        <AdminPartners partners={partners} />
      </div>
    </div>
  )
}
