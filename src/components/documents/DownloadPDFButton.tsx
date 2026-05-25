"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/types"

export function DownloadPDFButton({ doc }: { doc: Document }) {
  return (
    <Button
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={() => window.open(`/documents/${doc.id}/print?auto=1`, "_blank", "noopener")}
    >
      <Download className="w-3.5 h-3.5 mr-1.5" />Download PDF
    </Button>
  )
}
