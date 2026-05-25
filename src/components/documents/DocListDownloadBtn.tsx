"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDocument } from "@/actions/documents.actions"
import { downloadDocPDF } from "./DocumentPDF"
import { toast } from "sonner"

export function DocListDownloadBtn({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const doc = await getDocument(docId)
      if (!doc) { toast.error("ไม่พบเอกสาร"); return }
      await downloadDocPDF(doc)
    } catch (err) {
      console.error("PDF generation error:", err)
      toast.error("ไม่สามารถสร้าง PDF ได้: " + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-blue-500 hover:text-blue-700"
      onClick={handleClick}
      disabled={loading}
    >
      <Download className="w-3.5 h-3.5" />
    </Button>
  )
}
