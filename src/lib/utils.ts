import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

export function formatDateThai(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d)
}

export function buildDocFilename(doc: { doc_type: string; doc_number: string; doc_date: string; customer_name: string | null }): string {
  const label: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบส่งมอบงาน", receipt: "ใบเสร็จ" }
  const run = doc.doc_number.split("-").pop() ?? ""
  const d = new Date(doc.doc_date)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)
  return `${label[doc.doc_type] ?? doc.doc_type}${run}_${(doc.customer_name ?? "").replace(/\s+/g, "")}_${dd}${mm}${yy}`
}

const ONES_TH = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"]
const PLACES_TH = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"]

function convertBelowMillion(n: number): string {
  if (n === 0) return ""
  const digits: number[] = []
  let temp = n
  for (let i = 0; i < 6; i++) {
    digits.push(temp % 10)
    temp = Math.floor(temp / 10)
  }
  let result = ""
  for (let i = 5; i >= 0; i--) {
    const d = digits[i]
    if (d === 0) continue
    if (i === 1) {
      if (d === 1) result += "สิบ"
      else if (d === 2) result += "ยี่สิบ"
      else result += ONES_TH[d] + "สิบ"
    } else if (i === 0) {
      result += (digits[1] >= 1 && d === 1) ? "เอ็ด" : ONES_TH[d]
    } else {
      result += ONES_TH[d] + PLACES_TH[i]
    }
  }
  return result
}

export function bahtText(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const [intPart, decPart] = rounded.toFixed(2).split(".")
  const intNum = parseInt(intPart)
  const dec = parseInt(decPart)

  if (intNum === 0 && dec === 0) return "ศูนย์บาทถ้วน"

  let result = ""
  const millions = Math.floor(intNum / 1_000_000)
  const remainder = intNum % 1_000_000

  if (millions) result += convertBelowMillion(millions) + "ล้าน"
  result += convertBelowMillion(remainder)
  result += "บาท"

  if (dec === 0) {
    result += "ถ้วน"
  } else {
    const d1 = Math.floor(dec / 10)
    const d2 = dec % 10
    if (d1 === 1) result += "สิบ"
    else if (d1 === 2) result += "ยี่สิบ"
    else if (d1 > 2) result += ONES_TH[d1] + "สิบ"
    if (d2 === 1 && d1 >= 1) result += "เอ็ด"
    else if (d2 > 0) result += ONES_TH[d2]
    result += "สตางค์"
  }
  return result
}
