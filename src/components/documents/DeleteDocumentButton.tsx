"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteDocument } from "@/actions/documents.actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteDocumentButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("ลบเอกสารนี้ใช่มั้ย?")) return
    setLoading(true)
    const result = await deleteDocument(id)
    setLoading(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("ลบแล้ว")
    router.refresh()
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-red-400 hover:text-red-600"
      onClick={handle}
      disabled={loading}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
