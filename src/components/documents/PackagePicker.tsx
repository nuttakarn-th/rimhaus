"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { RATE_CARD_CATEGORY_LABELS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import type { RateCardPackage, RateCardCategory } from "@/lib/types"

type Props = {
  packages: RateCardPackage[]
  onSelect: (pkg: RateCardPackage) => void
}

const CATEGORIES: RateCardCategory[] = ["per_platform", "bundle", "addon", "barter"]

export function PackagePicker({ packages, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = packages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" type="button">
          <ChevronDown className="w-3.5 h-3.5 mr-1" />เลือก Package
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="p-2 border-b border-[hsl(35,20%,88%)]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(25,10%,60%)]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา Package..."
              className="pl-8 h-8 text-xs"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-[hsl(25,10%,55%)] text-center py-4">ไม่พบ Package</p>
          ) : (
            CATEGORIES.map(cat => {
              const items = filtered.filter(p => p.category === cat)
              if (!items.length) return null
              return (
                <div key={cat}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(25,10%,50%)] bg-[hsl(35,25%,96%)] uppercase tracking-wide">
                    {RATE_CARD_CATEGORY_LABELS[cat]}
                  </div>
                  {items.map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-orange-50 transition-colors text-left group"
                      onClick={() => { onSelect(pkg); setOpen(false); setSearch("") }}
                    >
                      <div>
                        <div className="text-sm font-medium text-[hsl(25,20%,15%)] group-hover:text-[hsl(24,85%,45%)]">
                          {pkg.name}
                        </div>
                        {pkg.description && (
                          <div className="text-xs text-[hsl(25,10%,55%)] mt-0.5 line-clamp-1">{pkg.description}</div>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-[hsl(24,85%,50%)] shrink-0 ml-3">
                        {pkg.price != null ? formatCurrency(pkg.price) : "—"}
                        {pkg.unit && <span className="text-xs font-normal text-[hsl(25,10%,55%)]">/{pkg.unit}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
