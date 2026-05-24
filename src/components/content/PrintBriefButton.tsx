"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintBriefButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      พิมพ์ / บันทึก PDF
    </Button>
  )
}
