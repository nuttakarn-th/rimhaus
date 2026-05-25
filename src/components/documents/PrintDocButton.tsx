"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

function printWithFilename(filename: string) {
  const prev = document.title
  document.title = filename
  window.onafterprint = () => { document.title = prev }
  window.print()
}

export function PrintDocButton({ auto, filename }: { auto: boolean; filename: string }) {
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => printWithFilename(filename), 800)
    return () => clearTimeout(t)
  }, [auto, filename])

  return (
    <Button size="sm" onClick={() => printWithFilename(filename)}>
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      พิมพ์ / บันทึก PDF
    </Button>
  )
}
