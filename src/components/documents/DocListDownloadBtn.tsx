"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DocListDownloadBtn({ docId }: { docId: string }) {
  return (
    <a href={`/api/documents/${docId}/pdf`} download>
      <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-700">
        <Download className="w-3.5 h-3.5" />
      </Button>
    </a>
  )
}
