import { notFound } from "next/navigation"
import { getTransaction } from "@/actions/transactions.actions"
import { getJobs } from "@/actions/jobs.actions"
import { TransactionForm } from "@/components/finances/TransactionForm"
import { formatCurrency } from "@/lib/utils"

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [transaction, jobs] = await Promise.all([getTransaction(id), getJobs()])
  if (!transaction) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">แก้ไขรายการ</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">
          {transaction.type === "income" ? "รายรับ" : "รายจ่าย"} {formatCurrency(transaction.amount)}
        </p>
      </div>
      <TransactionForm transaction={transaction} jobs={jobs} />
    </div>
  )
}
