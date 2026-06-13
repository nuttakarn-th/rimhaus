import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"

export default function AdminPage() {
  const now = new Date()
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
  const greeting = now.getHours() < 12 ? "อรุณสวัสดิ์" : now.getHours() < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น"

  return (
    <div className="space-y-5">

      {/* Hero — renders instantly, no data dependency */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(24,85%,50%)] via-[hsl(28,85%,52%)] to-[hsl(35,80%,55%)] rounded-2xl p-5 text-white">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 right-12 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute top-8 right-24 w-8 h-8 rounded-full bg-white/15" />

        <p className="text-sm font-medium text-white/80">{greeting} 🏠</p>
        <h1 className="text-2xl font-black mt-0.5 leading-tight">เมื่อไหร่บ้าน<br />จะเสร็จ?</h1>
        <p className="text-xs text-white/70 mt-1.5">
          วัน{dayNames[now.getDay()]}ที่{" "}
          {now.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Data sections — stream in with skeleton while loading */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>

    </div>
  )
}
