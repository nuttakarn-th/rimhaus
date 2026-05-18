import Link from "next/link"
import { getContentItems } from "@/actions/content.actions"
import { ContentCard } from "@/components/content/ContentCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CONTENT_STATUS_LABELS } from "@/lib/constants"
import type { ContentStatus } from "@/lib/types"

const statuses: { value: string; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "idea", label: "ไอเดีย" },
  { value: "scripting", label: "เขียนสคริปต์" },
  { value: "shooting", label: "ถ่ายทำ" },
  { value: "editing", label: "ตัดต่อ" },
  { value: "ready", label: "พร้อมโพส" },
  { value: "posted", label: "โพสแล้ว" },
]

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const items = await getContentItems({ status: params.status })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">วางแผนคอนเทนต์</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-1">จัดการไอเดียและตารางคอนเทนต์</p>
        </div>
        <Link href="/content/new">
          <Button><Plus className="w-4 h-4 mr-1" />สร้างคอนเทนต์</Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <Link key={s.value} href={s.value === "all" ? "/content" : `/content?status=${s.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (params.status ?? "all") === s.value
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            }`}>
            {s.label}
          </Link>
        ))}
      </div>

      {/* Content grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[hsl(35,20%,88%)]">
          <p className="text-[hsl(25,10%,50%)]">ยังไม่มีคอนเทนต์</p>
          <Link href="/content/new" className="mt-4 inline-block">
            <Button variant="outline" size="sm">สร้างคอนเทนต์แรก</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
