import { TransactionForm } from "@/components/finances/TransactionForm"
import { getJobs } from "@/actions/jobs.actions"

export default async function NewTransactionPage() {
  const jobs = await getJobs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">เพิ่มรายการ</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">บันทึกรายรับหรือรายจ่าย</p>
      </div>
      <TransactionForm jobs={jobs} />
    </div>
  )
}
