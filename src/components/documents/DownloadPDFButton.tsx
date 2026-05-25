"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildDocFilename } from "@/lib/utils"
import type { Document } from "@/lib/types"

export function DownloadPDFButton({ doc }: { doc: Document }) {
  function handlePrint() {
    const prev = document.title
    document.title = buildDocFilename(doc)
    window.print()
    document.title = prev
  }

  return (
    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint}>
      <Download className="w-3.5 h-3.5 mr-1.5" />Download PDF
    </Button>
  )
}
