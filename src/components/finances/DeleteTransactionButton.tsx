"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteTransaction } from "@/actions/transactions.actions"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("ต้องการลบรายการนี้?")) return
    setLoading(true)
    const result = await deleteTransaction(id)
    if (result.success) {
      toast.success("ลบรายการสำเร็จ")
      router.refresh()
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
