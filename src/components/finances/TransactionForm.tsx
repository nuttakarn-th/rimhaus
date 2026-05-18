"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTransaction } from "@/actions/transactions.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import type { ReviewJob } from "@/lib/types"
import { toast } from "sonner"

interface TransactionFormProps {
  jobs: ReviewJob[]
}

export function TransactionForm({ jobs }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [jobId, setJobId] = useState<string>("")

  function handleJobChange(id: string) {
    setJobId(id)
    if (id && id !== "none") {
      const job = jobs.find(j => j.id === id)
      if (job) {
        setAmount(String(job.payment_amount))
        setCategory("ค่ารีวิว")
        setDescription(`ค่ารีวิว ${job.brand_name} — ${job.product_name}`)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      toast.error("กรุณากรอกจำนวนเงิน")
      return
    }
    setLoading(true)

    const result = await createTransaction({
      type,
      amount: Number(amount),
      category: category || undefined,
      description: description || undefined,
      transaction_date: date,
      payment_method: paymentMethod || undefined,
      review_job_id: jobId && jobId !== "none" ? jobId : null,
    })

    if (!result.success) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("เพิ่มรายการสำเร็จ")
    router.push("/finances")
    router.refresh()
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-6 space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2">
          {(["income", "expense"] as const).map(t => (
            <button key={t} type="button" onClick={() => { setType(t); setCategory("") }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? t === "income" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  : "bg-[hsl(35,25%,92%)] text-[hsl(25,20%,35%)]"
              }`}>
              {t === "income" ? "รายรับ" : "รายจ่าย"}
            </button>
          ))}
        </div>

        {/* Link to job */}
        {type === "income" && jobs.length > 0 && (
          <div className="space-y-2">
            <Label>เชื่อมกับงานรีวิว (ไม่บังคับ)</Label>
            <Select value={jobId} onValueChange={handleJobChange}>
              <SelectTrigger><SelectValue placeholder="เลือกงานรีวิว..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่เชื่อมกับงานไหน</SelectItem>
                {jobs.map(j => (
                  <SelectItem key={j.id} value={j.id}>{j.brand_name} — {j.product_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>จำนวนเงิน (บาท) *</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" required />
          </div>
          <div className="space-y-2">
            <Label>วันที่</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>หมวดหมู่</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ช่องทางชำระเงิน</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue placeholder="เลือก..." /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>รายละเอียด</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="เช่น ค่ารีวิวโซฟา IKEA" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? "กำลังบันทึก..." : "บันทึกรายการ"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>ยกเลิก</Button>
      </div>
    </form>
  )
}
