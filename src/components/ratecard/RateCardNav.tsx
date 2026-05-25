"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface Props {
  pageName: string
  hasPortfolio: boolean
  hasPartners: boolean
}

const NAV_ITEMS = [
  { label: "Rate Card", href: "/ratecard" },
  { label: "ตัวอย่าง Content", href: "/ratecard/portfolio" },
  { label: "All Partner", href: "/ratecard/partners" },
]

export function RateCardNav({ pageName, hasPortfolio, hasPartners }: Props) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.href === "/ratecard/portfolio") return hasPortfolio
    if (item.href === "/ratecard/partners") return hasPartners
    return true
  })

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[hsl(35,20%,88%)] shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <span className="font-black text-[hsl(25,20%,15%)] text-base shrink-0">🏠 {pageName}</span>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {visibleItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[hsl(24,85%,50%)] text-white"
                    : "text-[hsl(25,10%,50%)] hover:text-[hsl(25,20%,15%)] hover:bg-[hsl(35,30%,97%)]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link
          href="/dashboard"
          className="text-xs text-[hsl(25,10%,50%)] hover:text-[hsl(24,85%,50%)] transition-colors shrink-0"
        >
          Admin →
        </Link>
      </div>
    </header>
  )
}
