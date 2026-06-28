import Link from "next/link"
import { getAiProducts, getAiStats } from "@/actions/ai-product.actions"
import { DeleteAiProductButton } from "@/components/admin/DeleteAiProductButton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AI_STYLES, AI_ROOM_TYPES } from "@/lib/constants/ai-redesign"

export default async function AiProductsPage() {
  const [products, stats] = await Promise.all([getAiProducts(), getAiStats()])

  const topStyleLabel = AI_STYLES.find(s => s.key === stats.top_style)?.label ?? "—"
  const topRoomLabel = AI_ROOM_TYPES.find(r => r.key === stats.top_room)?.label ?? "—"

  return (
    <div className="space-y-6 px-4 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[hsl(25,20%,15%)]">AI Room Redesign</h1>
        <Button asChild size="sm">
          <Link href="/ai-products/new"><Plus className="w-4 h-4 mr-1" />เพิ่มสินค้า</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Generate ทั้งหมด", value: stats.total_generations.toLocaleString(), unit: "ครั้ง" },
          { label: "คลิกสินค้า", value: stats.total_clicks.toLocaleString(), unit: "ครั้ง" },
          { label: "สไตล์ฮิตสุด", value: topStyleLabel, unit: "" },
          { label: "มุมฮิตสุด", value: topRoomLabel, unit: "" },
        ].map(s => (
          <div key={s.label} className="bg-[hsl(35,30%,97%)] rounded-xl p-3 border border-[hsl(35,20%,88%)]">
            <p className="text-[10px] text-[hsl(25,10%,55%)] font-medium">{s.label}</p>
            <p className="text-lg font-bold text-[hsl(25,20%,15%)] mt-0.5">{s.value}<span className="text-xs font-normal text-[hsl(25,10%,55%)] ml-1">{s.unit}</span></p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">ยังไม่มีสินค้า — เพิ่มสินค้าแรกเลย</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.id} className={`rounded-xl border p-3 space-y-2 ${p.is_active ? "border-[hsl(35,20%,88%)] bg-white" : "border-[hsl(35,20%,88%)] bg-[hsl(35,20%,96%)] opacity-60"}`}>
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="h-24 w-full object-cover rounded-lg bg-muted" />
              ) : (
                <div className="h-24 w-full rounded-lg bg-[hsl(35,20%,92%)]" />
              )}
              <div>
                <p className="text-sm font-bold text-[hsl(25,20%,15%)] line-clamp-1">{p.name}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold bg-[hsl(24,85%,95%)] text-[hsl(24,85%,40%)] px-2 py-0.5 rounded-full">{p.category}</span>
                  {p.affiliate_platform && <span className="text-[10px] text-muted-foreground uppercase">{p.affiliate_platform}</span>}
                  <span className={`w-2 h-2 rounded-full ${p.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Link href={`/ai-products/${p.id}/edit`} className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg border border-[hsl(35,20%,88%)] hover:bg-[hsl(35,30%,97%)] transition-colors">แก้ไข</Link>
                <DeleteAiProductButton id={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
