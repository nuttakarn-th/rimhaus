"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildDocFilename } from "@/lib/utils"
import type { Document } from "@/lib/types"

export async function downloadDocPDF(doc: Document) {
  const element = window.document.getElementById("doc-printarea")
  if (!element) return

  const filename = buildDocFilename(doc) + ".pdf"

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])

  const clone = element.cloneNode(true) as HTMLElement
  clone.style.cssText = [
    "position:absolute",
    "left:-9999px",
    "top:0",
    "width:794px",
    "max-width:none",
    "height:auto",
    "overflow:visible",
    "padding:32px",
    "margin:0",
    "background:white",
    "font-family:'Noto Sans Thai','Sarabun',sans-serif",
  ].join(";")
  document.body.appendChild(clone)

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: clone.offsetWidth,
      height: clone.scrollHeight,
      windowWidth: clone.offsetWidth,
      windowHeight: clone.scrollHeight,
    })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const mLeft = 15, mTop = 20, mRight = 15, mBottom = 20
    const printW = 210 - mLeft - mRight
    const printH = 297 - mTop - mBottom
    const imgH = (canvas.height * printW) / canvas.width
    let sliceY = 0
    while (sliceY < imgH) {
      if (sliceY > 0) pdf.addPage()
      pdf.addImage(imgData, "PNG", mLeft, mTop - sliceY, printW, imgH)
      sliceY += printH
    }
    pdf.save(filename)
  } finally {
    document.body.removeChild(clone)
  }
}

export function DownloadPDFButton({ doc }: { doc: Document }) {
  return (
    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => downloadDocPDF(doc)}>
      <Download className="w-3.5 h-3.5 mr-1.5" />Download PDF
    </Button>
  )
}
