import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

const ONES = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"]
const TENS = ["", "สิบ", "ยี่สิบ", "สามสิบ", "สี่สิบ", "ห้าสิบ", "หกสิบ", "เจ็ดสิบ", "แปดสิบ", "เก้าสิบ"]
const PLACES = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"]

function threeDigits(n: number): string {
  if (n === 0) return ""
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  let s = ""
  if (h) s += ONES[h] + "ร้อย"
  if (t === 1) s += "สิบ"
  else if (t > 1) s += TENS[t]
  if (o === 1 && t > 0) s += "เอ็ด"
  else if (o > 0) s += ONES[o]
  return s
}

export function bahtText(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const [intPart, decPart] = rounded.toFixed(2).split(".")
  const intNum = parseInt(intPart)
  const dec = parseInt(decPart)

  if (intNum === 0 && dec === 0) return "ศูนย์บาทถ้วน"

  let result = ""
  const millions = Math.floor(intNum / 1000000)
  const remainder = intNum % 1000000
  const thousands = Math.floor(remainder / 1000)
  const hundreds = remainder % 1000

  if (millions) result += threeDigits(millions) + "ล้าน"
  if (thousands) result += threeDigits(thousands) + "พัน"
  if (hundreds) result += threeDigits(hundreds)

  result += "บาท"
  if (dec === 0) {
    result += "ถ้วน"
  } else {
    const d1 = Math.floor(dec / 10)
    const d2 = dec % 10
    if (d1 === 1) result += "สิบ"
    else if (d1 > 1) result += TENS[d1]
    if (d2 === 1 && d1 > 0) result += "เอ็ด"
    else if (d2 > 0) result += ONES[d2]
    result += "สตางค์"
  }
  return result
}
