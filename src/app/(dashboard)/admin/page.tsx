import { KpiCard } from "@/components/dashboard/KpiCard"
import { MonthlyIncomeChart } from "@/components/dashboard/MonthlyIncomeChart"
import { PlatformSummary } from "@/components/dashboard/PlatformSummary"
import { TopPillarWidget } from "@/components/dashboard/TopPillarWidget"
import { getJobs } from "@/actions/jobs.actions"
import { getFinanceSummary, getMonthlyIncome } from "@/actions/transactions.actions"
import { getContentItems, getPillarEngagement } from "@/actions/content.actions"
import { getPlatformCounts } from "@/actions/posts.actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/lib/constants"
import Link from "next/link"
import { ChevronRight, TrendingUp, BarChart2 } from "lucide-react"
import { addDays } from "date-fns"

export default async function AdminPage() {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const nextWeek = addDays(now, 7).toISOString().split("T")[0]
  const today = now.toISOString().split("T")[0]

  const [jobs, summary, monthlyIncome, contentItems, platformCounts, pillarStats] = await Promise.all([
    getJobs(),
    getFinanceSummary(currentMonth),
    getMonthlyIncome(),
    getContentItems(),
    getPlatformCounts(),
    getPillarEngagement(),
  ])

  const activeJobs = jobs.filter(j => !["lead", "closed", "paid"].includes(j.status))
  const pendingPayment = jobs.filter(j => j.payment_status === "pending" && j.status !== "closed")
  const upcomingContent = contentItems.filter(c =>
    c.planned_date && c.planned_date >= today && c.planned_date <= nextWeek && c.status !== "posted"
  )
  const recentJobs = jobs.slice(0, 5)

  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
  const greeting = now.getHours() < 12 ? "อรุณสวัสดิ์" : now.getHours() < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น"

  return (
    <div className="space-y-5">

      {/* ── Hero Banner ─────────────────────────────────── */}
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

        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full">
            📋 งานกำลังทำ {activeJobs.length} งาน
          </span>
          {upcomingContent.length > 0 && (
            <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full">
              📅 โพสสัปดาห์นี้ {upcomingContent.length} ชิ้น
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="รายรับเดือนนี้"
          value={formatCurrency(summary.income)}
          subtitle={`กำไรสุทธิ ${formatCurrency(summary.net)}`}
          icon="💰"
          color="orange"
        />
        <KpiCard
          title="งานที่กำลังทำ"
          value={String(activeJobs.length)}
          subtitle="งานที่ยังไม่ปิด"
          icon="📋"
          color="blue"
        />
        <KpiCard
          title="คอนเทนต์สัปดาห์นี้"
          value={String(upcomingContent.length)}
          subtitle="วางแผนจะโพส 7 วันข้างหน้า"
          icon="📅"
          color="green"
        />
        <KpiCard
          title="รอรับเงิน"
          value={String(pendingPayment.length)}
          subtitle={`รวม ${formatCurrency(pendingPayment.reduce((s, j) => s + j.payment_amount, 0))}`}
          icon="⏳"
          color="amber"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[hsl(24,85%,50%)]" />
            <span className="text-sm font-semibold text-[hsl(25,20%,15%)]">รายรับ 6 เดือน</span>
          </div>
          <MonthlyIncomeChart data={monthlyIncome} />
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-[hsl(24,85%,50%)]" />
            <span className="text-sm font-semibold text-[hsl(25,20%,15%)]">โพสต่อแพลตฟอร์ม</span>
          </div>
          <PlatformSummary data={platformCounts} />
        </div>
      </div>

      <TopPillarWidget stats={pillarStats} />

      {/* ── Recent Jobs ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-bold text-[hsl(25,20%,15%)]">งานรีวิวล่าสุด</h2>
          <Link href="/jobs" className="flex items-center gap-0.5 text-xs font-medium text-[hsl(24,85%,50%)] hover:underline">
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <p className="text-sm text-[hsl(25,10%,50%)] text-center py-8">ยังไม่มีงานรีวิว</p>
        ) : (
          <div className="divide-y divide-[hsl(35,25%,94%)]">
            {recentJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(35,25%,97%)] transition-colors">
                <div className="w-1.5 h-10 rounded-full shrink-0 bg-[hsl(24,85%,50%)] opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[hsl(25,20%,15%)] truncate">{job.brand_name}</p>
                  <p className="text-xs text-[hsl(25,10%,50%)] truncate">{job.product_name}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${JOB_STATUS_COLORS[job.status]}`}>
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                  <span className="text-xs font-bold text-[hsl(24,85%,50%)]">{formatCurrency(job.payment_amount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming content ────────────────────────────── */}
      {upcomingContent.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-bold text-[hsl(25,20%,15%)]">📅 โพสสัปดาห์นี้</h2>
            <Link href="/content" className="flex items-center gap-0.5 text-xs font-medium text-[hsl(24,85%,50%)] hover:underline">
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[hsl(35,25%,94%)]">
            {upcomingContent.map(c => (
              <Link key={c.id} href={`/content/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[hsl(35,25%,97%)] transition-colors">
                <p className="text-sm font-medium text-[hsl(25,20%,15%)] truncate flex-1">{c.title}</p>
                <p className="text-xs text-[hsl(25,10%,50%)] ml-3 shrink-0">{c.planned_date ? formatDate(c.planned_date) : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
