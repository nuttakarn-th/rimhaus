import { getCommissionRecords, getCommissionRecord } from "@/actions/commission.actions"
import { CommissionCalculator } from "@/components/commission/CommissionCalculator"
import { CommissionHistory } from "@/components/commission/CommissionHistory"

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export default async function CommissionPage() {
  const [records, existing] = await Promise.all([
    getCommissionRecords(),
    getCommissionRecord(getCurrentMonth()),
  ])

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(25,20%,15%)]">คำนวณรายได้ & จัดสรร</h1>
        <p className="text-sm text-[hsl(25,10%,50%)] mt-1">The 80/20 Discipline — เมื่อไหร่บ้านจะเสร็จ?</p>
      </div>

      <CommissionCalculator existing={existing} />

      {records.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-[hsl(25,20%,20%)]">ประวัติรายเดือน</h2>
          <CommissionHistory records={records} />
        </div>
      )}
    </div>
  )
}
