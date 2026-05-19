"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deletePost } from "@/actions/posts.actions"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeletePostButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("ต้องการลบโพสนี้?")) return
    setLoading(true)
    const result = await deletePost(id)
    if (result.success) {
      toast.success("ลบโพสสำเร็จ")
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
