"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { deleteCommissionRecord, type CommissionRecord } from "@/actions/commission.actions"
import { Trash2 } from "lucide-react"

function monthLabel(m: string) {
  const [y, mo] = m.split("-")
  return new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleString("th-TH", { month: "long", year: "numeric" })
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm("ลบข้อมูลเดือนนี้?")) return
    startTransition(async () => {
      const res = await deleteCommissionRecord(id)
      if (res.success) toast.success("ลบแล้ว")
      else toast.error(res.error ?? "เกิดข้อผิดพลาด")
    })
  }
  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-[hsl(25,10%,60%)] hover:text-red-500 transition-colors rounded"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

interface Props {
  records: CommissionRecord[]
}

export function CommissionHistory({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-8 text-center">
        <p className="text-sm text-[hsl(25,10%,55%)]">ยังไม่มีข้อมูล — กรอกและกด "ยืนยัน" เพื่อบันทึกเดือนแรก</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {records.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="font-semibold text-[hsl(25,20%,15%)]">{monthLabel(r.month)}</p>
              {r.notes && <p className="text-xs text-[hsl(25,10%,55%)] mt-0.5">{r.notes}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-lg font-bold text-[hsl(25,20%,15%)]">{formatCurrency(r.net_income)}</span>
              <DeleteButton id={r.id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[hsl(25,10%,50%)]">รายรับ Cash</span>
              <span className="text-green-600 font-medium">+{formatCurrency(r.cash_income)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(25,10%,50%)]">Affiliate</span>
              <span className="text-[hsl(270,50%,50%)] font-medium">+{formatCurrency(r.affiliate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(25,10%,50%)]">ค่า Ads</span>
              <span className="text-red-500 font-medium">−{formatCurrency(r.ads_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(25,10%,50%)]">ค่าโปรแกรม</span>
              <span className="text-red-500 font-medium">−{formatCurrency(r.programs_cost)}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[hsl(35,20%,92%)] grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <p className="text-[hsl(25,10%,50%)]">กองทุนเพจ</p>
              <p className="font-semibold text-[hsl(24,85%,45%)]">{formatCurrency(r.fund_page)}</p>
            </div>
            <div>
              <p className="text-[hsl(25,10%,50%)]">ปาล์ม</p>
              <p className="font-semibold text-[hsl(200,70%,40%)]">{formatCurrency(r.palm)}</p>
            </div>
            <div>
              <p className="text-[hsl(25,10%,50%)]">ริชา</p>
              <p className="font-semibold text-[hsl(200,70%,40%)]">{formatCurrency(r.richa)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
