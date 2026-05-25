"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DocListDownloadBtn({ docId }: { docId: string }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-blue-500 hover:text-blue-700"
      onClick={() => window.open(`/documents/${docId}?print=1`, "_blank", "noopener")}
    >
      <Download className="w-3.5 h-3.5" />
    </Button>
  )
}
