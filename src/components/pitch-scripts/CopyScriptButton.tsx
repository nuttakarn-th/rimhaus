"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

export function CopyScriptButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  async function handle() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("คัดลอกแล้ว — วางใน LINE ได้เลย")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("คัดลอกไม่สำเร็จ")
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handle} className="gap-1.5">
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "คัดลอกแล้ว" : "คัดลอก"}
    </Button>
  )
}
