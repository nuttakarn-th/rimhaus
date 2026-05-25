"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteContentItem } from "@/actions/content.actions"
import { toast } from "sonner"

export function DeleteContentButton({ id, redirectOnDelete }: { id: string; redirectOnDelete?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm("ลบคอนเทนต์นี้ใช่มั้ย?")) return
    setLoading(true)
    const result = await deleteContentItem(id)
    if (!result.success) { toast.error(result.error); setLoading(false); return }
    toast.success("ลบแล้ว")
    if (redirectOnDelete) router.push("/content")
    else router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="ลบ"
      className="p-1.5 rounded-lg text-[hsl(25,10%,55%)] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
