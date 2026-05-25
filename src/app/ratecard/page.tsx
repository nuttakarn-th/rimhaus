export const dynamic = "force-dynamic"

import { getPackages, getSettings } from "@/actions/ratecard.actions"
import { formatCurrency } from "@/lib/utils"
import type { RateCardPackage } from "@/lib/types"

const PLATFORM_INFO = [
  { id: "facebook", label: "Facebook", bg: "bg-[#1877F2]", text: "text-white" },
  { id: "tiktok", label: "TikTok", bg: "bg-black", text: "text-white" },
  { id: "instagram", label: "Instagram", bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400", text: "text-white" },
  { id: "lemon8", label: "Lemon8", bg: "bg-[#FFE040]", text: "text-black" },
]

function PackageCard({ pkg }: { pkg: RateCardPackage }) {
  const saving = pkg.original_price && pkg.price ? pkg.original_price - pkg.price : null
  return (
    <div className={`rounded-2xl border-2 p-5 flex flex-col gap-2 bg-white ${pkg.is_featured ? "border-[hsl(24,85%,50%)]" : "border-[hsl(35,20%,88%)]"}`}>
      {pkg.is_featured && (
        <span className="text-xs font-bold text-white bg-[hsl(24,85%,50%)] rounded-full px-3 py-0.5 self-start">เหมา</span>
      )}
      <h3 className="font-bold text-[hsl(25,20%,15%)] text-base">{pkg.name}</h3>
      {pkg.description && <p className="text-sm text-[hsl(25,10%,50%)]">{pkg.description}</p>}
      {pkg.sub_items && pkg.sub_items.length > 0 ? (
        <div className="mt-1 space-y-1">
          {pkg.sub_items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[hsl(25,10%,50%)]">{item.label}</span>
              <span className="font-semibold text-[hsl(24,85%,50%)]">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      ) : pkg.price != null ? (
        <div className="mt-auto pt-2">
          {pkg.original_price && (
            <div className="text-sm text-[hsl(25,10%,60%)] line-through">{formatCurrency(pkg.original_price)}</div>
          )}
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-[hsl(24,85%,50%)]">{formatCurrency(pkg.price)}</span>
            {pkg.unit && <span className="text-xs text-[hsl(25,10%,50%)] pb-1">{pkg.unit}</span>}
          </div>
          {saving && (
            <div className="text-xs text-emerald-600 font-medium">ประหยัด {formatCurrency(saving)}</div>
          )}
        </div>
      ) : (
        <div className="mt-auto pt-2 text-sm font-medium text-violet-600">ติดต่อสอบถาม</div>
      )}
    </div>
  )
}

export default async function RateCardPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()])

  const grouped = {
    per_platform: packages.filter(p => p.category === "per_platform"),
    bundle: packages.filter(p => p.category === "bundle"),
    addon: packages.filter(p => p.category === "addon"),
    barter: packages.filter(p => p.category === "barter"),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-[hsl(25,20%,15%)]">
            {settings?.page_name ?? "Rate Card"}
          </h1>
          {settings?.page_category && (
            <p className="text-sm text-[hsl(25,10%,50%)] italic">Category : {settings.page_category}</p>
          )}
          <div className="flex justify-center gap-2 flex-wrap pt-1">
            {PLATFORM_INFO.map(p => (
              <span key={p.id} className={`text-xs font-bold px-3 py-1 rounded-full ${p.bg} ${p.text}`}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Rate card image */}
        {settings?.image_url && (
          <div className="rounded-2xl overflow-hidden border border-[hsl(35,20%,88%)] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.image_url} alt="Rate Card" className="w-full object-contain" />
          </div>
        )}

        {/* Per platform */}
        {grouped.per_platform.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-[hsl(24,85%,50%)] pl-3">
              ต่อแพลตฟอร์ม
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {grouped.per_platform.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          </section>
        )}

        {/* Bundle */}
        {grouped.bundle.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-[hsl(24,85%,50%)] pl-3">
              เหมาทุกแพลตฟอร์ม
              <span className="ml-2 text-xs font-normal text-[hsl(24,85%,50%)] bg-orange-50 px-2 py-0.5 rounded-full">ประหยัดกว่า</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {grouped.bundle.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          </section>
        )}

        {/* Add-ons */}
        {grouped.addon.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-[hsl(35,20%,65%)] pl-3">เพิ่มเติม</h2>
            <div className="grid grid-cols-2 gap-4">
              {grouped.addon.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          </section>
        )}

        {/* Barter */}
        {grouped.barter.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-[hsl(25,20%,15%)] text-lg border-l-4 border-violet-400 pl-3">ระบบ Barter</h2>
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
              {grouped.barter[0].description && (
                <p className="text-sm text-violet-700">{grouped.barter[0].description}</p>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {settings?.notes && settings.notes.length > 0 && (
          <section className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-5">
            <h3 className="font-semibold text-sm text-[hsl(25,20%,35%)] mb-3">เงื่อนไข</h3>
            <ul className="space-y-1.5">
              {settings.notes.map((note, i) => (
                <li key={i} className="text-xs text-[hsl(25,10%,50%)] flex gap-2">
                  <span className="shrink-0">·</span>{note}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact */}
        {settings && (
          <section className="bg-[hsl(25,20%,15%)] rounded-2xl p-6 text-white space-y-4">
            <h3 className="font-bold text-lg">ติดต่อเรา</h3>
            <div className="space-y-2 text-sm">
              {settings.contact_line && (
                <div className="flex items-center gap-3">
                  <span className="text-[hsl(35,30%,70%)]">Line</span>
                  <span className="font-medium">{settings.contact_line}</span>
                </div>
              )}
              {settings.contact_email && (
                <div className="flex items-center gap-3">
                  <span className="text-[hsl(35,30%,70%)]">Email</span>
                  <a href={`mailto:${settings.contact_email}`} className="font-medium hover:underline">
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings.contact_phone && (
                <div className="flex items-center gap-3">
                  <span className="text-[hsl(35,30%,70%)]">Tel</span>
                  <a href={`tel:${settings.contact_phone}`} className="font-medium hover:underline">
                    {settings.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-[hsl(25,10%,65%)] pb-4">{settings?.page_name} (un.finished.house)</p>
    </div>
  )
}
