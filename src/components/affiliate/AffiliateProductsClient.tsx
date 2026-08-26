"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, ExternalLink, Trash2, EyeOff, Eye, Sparkles, CalendarDays } from "lucide-react"
import type { AffiliateProduct, AffiliateZone } from "@/lib/types"
import { ZONE_CONFIG, ZONE_ORDER } from "@/lib/affiliate-zones"
import { AFFILIATE_SEED_DATA } from "@/lib/affiliate-seed"
import { importAffiliateProducts, toggleAffiliateProduct, deleteAffiliateProduct, distributeAffiliateToCalendar } from "@/actions/affiliate.actions"
import { DistributeModal } from "./DistributeModal"

interface Props { products: AffiliateProduct[] }

export function AffiliateProductsClient({ products }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeZone, setActiveZone] = useState<AffiliateZone | "all">("all")
  const [showDistribute, setShowDistribute] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const productsByZone = useMemo(() => {
    const map: Record<string, AffiliateProduct[]> = {}
    for (const p of products) {
      if (!map[p.zone]) map[p.zone] = []
      map[p.zone].push(p)
    }
    return map
  }, [products])

  const filtered = activeZone === "all" ? products : (productsByZone[activeZone] ?? [])
  const activeCount = products.filter(p => p.is_active).length

  async function handleImport() {
    startTransition(async () => {
      const result = await importAffiliateProducts(AFFILIATE_SEED_DATA as Parameters<typeof importAffiliateProducts>[0])
      if (result.success) {
        showToast(`นำเข้า ${result.data?.count ?? 0} สินค้าเรียบร้อยแล้ว`)
        router.refresh()
      } else {
        showToast(result.error ?? "เกิดข้อผิดพลาด", false)
      }
    })
  }

  async function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const result = await toggleAffiliateProduct(id, !current)
      if (!result.success) showToast(result.error ?? "เกิดข้อผิดพลาด", false)
      else router.refresh()
    })
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ลบ "${name}" ออกจากคลังใช่มั้ย?`)) return
    startTransition(async () => {
      const result = await deleteAffiliateProduct(id)
      if (!result.success) showToast(result.error ?? "เกิดข้อผิดพลาด", false)
      else { showToast("ลบแล้ว"); router.refresh() }
    })
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[hsl(35,20%,80%)] dark:border-[hsl(25,15%,25%)] p-10 text-center space-y-4">
        <div className="text-5xl">📦</div>
        <div>
          <p className="font-semibold text-[hsl(25,20%,25%)] dark:text-[hsl(35,15%,75%)]">ยังไม่มีสินค้าในคลัง</p>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-1">นำเข้าจากไฟล์ Excel ที่เตรียมไว้</p>
        </div>
        <button
          onClick={handleImport}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(24,85%,45%)] disabled:opacity-60 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {isPending ? "กำลังนำเข้า…" : "นำเข้าสินค้าจาก Excel"}
        </button>
        <p className="text-[10px] text-[hsl(25,10%,55%)]">115 สินค้า จาก 8 โซนห้อง</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-[hsl(25,10%,50%)]">
          เปิดใช้งาน <span className="font-semibold text-[hsl(24,85%,50%)]">{activeCount}</span> / {products.length} สินค้า
        </p>
        <button
          onClick={() => setShowDistribute(true)}
          className="flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[hsl(24,85%,45%)] transition-colors"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          กระจายลงปฏิทิน
        </button>
      </div>

      {/* Zone tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
        <button
          onClick={() => setActiveZone("all")}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeZone === "all" ? "bg-[hsl(25,20%,20%)] text-white dark:bg-[hsl(35,15%,80%)] dark:text-[hsl(25,20%,15%)]" : "bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,88%)]"}`}
        >
          ทั้งหมด ({products.length})
        </button>
        {ZONE_ORDER.map(zone => {
          const cfg = ZONE_CONFIG[zone]
          const count = productsByZone[zone]?.length ?? 0
          if (count === 0) return null
          return (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeZone === zone ? "bg-[hsl(25,20%,20%)] text-white dark:bg-[hsl(35,15%,80%)] dark:text-[hsl(25,20%,15%)]" : "bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,88%)]"}`}
            >
              <span>{cfg.emoji}</span>
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => {
          const cfg = ZONE_CONFIG[p.zone]
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-3 space-y-2 transition-opacity ${p.is_active ? "bg-white dark:bg-[hsl(25,12%,14%)] border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)]" : "bg-[hsl(35,25%,96%)] dark:bg-[hsl(25,12%,12%)] border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,18%)] opacity-60"}`}
            >
              {/* Zone badge + name */}
              <div className="flex items-start gap-2">
                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${cfg.color}`}>
                  {cfg.emoji} {cfg.label}
                </span>
              </div>
              <p className="text-sm font-medium text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] leading-snug line-clamp-2">
                {p.name}
              </p>

              {/* Links */}
              <div className="flex items-center gap-2 flex-wrap">
                {p.shopee_url && (
                  <a href={p.shopee_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-300">
                    <ExternalLink className="w-2.5 h-2.5" /> Shopee
                  </a>
                )}
                {p.lazada_url && (
                  <a href={p.lazada_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300">
                    <ExternalLink className="w-2.5 h-2.5" /> Lazada
                  </a>
                )}
                {!p.shopee_url && !p.lazada_url && (
                  <span className="text-[10px] text-[hsl(25,10%,55%)]">ไม่มีลิงก์</span>
                )}
              </div>

              {/* Last scheduled */}
              {p.last_scheduled_at && (
                <p className="text-[10px] text-[hsl(25,10%,55%)] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Schedule ล่าสุด: {new Date(p.last_scheduled_at).toLocaleDateString("th-TH")}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-[hsl(35,20%,92%)] dark:border-[hsl(25,15%,18%)]">
                <button
                  onClick={() => handleToggle(p.id, p.is_active)}
                  disabled={isPending}
                  title={p.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  className="p-1.5 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,22%)] transition-colors text-[hsl(25,10%,45%)] disabled:opacity-50"
                >
                  {p.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={isPending}
                  title="ลบ"
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-[hsl(25,10%,55%)] hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showDistribute && (
        <DistributeModal
          activeCount={activeCount}
          onClose={() => setShowDistribute(false)}
          onDistribute={async (start, end, slots) => {
            const result = await distributeAffiliateToCalendar(start, end, slots)
            if (result.success) {
              showToast(`เพิ่ม ${result.data?.created} Content ลงปฏิทินแล้ว`)
              setShowDistribute(false)
              router.refresh()
            } else {
              showToast(result.error ?? "เกิดข้อผิดพลาด", false)
            }
          }}
        />
      )}
    </div>
  )
}
