"use client"

import { useState } from "react"
import { deleteAiProduct } from "@/actions/ai-product.actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteAiProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteAiProduct(id)
    setLoading(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบสินค้าสำเร็จ")
    router.refresh()
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-[hsl(25,10%,50%)]">ลบ?</span>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>ยกเลิก</Button>
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "ลบ"}
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
      <Trash2 className="w-3.5 h-3.5 text-red-400" />
    </Button>
  )
}
