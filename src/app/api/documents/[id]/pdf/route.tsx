import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import { readFileSync } from "fs"
import { join } from "path"
import { getDocument } from "@/actions/documents.actions"
import { buildDocFilename, bahtText } from "@/lib/utils"

const MM = 2.834645 // 1mm in points
const W = 595.28   // A4 width
const H = 841.89   // A4 height
const ML = 15 * MM // margin left
const MR = 15 * MM // margin right
const MT = 20 * MM // margin top
const CW = W - ML - MR // content width

function formatThaiDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "numeric", day: "numeric" })
}

function truncate(str: string, font: { widthOfTextAtSize: (s: string, size: number) => number }, maxW: number, size: number): string {
  if (font.widthOfTextAtSize(str, size) <= maxW) return str
  let s = str
  while (s.length > 1 && font.widthOfTextAtSize(s + "…", size) > maxW) s = s.slice(0, -1)
  return s + "…"
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const doc = await getDocument(id)
  if (!doc) return new Response("Not found", { status: 404 })

  try {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)

    const regularBytes = readFileSync(join(process.cwd(), "public/fonts/NotoSansThai-Regular.ttf"))
    const boldBytes = readFileSync(join(process.cwd(), "public/fonts/NotoSansThai-Bold.ttf"))
    const font = await pdfDoc.embedFont(regularBytes)
    const fontB = await pdfDoc.embedFont(boldBytes)

    const page = pdfDoc.addPage([W, H])

    // Helpers (y counted from top)
    function txt(str: string, x: number, yTop: number, f = font, size = 9, color = rgb(0.1, 0.07, 0.05)) {
      if (!str) return
      page.drawText(str, { x, y: H - yTop - size * 0.8, font: f, size, color })
    }
    function ln(x1: number, y1: number, x2: number, y2: number, thickness = 0.5, color = rgb(0.6, 0.55, 0.5)) {
      page.drawLine({ start: { x: x1, y: H - y1 }, end: { x: x2, y: H - y2 }, thickness, color })
    }
    function box(x: number, yTop: number, w: number, h: number, fill = rgb(1, 1, 1), strokeColor?: ReturnType<typeof rgb>, strokeW = 0.5) {
      page.drawRectangle({ x, y: H - yTop - h, width: w, height: h, color: fill, ...(strokeColor ? { borderColor: strokeColor, borderWidth: strokeW } : {}) })
    }

    let cy = MT

    // ── HEADER ──────────────────────────────────────────────────────
    const titleMap: Record<string, string> = { quotation: "ใบเสนอราคา", invoice: "ใบส่งมอบงาน/ใบแจ้งหนี้", receipt: "ใบเสร็จรับเงิน" }
    const titleColorMap: Record<string, ReturnType<typeof rgb>> = {
      quotation: rgb(0.85, 0.42, 0.1),
      invoice:   rgb(0.1,  0.35, 0.75),
      receipt:   rgb(0.1,  0.55, 0.2),
    }
    const docTitle = titleMap[doc.doc_type] ?? doc.doc_type
    const titleColor = titleColorMap[doc.doc_type] ?? rgb(0.1, 0.07, 0.05)

    // Issuer (left)
    let issuerEndY = cy
    if (doc.issuer_name) { txt(doc.issuer_name, ML, issuerEndY, fontB, 10); issuerEndY += 13 }
    for (const l of (doc.issuer_address ?? "").split("\n").filter(Boolean)) {
      txt(l, ML, issuerEndY, font, 8, rgb(0.35, 0.28, 0.22)); issuerEndY += 10
    }
    if (doc.issuer_phone || doc.issuer_email) {
      const c = [doc.issuer_phone ? `โทร ${doc.issuer_phone}` : "", doc.issuer_email ?? ""].filter(Boolean).join("  ")
      txt(c, ML, issuerEndY, font, 8, rgb(0.35, 0.28, 0.22)); issuerEndY += 10
    }
    if (doc.issuer_id_card) { txt(`เลขที่บัตรประชาชน ${doc.issuer_id_card}`, ML, issuerEndY, font, 8, rgb(0.35, 0.28, 0.22)); issuerEndY += 10 }

    // Doc title (right)
    const titleSize = 15
    const titleW = fontB.widthOfTextAtSize(docTitle, titleSize)
    txt(docTitle, ML + CW - titleW, cy, fontB, titleSize, titleColor)

    const numLabel = "เลขที่"
    const dateLabel = "วันที่"
    const numValue = doc.doc_number
    const dateValue = formatThaiDate(doc.doc_date)
    const numValueW = fontB.widthOfTextAtSize(numValue, 9)
    const dateValueW = fontB.widthOfTextAtSize(dateValue, 9)
    const labelMaxW = Math.max(font.widthOfTextAtSize(numLabel, 9), font.widthOfTextAtSize(dateLabel, 9))
    const valueMaxW = Math.max(numValueW, dateValueW)
    const infoX = ML + CW - valueMaxW - labelMaxW - 12
    const rightEdge = ML + CW

    const infoY = cy + titleSize + 5
    txt(numLabel, infoX, infoY, font, 9, rgb(0.4, 0.33, 0.27))
    txt(numValue, rightEdge - numValueW, infoY, fontB, 9)
    txt(dateLabel, infoX, infoY + 13, font, 9, rgb(0.4, 0.33, 0.27))
    txt(dateValue, rightEdge - dateValueW, infoY + 13, fontB, 9)

    cy = Math.max(issuerEndY, infoY + 26) + 6

    // ── CUSTOMER ─────────────────────────────────────────────────────
    ln(ML, cy, ML + CW, cy, 0.3, rgb(0.8, 0.75, 0.7)); cy += 6
    const custLabel = doc.doc_type === "invoice" ? "ATTN:" : "เสนอ"
    txt(custLabel, ML, cy, fontB, 10)
    txt(doc.customer_name ?? "—", ML + 42, cy, fontB, 10); cy += 13
    for (const l of (doc.customer_address ?? "").split("\n").filter(Boolean)) {
      txt(l, ML + 42, cy, font, 8, rgb(0.35, 0.28, 0.22)); cy += 10
    }
    if (doc.customer_tax_id) { txt(`เลขที่ภาษี ${doc.customer_tax_id}`, ML + 42, cy, font, 8, rgb(0.4, 0.33, 0.27)); cy += 10 }

    // Platforms
    if (doc.platforms && doc.platforms.length > 0) {
      const platLabels: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", lemon8: "Lemon8", shopee: "Shopee" }
      txt("Platform", ML, cy, fontB, 9)
      txt(doc.platforms.map(p => platLabels[p] ?? p).join(", "), ML + 50, cy, font, 8, rgb(0.35, 0.28, 0.22)); cy += 12
    }

    // ── TABLE ─────────────────────────────────────────────────────────
    cy += 6
    // col widths: ลำดับ | รายการ | หน่วย | ราคา/หน่วย | จำนวนเงิน
    const cols = [22, CW - 22 - 28 - 56 - 56, 28, 56, 56]
    const colXArr = [ML, ML + cols[0], ML + cols[0] + cols[1], ML + cols[0] + cols[1] + cols[2], ML + cols[0] + cols[1] + cols[2] + cols[3]]
    const rowH = 18
    const hdrH = 20

    // Header row
    box(ML, cy, CW, hdrH, rgb(0.12, 0.09, 0.07))
    const hdrLabels = ["ลำดับ", "รายการ", "หน่วย", "ราคา/หน่วย", "จำนวนเงิน"]
    const hdrAligns = ["center", "left", "center", "right", "right"]
    for (let i = 0; i < 5; i++) {
      const lw = fontB.widthOfTextAtSize(hdrLabels[i], 8)
      let hx = colXArr[i] + 3
      if (hdrAligns[i] === "center") hx = colXArr[i] + cols[i] / 2 - lw / 2
      if (hdrAligns[i] === "right")  hx = colXArr[i] + cols[i] - lw - 3
      txt(hdrLabels[i], hx, cy + 6, fontB, 8, rgb(1, 1, 1))
    }
    cy += hdrH

    // Rows
    const items = doc.document_items ?? []
    const minRows = Math.max(3, items.length)
    for (let i = 0; i < minRows; i++) {
      box(ML, cy, CW, rowH, i % 2 === 1 ? rgb(0.98, 0.96, 0.94) : rgb(1, 1, 1))
      const item = items[i]
      if (item) {
        const idx = String(i + 1)
        const idxW = font.widthOfTextAtSize(idx, 9)
        txt(idx, colXArr[0] + cols[0] / 2 - idxW / 2, cy + 5, font, 9, rgb(0.4, 0.33, 0.27))

        const desc = truncate(item.description ?? "", font, cols[1] - 6, 9)
        txt(desc, colXArr[1] + 3, cy + 5, font, 9)

        const qty = String(item.quantity)
        const qtyW = font.widthOfTextAtSize(qty, 9)
        txt(qty, colXArr[2] + cols[2] / 2 - qtyW / 2, cy + 5, font, 9, rgb(0.4, 0.33, 0.27))

        const up = item.unit_price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const upW = font.widthOfTextAtSize(up, 9)
        txt(up, colXArr[3] + cols[3] - upW - 3, cy + 5, font, 9, rgb(0.35, 0.28, 0.22))

        const amt = item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const amtW = fontB.widthOfTextAtSize(amt, 9)
        txt(amt, colXArr[4] + cols[4] - amtW - 3, cy + 5, fontB, 9)
      }
      ln(ML, cy + rowH, ML + CW, cy + rowH, 0.3, rgb(0.8, 0.75, 0.7))
      cy += rowH
    }

    // Total footer
    ln(ML, cy + 2, ML + CW, cy + 2, 1.5, rgb(0.12, 0.09, 0.07)); cy += 8
    const bahtStr = `รวมทั้งสิ้น (${bahtText(doc.total)})`
    txt(bahtStr, ML, cy, fontB, 9)

    const hasDiscount = (doc.discount_amount ?? 0) > 0
    const hasWht = doc.wht_rate > 0
    let rightCy = cy

    if (hasDiscount) {
      const discLabel = `ส่วนลด${doc.discount_type === "%" ? ` ${doc.discount_value}%` : ""}`
      const dlw = font.widthOfTextAtSize(discLabel, 8)
      txt(discLabel, colXArr[3] + cols[3] - dlw - 3, rightCy, font, 8, rgb(0.4, 0.33, 0.27))
      const sub = doc.subtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })
      const subW = font.widthOfTextAtSize(sub, 8)
      txt(sub, colXArr[4] + cols[4] - subW - 3, rightCy, font, 8, rgb(0.35, 0.28, 0.22)); rightCy += 11
      const da = `-${(doc.discount_amount ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
      const daW = font.widthOfTextAtSize(da, 8)
      txt(da, colXArr[4] + cols[4] - daW - 3, rightCy, font, 8, rgb(0.75, 0.1, 0.1)); rightCy += 11
    }
    if (hasWht) {
      const wl = "หัก ณ ที่จ่าย 3%"
      const wlW = font.widthOfTextAtSize(wl, 8)
      txt(wl, colXArr[3] + cols[3] - wlW - 3, rightCy, font, 8, rgb(0.4, 0.33, 0.27))
      const wa = `-${doc.wht_amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
      const waW = font.widthOfTextAtSize(wa, 8)
      txt(wa, colXArr[4] + cols[4] - waW - 3, rightCy, font, 8, rgb(0.75, 0.1, 0.1)); rightCy += 11
    }
    ln(colXArr[4], rightCy, colXArr[4] + cols[4], rightCy, 0.5, rgb(0.3, 0.23, 0.18)); rightCy += 4
    const totStr = doc.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })
    const totW = fontB.widthOfTextAtSize(totStr, 11)
    txt(totStr, colXArr[4] + cols[4] - totW - 3, rightCy, fontB, 11)
    cy = Math.max(cy, rightCy) + 16

    // ── REMARKS ───────────────────────────────────────────────────────
    const remarkLines = (doc.doc_remarks ?? "").split("\n").filter(Boolean)
    const hasBank = doc.issuer_account_number || doc.issuer_bank_name
    if (remarkLines.length > 0 || doc.payment_terms || hasBank) {
      ln(ML, cy, ML + CW, cy, 0.3, rgb(0.8, 0.75, 0.7)); cy += 8
      if (remarkLines.length > 0) {
        txt("หมายเหตุ :", ML, cy, fontB, 9); cy += 12
        for (const l of remarkLines) { txt(`● ${l}`, ML + 6, cy, font, 8, rgb(0.3, 0.23, 0.18)); cy += 10 }
      }
      if (doc.payment_terms) {
        txt("เงื่อนไขการชำระเงิน :", ML, cy, fontB, 9); cy += 12
        for (const l of doc.payment_terms.split("\n").filter(Boolean)) { txt(`● ${l}`, ML + 6, cy, font, 8, rgb(0.3, 0.23, 0.18)); cy += 10 }
      }
      if (hasBank) {
        txt("ข้อมูลการชำระเงิน :", ML, cy, fontB, 9); cy += 12
        if (doc.issuer_account_name) { txt(`ชื่อบัญชี: ${doc.issuer_account_name}`, ML + 6, cy, font, 8, rgb(0.3, 0.23, 0.18)); cy += 10 }
        const bank = `เลขที่บัญชี: ${doc.issuer_account_number} ธนาคาร ${doc.issuer_bank_name}${doc.issuer_bank_branch ? ` สาขา ${doc.issuer_bank_branch}` : ""}`
        txt(bank, ML + 6, cy, font, 8, rgb(0.3, 0.23, 0.18)); cy += 10
        if (doc.doc_type === "invoice" && doc.issuer_phone) { txt(`เบอร์ติดต่อ ${doc.issuer_phone}`, ML + 6, cy, font, 8, rgb(0.3, 0.23, 0.18)); cy += 10 }
      }
    }
    if (doc.doc_type === "invoice") { txt("ได้รับงานตามรายการข้างต้นไว้โดยถูกต้องและเรียบร้อย", ML, cy, fontB, 9); cy += 12 }

    // ── SIGNATURE ─────────────────────────────────────────────────────
    cy += 8
    const sigW = (CW - 8) / 2
    const sigH = 55
    const leftSigLabel = doc.doc_type === "invoice" ? "ผู้รับงาน" : (doc.doc_type === "quotation" ? "ลูกค้า/ผู้อนุมัติ" : "ผู้จ่ายเงิน")
    const rightSigLabel = doc.doc_type === "invoice" ? "ผู้ส่งงาน" : (doc.doc_type === "quotation" ? "ผู้เสนอราคา" : "ผู้รับเงิน")

    box(ML, cy, sigW, sigH, rgb(1, 1, 1), rgb(0.7, 0.65, 0.6))
    txt(leftSigLabel, ML + 4, cy + 5, fontB, 9)
    ln(ML + 10, cy + 33, ML + sigW - 10, cy + 33, 0.5, rgb(0.4, 0.33, 0.27))
    txt("(........................................................)", ML + 4, cy + 38, font, 8, rgb(0.4, 0.33, 0.27))
    txt("วันที่...... /...... /......", ML + 4, cy + 49, font, 8, rgb(0.4, 0.33, 0.27))

    const rsX = ML + sigW + 8
    box(rsX, cy, sigW, sigH, rgb(1, 1, 1), rgb(0.7, 0.65, 0.6))
    txt(rightSigLabel, rsX + 4, cy + 5, fontB, 9)
    ln(rsX + 10, cy + 33, rsX + sigW - 10, cy + 33, 0.5, rgb(0.4, 0.33, 0.27))
    if (doc.issuer_name) {
      const nameStr = `(${doc.issuer_name})`
      const nameW = font.widthOfTextAtSize(nameStr, 9)
      txt(nameStr, rsX + sigW / 2 - nameW / 2, cy + 38, font, 9, rgb(0.25, 0.18, 0.13))
    }
    const dtStr = `วันที่ ${formatThaiDate(doc.doc_date)}`
    const dtW = font.widthOfTextAtSize(dtStr, 8)
    txt(dtStr, rsX + sigW / 2 - dtW / 2, cy + 49, font, 8, rgb(0.4, 0.33, 0.27))
    cy += sigH

    if (doc.doc_type === "quotation" && (doc.issuer_contact_line || doc.issuer_email)) {
      cy += 10
      const footer = doc.issuer_contact_line
        ? `ยืนยันใบเสนอราคา : โอนเงินและส่ง Line ยืนยันที่ ${doc.issuer_contact_line}`
        : `ยืนยันใบเสนอราคา : โอนเงินและส่งเมลยืนยันที่ ${doc.issuer_email}`
      txt(footer, ML, cy, font, 8, rgb(0.4, 0.33, 0.27))
    }

    const pdfBytes = await pdfDoc.save()
    const filename = buildDocFilename(doc)

    return new Response(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}.pdf`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    return new Response("Failed to generate PDF", { status: 500 })
  }
}
