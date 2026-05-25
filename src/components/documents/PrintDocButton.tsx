"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintDocButton({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => window.print(), 800)
    return () => clearTimeout(t)
  }, [auto])

  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      พิมพ์ / บันทึก PDF
    </Button>
  )
}
