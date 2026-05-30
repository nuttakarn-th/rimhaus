"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Document } from "@/lib/types"

export function DownloadPDFButton({ doc, className }: { doc: Document; className?: string }) {
  return (
    <Button
      size="sm"
      className={cn("bg-blue-600 hover:bg-blue-700 text-white", className)}
      onClick={() => window.open(`/documents/${doc.id}/print?auto=1`, "_blank", "noopener")}
    >
      <Download className="w-3.5 h-3.5 mr-1.5" />Download PDF
    </Button>
  )
}
