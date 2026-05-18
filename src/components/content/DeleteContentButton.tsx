"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteContentItem } from "@/actions/content.actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteContentButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("ต้องการลบคอนเทนต์นี้?")) return
    setLoading(true)
    const result = await deleteContentItem(id)
    if (result.success) {
      toast.success("ลบคอนเทนต์สำเร็จ")
      router.push("/content")
      router.refresh()
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50">
      <Trash2 className="w-3.5 h-3.5 mr-1" />ลบ
    </Button>
  )
}
