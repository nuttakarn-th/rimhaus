import { KpiCard } from "@/components/dashboard/KpiCard"
import { MonthlyIncomeChart } from "@/components/dashboard/MonthlyIncomeChart"
import { PlatformSummary } from "@/components/dashboard/PlatformSummary"
import { TopPillarWidget } from "@/components/dashboard/TopPillarWidget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getJobs } from "@/actions/jobs.actions"
import { getFinanceSummary, getMonthlyIncome } from "@/actions/transactions.actions"
import { getContentItems, getPillarEngagement } from "@/actions/content.actions"
import { getPlatformCounts } from "@/actions/posts.actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants"
import Link from "next/link"
import { addDays } from "date-fns"

export default async function DashboardPage() {
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

  const activeJobs = jobs.filter(j => j.status === "accepted" || j.status === "in_progress")
  const pendingPayment = jobs.filter(j => j.payment_status === "pending" && j.status !== "closed")
  const upcomingContent = contentItems.filter(c =>
    c.planned_date && c.planned_date >= today && c.planned_date <= nextWeek && c.status !== "posted"
  )
  const recentJobs = jobs.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">หน้าหลัก</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">ภาพรวมธุรกิจเพจแต่งบ้าน</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="รายรับเดือนนี้"
          value={formatCurrency(summary.income)}
          subtitle={`กำไรสุทธิ ${formatCurrency(summary.net)}`}
          icon="💰"
        />
        <KpiCard
          title="งานที่กำลังทำ"
          value={String(activeJobs.length)}
          subtitle="งานที่ยังไม่ปิด"
          icon="📋"
        />
        <KpiCard
          title="คอนเทนต์สัปดาห์นี้"
          value={String(upcomingContent.length)}
          subtitle="วางแผนจะโพส 7 วันข้างหน้า"
          icon="📅"
        />
        <KpiCard
          title="รอรับเงิน"
          value={String(pendingPayment.length)}
          subtitle={`รวม ${formatCurrency(pendingPayment.reduce((s, j) => s + j.payment_amount, 0))}`}
          icon="⏳"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[hsl(35,20%,88%)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[hsl(25,10%,50%)]">รายรับ 6 เดือนที่ผ่านมา</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyIncomeChart data={monthlyIncome} />
          </CardContent>
        </Card>
        <Card className="border-[hsl(35,20%,88%)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[hsl(25,10%,50%)]">โพสต่อแพลตฟอร์ม</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformSummary data={platformCounts} />
          </CardContent>
        </Card>
      </div>

      <TopPillarWidget stats={pillarStats} />

      {/* Recent Jobs */}
      <Card className="border-[hsl(35,20%,88%)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">งานรีวิวล่าสุด</CardTitle>
          <Link href="/jobs" className="text-sm text-[hsl(24,85%,50%)] hover:underline">ดูทั้งหมด</Link>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-[hsl(25,10%,50%)] text-center py-4">ยังไม่มีงานรีวิว</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-start justify-between gap-3 p-3 rounded-lg hover:bg-[hsl(35,25%,95%)] transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[hsl(25,20%,15%)] truncate">{job.brand_name}</p>
                    <p className="text-xs text-[hsl(25,10%,50%)] truncate">{job.product_name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}>
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                    <span className="text-sm font-semibold text-[hsl(25,20%,15%)]">{formatCurrency(job.payment_amount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming deadlines */}
      {upcomingContent.length > 0 && (
        <Card className="border-[hsl(35,20%,88%)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">คอนเทนต์ที่จะโพสสัปดาห์นี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingContent.map(c => (
                <Link key={c.id} href={`/content/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(35,25%,95%)] transition-colors">
                  <p className="text-sm font-medium text-[hsl(25,20%,15%)]">{c.title}</p>
                  <p className="text-xs text-[hsl(25,10%,50%)]">{c.planned_date ? formatDate(c.planned_date) : ""}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
