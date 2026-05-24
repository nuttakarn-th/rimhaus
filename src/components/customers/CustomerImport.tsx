"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { bulkImportCustomers } from "@/actions/customers.actions"

const COLUMNS = [
  { key: "name", label: "ชื่อบริษัท / แบรนด์ *" },
  { key: "tax_id", label: "เลขผู้เสียภาษี" },
  { key: "address", label: "ที่อยู่" },
  { key: "contact_name", label: "ชื่อผู้ติดต่อ" },
  { key: "phone", label: "โทรศัพท์" },
  { key: "contact_line", label: "LINE ID" },
  { key: "email", label: "อีเมล" },
  { key: "notes", label: "หมายเหตุ" },
]

export function CustomerImport() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  function downloadTemplate() {
    const headers = COLUMNS.map(c => c.label)
    const ws = XLSX.utils.aoa_to_sheet([headers])
    ws["!cols"] = COLUMNS.map(() => ({ wch: 28 }))
    // Style header row bold (xlsx-style not available but width hint helps)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "ลูกค้า")
    XLSX.writeFile(wb, "template_customers.xlsx")
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" })

      const data = rows
        .slice(1)
        .filter(row => String(row[0] ?? "").trim())
        .map(row => ({
          name: String(row[0] ?? "").trim(),
          tax_id: String(row[1] ?? "").trim() || null,
          address: String(row[2] ?? "").trim() || null,
          contact_name: String(row[3] ?? "").trim() || null,
          phone: String(row[4] ?? "").trim() || null,
          contact_line: String(row[5] ?? "").trim() || null,
          email: String(row[6] ?? "").trim() || null,
          notes: String(row[7] ?? "").trim() || null,
        }))

      if (data.length === 0) {
        toast.error("ไม่พบข้อมูลในไฟล์ — กรุณากรอกชื่อบริษัท/แบรนด์อย่างน้อย 1 แถว")
        return
      }

      const result = await bulkImportCustomers(data)
      if (!result.success) { toast.error(result.error); return }
      toast.success(`นำเข้าสำเร็จ ${result.data} รายการ`)
      router.refresh()
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์")
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={downloadTemplate} type="button">
        <Download className="w-3.5 h-3.5 mr-1.5" />
        <span className="hidden sm:inline">ดาวน์โหลด </span>Template
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        type="button"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5" />
        {importing ? "กำลังนำเข้า..." : <><span className="hidden sm:inline">นำเข้า </span>Excel</>}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
