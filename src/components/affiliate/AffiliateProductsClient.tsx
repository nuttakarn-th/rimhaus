"use client"

import { useState, useTransition, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
  ShoppingBag, ExternalLink, Trash2, EyeOff, Eye,
  CalendarDays, Download, Upload, FileSpreadsheet, Plus,
  ChevronDown, ChevronRight,
} from "lucide-react"
import type { AffiliateProduct, AffiliateZone } from "@/lib/types"
import { ZONE_CONFIG, ZONE_ORDER } from "@/lib/affiliate-zones"
import { AFFILIATE_SEED_DATA } from "@/lib/affiliate-seed"
import {
  importAffiliateProducts,
  toggleAffiliateProduct,
  deleteAffiliateProduct,
  distributeAffiliateToCalendar,
} from "@/actions/affiliate.actions"
import { DistributeModal } from "./DistributeModal"
import { AddProductModal } from "./AddProductModal"

interface Props { products: AffiliateProduct[] }

const HEADERS = ["รายการ", "Link Shopee", "Link Lazada"]

export function AffiliateProductsClient({ products }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeZone, setActiveZone] = useState<AffiliateZone | "all">("all")
  const [showDistribute, setShowDistribute] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addDefaultZone, setAddDefaultZone] = useState<AffiliateZone | undefined>()
  const [collapsedZones, setCollapsedZones] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

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

  const activeCount = products.filter(p => p.is_active).length

  // Zones to render: single zone or all ordered
  const zonesToShow = activeZone === "all"
    ? ZONE_ORDER.filter(z => productsByZone[z]?.length)
    : [activeZone]

  function toggleCollapse(zone: string) {
    setCollapsedZones(prev => {
      const next = new Set(prev)
      if (next.has(zone)) next.delete(zone)
      else next.add(zone)
      return next
    })
  }

  function openAdd(zone?: AffiliateZone) {
    setAddDefaultZone(zone)
    setShowAdd(true)
  }

  // ─── Download Template ────────────────────────────────────────────────────
  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    for (const zone of ZONE_ORDER) {
      const cfg = ZONE_CONFIG[zone]
      const rows: string[][] = [
        HEADERS,
        [`ตัวอย่าง: ${cfg.label} item 1`, "https://s.shopee.co.th/...", ""],
        [`ตัวอย่าง: ${cfg.label} item 2`, "", "https://c.lazada.co.th/..."],
      ]
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws["!cols"] = [{ wch: 50 }, { wch: 40 }, { wch: 40 }]
      XLSX.utils.book_append_sheet(wb, ws, cfg.label)
    }
    XLSX.writeFile(wb, "template_affiliate_products.xlsx")
  }

  // ─── Export ───────────────────────────────────────────────────────────────
  function exportToExcel() {
    if (products.length === 0) { showToast("ไม่มีข้อมูลให้ Export", false); return }
    const wb = XLSX.utils.book_new()
    for (const zone of ZONE_ORDER) {
      const items = productsByZone[zone] ?? []
      if (items.length === 0) continue
      const rows: string[][] = [
        HEADERS,
        ...items.map(p => [p.name, p.shopee_url ?? "", p.lazada_url ?? ""]),
      ]
      const ws = XLSX.utils.aoa_to_sheet(rows)
      ws["!cols"] = [{ wch: 55 }, { wch: 40 }, { wch: 40 }]
      XLSX.utils.book_append_sheet(wb, ws, ZONE_CONFIG[zone].label)
    }
    XLSX.writeFile(wb, `affiliate_products_${new Date().toISOString().slice(0, 10)}.xlsx`)
    showToast("Export เรียบร้อยแล้ว")
  }

  // ─── Import from Excel ────────────────────────────────────────────────────
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const labelToZone: Record<string, AffiliateZone> = {}
      for (const [zone, cfg] of Object.entries(ZONE_CONFIG)) {
        labelToZone[cfg.label] = zone as AffiliateZone
      }
      const parsed: Array<{ zone: AffiliateZone; zone_label: string; name: string; shopee_url: string | null; lazada_url: string | null }> = []
      for (const sheetName of wb.SheetNames) {
        const zone = labelToZone[sheetName.trim()]
        if (!zone) continue
        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" })
        for (const row of rows.slice(1)) {
          const name = String(row[0] ?? "").trim()
          if (!name || name.startsWith("ตัวอย่าง:")) continue
          parsed.push({ zone, zone_label: sheetName.trim(), name, shopee_url: String(row[1] ?? "").trim() || null, lazada_url: String(row[2] ?? "").trim() || null })
        }
      }
      if (parsed.length === 0) { showToast("ไม่พบข้อมูล — ตรวจสอบชื่อ Sheet และ Template", false); return }
      startTransition(async () => {
        const result = await importAffiliateProducts(parsed)
        if (result.success) { showToast(`นำเข้า ${result.data?.count ?? 0} สินค้าเรียบร้อยแล้ว`); router.refresh() }
        else showToast(result.error ?? "เกิดข้อผิดพลาด", false)
      })
    } catch { showToast("อ่านไฟล์ไม่ได้ — ลองใหม่อีกครั้ง", false) }
    finally { if (importRef.current) importRef.current.value = "" }
  }

  // ─── Seed import ──────────────────────────────────────────────────────────
  function handleSeedImport() {
    startTransition(async () => {
      const result = await importAffiliateProducts(AFFILIATE_SEED_DATA as Parameters<typeof importAffiliateProducts>[0])
      if (result.success) { showToast(`นำเข้า ${result.data?.count ?? 0} สินค้าเรียบร้อยแล้ว`); router.refresh() }
      else showToast(result.error ?? "เกิดข้อผิดพลาด", false)
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

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-[hsl(35,20%,80%)] dark:border-[hsl(25,15%,25%)] p-10 text-center space-y-4">
          <div className="text-5xl">📦</div>
          <div>
            <p className="font-semibold text-[hsl(25,20%,25%)] dark:text-[hsl(35,15%,75%)]">ยังไม่มีสินค้าในคลัง</p>
            <p className="text-sm text-[hsl(25,10%,50%)] mt-1">นำเข้าจากข้อมูล Excel ที่เตรียมไว้ หรืออัปโหลดไฟล์ใหม่</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleSeedImport} disabled={isPending}
              className="inline-flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(24,85%,45%)] disabled:opacity-60 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              {isPending ? "กำลังนำเข้า…" : "นำเข้าสินค้าจาก Excel (115 รายการ)"}
            </button>
            <button onClick={downloadTemplate}
              className="inline-flex items-center gap-2 border border-[hsl(35,20%,80%)] dark:border-[hsl(25,15%,25%)] text-[hsl(25,10%,45%)] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors">
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-[hsl(25,10%,50%)]">
          เปิดใช้งาน <span className="font-semibold text-[hsl(24,85%,50%)]">{activeCount}</span> / {products.length} สินค้า
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={downloadTemplate} title="Download Template"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Template</span>
          </button>
          <button onClick={exportToExcel} title="Export"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => importRef.current?.click()} disabled={isPending} title="Import จาก Excel"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-[hsl(35,20%,82%)] dark:border-[hsl(25,15%,25%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,94%)] dark:hover:bg-[hsl(25,12%,20%)] disabled:opacity-50 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={() => openAdd()} title="เพิ่มสินค้า"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-[hsl(24,85%,50%)] text-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,97%)] dark:hover:bg-[hsl(24,30%,16%)] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เพิ่มสินค้า</span>
          </button>
          <button onClick={() => setShowDistribute(true)}
            className="flex items-center gap-2 bg-[hsl(24,85%,50%)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[hsl(24,85%,45%)] transition-colors">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">กระจายลงปฏิทิน</span>
            <span className="sm:hidden">กระจาย</span>
          </button>
        </div>
      </div>

      {/* Zone filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setActiveZone("all")}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeZone === "all" ? "bg-[hsl(25,20%,20%)] text-white dark:bg-[hsl(35,15%,80%)] dark:text-[hsl(25,20%,15%)]" : "bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,88%)]"}`}>
          ทั้งหมด ({products.length})
        </button>
        {ZONE_ORDER.map(zone => {
          const cfg = ZONE_CONFIG[zone]
          const count = productsByZone[zone]?.length ?? 0
          if (count === 0) return null
          return (
            <button key={zone} onClick={() => setActiveZone(zone)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeZone === zone ? "bg-[hsl(25,20%,20%)] text-white dark:bg-[hsl(35,15%,80%)] dark:text-[hsl(25,20%,15%)]" : "bg-[hsl(35,25%,94%)] dark:bg-[hsl(25,12%,18%)] text-[hsl(25,10%,45%)] hover:bg-[hsl(35,25%,88%)]"}`}>
              <span>{cfg.emoji}</span>
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Grouped tables */}
      <div className="space-y-3">
        {zonesToShow.map(zone => {
          const cfg = ZONE_CONFIG[zone]
          const items = productsByZone[zone] ?? []
          const isCollapsed = collapsedZones.has(zone)

          return (
            <div key={zone} className="rounded-xl border border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)] overflow-hidden">
              {/* Zone header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(35,30%,96%)] dark:bg-[hsl(25,12%,17%)] cursor-pointer select-none"
                onClick={() => toggleCollapse(zone)}>
                <div className="flex items-center gap-2">
                  {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5 text-[hsl(25,10%,50%)]" />
                    : <ChevronDown className="w-3.5 h-3.5 text-[hsl(25,10%,50%)]" />
                  }
                  <span className="text-sm">{cfg.emoji}</span>
                  <span className="font-semibold text-sm text-[hsl(25,20%,20%)] dark:text-[hsl(35,15%,80%)]">{cfg.label}</span>
                  <span className="text-[10px] text-[hsl(25,10%,55%)]">({items.length} สินค้า)</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); openAdd(zone) }}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg text-[hsl(24,85%,50%)] hover:bg-[hsl(24,85%,95%)] dark:hover:bg-[hsl(24,30%,18%)] transition-colors"
                >
                  <Plus className="w-3 h-3" /> เพิ่ม
                </button>
              </div>

              {/* Table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[hsl(35,20%,88%)] dark:border-[hsl(25,15%,20%)] bg-[hsl(35,25%,98%)] dark:bg-[hsl(25,12%,15%)]">
                        <th className="text-left px-4 py-2 text-[10px] font-semibold text-[hsl(25,10%,50%)] uppercase tracking-wide w-full">ชื่อสินค้า</th>
                        <th className="text-center px-3 py-2 text-[10px] font-semibold text-[hsl(25,10%,50%)] uppercase tracking-wide whitespace-nowrap">Links</th>
                        <th className="text-center px-3 py-2 text-[10px] font-semibold text-[hsl(25,10%,50%)] uppercase tracking-wide whitespace-nowrap w-20">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(35,20%,92%)] dark:divide-[hsl(25,15%,18%)]">
                      {items.map(p => (
                        <tr key={p.id}
                          className={`hover:bg-[hsl(35,30%,98%)] dark:hover:bg-[hsl(25,12%,16%)] transition-colors ${!p.is_active ? "opacity-45" : ""}`}>
                          <td className="px-4 py-2.5">
                            <span className="text-[hsl(25,20%,15%)] dark:text-[hsl(35,15%,80%)] leading-snug">{p.name}</span>
                            {p.last_scheduled_at && (
                              <span className="ml-2 text-[10px] text-[hsl(25,10%,55%)]">
                                · {new Date(p.last_scheduled_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1.5">
                              {p.shopee_url
                                ? <a href={p.shopee_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 transition-colors whitespace-nowrap">
                                    <ExternalLink className="w-2.5 h-2.5" /> Shopee
                                  </a>
                                : <span className="text-[10px] text-[hsl(25,10%,70%)]">–</span>
                              }
                              {p.lazada_url
                                ? <a href={p.lazada_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition-colors whitespace-nowrap">
                                    <ExternalLink className="w-2.5 h-2.5" /> Lazada
                                  </a>
                                : null
                              }
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-0.5">
                              <button onClick={() => handleToggle(p.id, p.is_active)} disabled={isPending}
                                title={p.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                                className="p-1.5 rounded-lg hover:bg-[hsl(35,25%,92%)] dark:hover:bg-[hsl(25,12%,22%)] transition-colors text-[hsl(25,10%,45%)] disabled:opacity-50">
                                {p.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleDelete(p.id, p.name)} disabled={isPending}
                                title="ลบ"
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-[hsl(25,10%,55%)] hover:text-red-600 disabled:opacity-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      {showAdd && (
        <AddProductModal
          defaultZone={addDefaultZone}
          onClose={() => setShowAdd(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
