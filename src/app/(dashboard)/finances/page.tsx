import Link from "next/link"
import { getTransactions, getFinanceSummary } from "@/actions/transactions.actions"
import { DeleteTransactionButton } from "@/components/finances/DeleteTransactionButton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string }>
}) {
  const params = await searchParams
  const month = params.month ?? getCurrentMonth()
  const [transactions, summary] = await Promise.all([
    getTransactions({ type: params.type, month }),
    getFinanceSummary(month),
  ])

  const [year, mon] = month.split("-")
  const monthLabel = new Date(parseInt(year), parseInt(mon) - 1, 1).toLocaleString("th-TH", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">การเงิน</h1>
          <p className="text-sm text-[hsl(25,10%,50%)] mt-1">ติดตามรายรับและรายจ่าย</p>
        </div>
        <Link href="/finances/new">
          <Button><Plus className="w-4 h-4 mr-1" />เพิ่มรายการ</Button>
        </Link>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-[hsl(25,10%,50%)]">เดือน:</label>
        <input
          type="month"
          defaultValue={month}
          onChange={e => {
            const url = new URL(window.location.href)
            url.searchParams.set("month", e.target.value)
            window.location.href = url.toString()
          }}
          className="text-sm border border-[hsl(35,20%,88%)] rounded-lg px-3 py-1.5 bg-white"
          suppressHydrationWarning
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
          <p className="text-xs text-[hsl(25,10%,50%)]">รายรับ</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(summary.income)}</p>
          <p className="text-xs text-[hsl(25,10%,50%)] mt-1">{monthLabel}</p>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
          <p className="text-xs text-[hsl(25,10%,50%)]">รายจ่าย</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(summary.expense)}</p>
          <p className="text-xs text-[hsl(25,10%,50%)] mt-1">{monthLabel}</p>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-5">
          <p className="text-xs text-[hsl(25,10%,50%)]">กำไรสุทธิ</p>
          <p className={`text-2xl font-bold mt-1 ${summary.net >= 0 ? "text-[hsl(25,20%,15%)]" : "text-red-500"}`}>
            {formatCurrency(summary.net)}
          </p>
          <p className="text-xs text-[hsl(25,10%,50%)] mt-1">{monthLabel}</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "ทั้งหมด" },
          { value: "income", label: "รายรับ" },
          { value: "expense", label: "รายจ่าย" },
        ].map(t => (
          <Link
            key={t.value}
            href={t.value === "all" ? `/finances?month=${month}` : `/finances?type=${t.value}&month=${month}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (params.type ?? "all") === t.value
                ? "bg-[hsl(24,85%,50%)] text-white"
                : "bg-white border border-[hsl(35,20%,88%)] text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[hsl(25,10%,50%)]">ไม่มีรายการในเดือนนี้</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[hsl(35,25%,95%)] text-[hsl(25,10%,50%)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">วันที่</th>
                <th className="text-left px-4 py-3 font-medium">ประเภท</th>
                <th className="text-left px-4 py-3 font-medium">หมวดหมู่</th>
                <th className="text-left px-4 py-3 font-medium">รายละเอียด / งานที่เชื่อม</th>
                <th className="text-right px-4 py-3 font-medium">จำนวนเงิน</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(35,20%,92%)]">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-[hsl(35,25%,97%)]">
                  <td className="px-4 py-3 text-[hsl(25,20%,35%)]">{formatDate(tx.transaction_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(25,20%,35%)]">{tx.category ?? "-"}</td>
                  <td className="px-4 py-3">
                    <p className="text-[hsl(25,20%,25%)]">{tx.description ?? "-"}</p>
                    {tx.review_jobs && (
                      <p className="text-xs text-[hsl(25,10%,50%)]">🔗 {tx.review_jobs.brand_name} — {tx.review_jobs.product_name}</p>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/finances/${tx.id}/edit`} className="p-1 text-gray-400 hover:text-[hsl(24,85%,50%)] transition-colors rounded">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteTransactionButton id={tx.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
