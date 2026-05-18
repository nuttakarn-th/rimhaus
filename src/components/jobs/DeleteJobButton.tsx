"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteJob } from "@/actions/jobs.actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("ต้องการลบงานนี้ใช่ไหม? การกระทำนี้ไม่สามารถยกเลิกได้")) return
    setLoading(true)
    const result = await deleteJob(jobId)
    if (result.success) {
      toast.success("ลบงานสำเร็จ")
      router.push("/jobs")
      router.refresh()
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading} className="text-red-600 border-red-200 hover:bg-red-50">
      <Trash2 className="w-3.5 h-3.5 mr-1" />
      ลบ
    </Button>
  )
}
