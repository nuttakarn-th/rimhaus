"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadDocPDF } from "./DocumentPDF"
import type { Document } from "@/lib/types"

export function DownloadPDFButton({ doc }: { doc: Document }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await downloadDocPDF(doc)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={handleClick}
      disabled={loading}
    >
      <Download className="w-3.5 h-3.5 mr-1.5" />
      {loading ? "กำลังสร้าง..." : "Download PDF"}
    </Button>
  )
}
