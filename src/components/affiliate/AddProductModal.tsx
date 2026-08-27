"use client"

import { useState, useTransition } from "react"
import { X, Plus } from "lucide-react"
import type { AffiliateZone } from "@/lib/types"
import { ZONE_CONFIG, ZONE_ORDER } from "@/lib/affiliate-zones"
import { addAffiliateProduct } from "@/actions/affiliate.actions"

interface Props {
  defaultZone?: AffiliateZone
  onClose: () => void
  onSuccess: () => void
}

export function AddProductModal({ defaultZone, onClose, onSuccess }: Props) {
  const [zone, setZone] = useState<AffiliateZone>(defaultZone ?? "living_room")
  const [name, setName] = useState("")
  const [shopee, setShopee] = useState("")
  const [lazada, setLazada] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!name.trim()) { setError("กรุณากรอกชื่อสินค้า"); return }
    setError("")
    startTransition(async () => {
      const result = await addAffiliateProduct({
        zone,
        name: name.trim(),
        shopee_url: shopee.trim() || null,
        lazada_url: lazada.trim() || null,
      })
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error ?? "เกิดข้อผิดพลาด")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-[hsl(25,12%,14%)] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)]">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[hsl(24,85%,50%)]" />
            <span className="font-semibold text-sm text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)]">เพิ่มสินค้า</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,22%)] transition-colors">
            <X className="w-4 h-4 text-[hsl(25,10%,45%)]" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Zone */}
          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">โซน</label>
            <select
              value={zone}
              onChange={e => setZone(e.target.value as AffiliateZone)}
              className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
            >
              {ZONE_ORDER.map(z => (
                <option key={z} value={z}>{ZONE_CONFIG[z].emoji} {ZONE_CONFIG[z].label}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">ชื่อสินค้า *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น Barcelona Chair สีน้ำตาล"
              className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] placeholder-[hsl(25,10%,60%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
            />
          </div>

          {/* Shopee */}
          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">Link Shopee</label>
            <input
              type="url"
              value={shopee}
              onChange={e => setShopee(e.target.value)}
              placeholder="https://s.shopee.co.th/..."
              className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] placeholder-[hsl(25,10%,60%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
            />
          </div>

          {/* Lazada */}
          <div>
            <label className="text-xs font-medium text-[hsl(25,10%,45%)] block mb-1">Link Lazada</label>
            <input
              type="url"
              value={lazada}
              onChange={e => setLazada(e.target.value)}
              placeholder="https://c.lazada.co.th/..."
              className="w-full border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[hsl(25,12%,18%)] text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] placeholder-[hsl(25,10%,60%)] focus:outline-none focus:ring-2 focus:ring-[hsl(24,85%,50%)]"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-sm font-medium text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-[hsl(24,85%,50%)] text-white text-sm font-medium hover:bg-[hsl(24,85%,45%)] disabled:opacity-60 transition-colors"
          >
            {isPending ? "กำลังบันทึก…" : "เพิ่มสินค้า"}
          </button>
        </div>
      </div>
    </div>
  )
}
