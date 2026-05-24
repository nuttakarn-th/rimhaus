"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCustomer } from "@/actions/customers.actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteCustomerButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!confirm(`ลบ "${name}" ใช่มั้ย?`)) return
    setLoading(true)
    const result = await deleteCustomer(id)
    setLoading(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.refresh()
  }

  return (
    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={handle} disabled={loading}>
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
