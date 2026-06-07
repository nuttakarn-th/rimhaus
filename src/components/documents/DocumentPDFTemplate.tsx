import {
  Document, Page, View, Text, Image, StyleSheet,
} from "@react-pdf/renderer"
import { bahtText } from "@/lib/utils"
import type { Document as Doc } from "@/lib/types"

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok",
  youtube: "YouTube", lemon8: "Lemon8", shopee: "Shopee",
}
const DOC_TITLE: Record<string, string> = {
  quotation: "ใบเสนอราคา",
  invoice: "ใบส่งมอบงาน/ใบแจ้งหนี้",
  receipt: "ใบเสร็จรับเงิน",
}
const TITLE_COLOR: Record<string, string> = {
  quotation: "#D97706", invoice: "#2563EB", receipt: "#16A34A",
}
const CUSTOMER_LABEL: Record<string, string> = {
  quotation: "เสนอ", invoice: "ATTN:", receipt: "ได้รับเงินจาก",
}
const SIG_LEFT: Record<string, string> = {
  quotation: "ลูกค้า/ผู้อนุมัติ", invoice: "ผู้รับงาน", receipt: "ผู้จ่ายเงิน",
}
const SIG_RIGHT: Record<string, string> = {
  quotation: "ผู้เสนอราคา", invoice: "ผู้ส่งงาน", receipt: "ผู้รับเงิน",
}

function formatThaiDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric", month: "numeric", day: "numeric",
  })
}
function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const S = StyleSheet.create({
  page: {
    fontFamily: "NotoSansThai",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    color: "#1c1917",
    backgroundColor: "#ffffff",
  },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },

  issuerName: { fontSize: 11, fontWeight: "bold" },
  issuerDetail: { color: "#57534e", fontSize: 8, marginTop: 2 },
  headerRight: { alignItems: "flex-end", minWidth: 170 },
  docTitle: { fontSize: 19, fontWeight: "bold", marginBottom: 6 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 3 },
  metaLabel: { color: "#78716c", width: 28 },
  metaValue: { fontWeight: "bold", textDecoration: "underline", width: 120, textAlign: "right" },

  divider: { marginTop: 10, marginBottom: 10, borderBottom: "0.5pt solid #d4cdc4" },

  custRow: { flexDirection: "row", marginTop: 3 },
  custLabel: { fontWeight: "bold", width: 40, flexShrink: 0 },
  custValue: { flex: 1, fontWeight: "bold" },
  custDetail: { color: "#57534e", fontSize: 8 },

  tHead: {
    flexDirection: "row",
    backgroundColor: "#292524",
    color: "white",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #e7e1d8",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tFoot: {
    flexDirection: "row",
    borderTop: "1.5pt solid #292524",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  cNo: { width: 24, textAlign: "center", fontSize: 8 },
  cDesc: { flex: 1 },
  cQty: { width: 28, textAlign: "center", fontSize: 8 },
  cPrice: { width: 72, textAlign: "right", color: "#57534e" },
  cAmount: { width: 72, textAlign: "right" },
  thText: { fontSize: 8, fontWeight: "bold" },

  secTitle: { fontWeight: "bold", marginTop: 8, marginBottom: 2 },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bullet: { width: 12 },
  bulletText: { flex: 1, color: "#44403c" },

  sigRow: { flexDirection: "row", marginTop: 20 },
  sigBox: { flex: 1, border: "0.5pt solid #c9bfb3", borderRadius: 3, padding: 10, minHeight: 90 },
  sigBoxLeft: { marginRight: 8 },
  sigLabel: { fontWeight: "bold", fontSize: 9, marginBottom: 6 },
  sigLine: { borderBottom: "0.5pt solid #57534e", marginTop: 16, marginBottom: 4, marginHorizontal: 8 },
  sigName: { color: "#44403c", fontSize: 8, textAlign: "center" },
  sigDate: { color: "#78716c", fontSize: 8, textAlign: "center", marginTop: 2 },
  footerNote: { marginTop: 8, fontSize: 8, color: "#78716c" },
  logoImage: { maxHeight: 52, maxWidth: 190, marginBottom: 4 },
  sigImage: { maxHeight: 34, maxWidth: 120, marginTop: 4, marginBottom: 4, alignSelf: "center" },
})

export function DocumentPDFTemplate({ doc }: { doc: Doc }) {
  const titleColor = TITLE_COLOR[doc.doc_type] ?? "#D97706"
  const title = DOC_TITLE[doc.doc_type] ?? doc.doc_type
  const isInvoice = doc.doc_type === "invoice"
  const isQuotation = doc.doc_type === "quotation"
  const remarkLines = (doc.doc_remarks ?? "").split("\n").filter(Boolean)
  const paymentLines = (doc.payment_terms ?? "").split("\n").filter(Boolean)
  const hasBank = !!(doc.issuer_account_number || doc.issuer_bank_name)
  const isReceipt = doc.doc_type === "receipt"
  const hasDiscount = (doc.discount_amount ?? 0) > 0
  const hasWht = doc.wht_rate > 0
  const isGrossup = doc.wht_rate < 0
  const afterDiscount = doc.subtotal - (doc.discount_amount ?? 0)
  const netTotal = isGrossup ? doc.total - doc.wht_amount : doc.total
  const displayTotal = isGrossup && isQuotation ? doc.total : netTotal
  const platformStr = (doc.platforms ?? []).map(p => PLATFORM_LABELS[p] ?? p).join(", ")

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.row}>
          <View style={S.flex1}>
            {doc.issuer_header_image_url && (
              <Image src={doc.issuer_header_image_url} style={S.logoImage} />
            )}
            {doc.issuer_name && <Text style={S.issuerName}>{doc.issuer_name}</Text>}
            {doc.issuer_address && <Text style={S.issuerDetail}>{doc.issuer_address}</Text>}
            {(doc.issuer_phone || doc.issuer_email) && (
              <Text style={S.issuerDetail}>
                {[
                  doc.issuer_phone && `เบอร์โทรศัพท์ ${doc.issuer_phone}`,
                  doc.issuer_email && `อีเมล ${doc.issuer_email}`,
                ].filter(Boolean).join("  ")}
              </Text>
            )}
            {doc.issuer_id_card && (
              <Text style={S.issuerDetail}>เลขที่บัตรประชาชน {doc.issuer_id_card}</Text>
            )}
          </View>
          <View style={S.headerRight}>
            <Text style={[S.docTitle, { color: titleColor }]}>{title}</Text>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>เลขที่</Text>
              <Text style={S.metaValue}>{doc.doc_number}</Text>
            </View>
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>วันที่</Text>
              <Text style={S.metaValue}>{formatThaiDate(doc.doc_date)}</Text>
            </View>
          </View>
        </View>

        <View style={S.divider} />

        {/* Customer */}
        <View style={{ marginBottom: 12 }}>
          <View style={S.custRow}>
            <Text style={S.custLabel}>{CUSTOMER_LABEL[doc.doc_type] ?? "เสนอ"}</Text>
            <Text style={S.custValue}>{doc.customer_name ?? "—"}</Text>
          </View>
          {doc.customer_address && (
            <View style={S.custRow}>
              <Text style={S.custLabel}>ที่อยู่</Text>
              <Text style={[S.custDetail, S.flex1]}>{doc.customer_address}</Text>
            </View>
          )}
          {doc.customer_tax_id && (
            <View style={S.custRow}>
              <Text style={[S.custLabel, { width: 70, fontSize: 8 }]}>เลขประจำตัวผู้เสียภาษี</Text>
              <Text style={S.custDetail}>{doc.customer_tax_id}</Text>
            </View>
          )}
        </View>

        {/* Platform */}
        {platformStr ? (
          <View style={[S.row, { marginBottom: 10 }]}>
            <Text style={[S.custLabel, { width: 50 }]}>Platform</Text>
            <Text style={{ color: "#57534e" }}>{platformStr}</Text>
          </View>
        ) : null}

        {/* Table */}
        <View style={S.tHead}>
          <Text style={[S.cNo, S.thText]}>ลำดับ</Text>
          <Text style={[S.cDesc, S.thText]}>รายการ</Text>
          <Text style={[S.cQty, S.thText]}>หน่วย</Text>
          <Text style={[S.cPrice, S.thText]}>ราคาต่อหน่วย</Text>
          <Text style={[S.cAmount, S.thText]}>จำนวนเงิน</Text>
        </View>
        {doc.document_items?.map((item, i) => (
          <View key={item.id} style={S.tRow} wrap={false}>
            <Text style={[S.cNo, { color: "#78716c" }]}>{i + 1}</Text>
            <Text style={S.cDesc}>{item.description}</Text>
            <Text style={[S.cQty, { color: "#78716c" }]}>{item.quantity}</Text>
            <Text style={S.cPrice}>{fmt(item.unit_price)}</Text>
            <Text style={[S.cAmount, { fontWeight: "bold" }]}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={S.tFoot}>
          <View style={[S.flex1, { flexDirection: "row", alignItems: "flex-end" }]}>
            <Text style={{ fontWeight: "bold" }}>รวมทั้งสิ้น</Text>
            <Text style={{ color: "#78716c", fontSize: 8, marginLeft: 4 }}>({bahtText(displayTotal)})</Text>
          </View>
          {(isInvoice || isReceipt) ? (
            <View style={{ minWidth: 160, borderLeft: "0.5pt solid #d6cfc7" }}>
              {/* รวม */}
              <View style={{ flexDirection: "row", borderBottom: "0.5pt solid #e5ddd5", paddingVertical: 2, paddingHorizontal: 5 }}>
                <Text style={{ flex: 1, fontSize: 8, color: "#78716c" }}>รวม</Text>
                <Text style={{ fontSize: 8, color: "#57534e" }}>{fmt(doc.subtotal)}</Text>
              </View>
              {/* ส่วนลด */}
              {hasDiscount && (
                <View style={{ flexDirection: "row", borderBottom: "0.5pt solid #e5ddd5", paddingVertical: 2, paddingHorizontal: 5 }}>
                  <Text style={{ flex: 1, fontSize: 8, color: "#78716c" }}>{`ส่วนลด${doc.discount_type === "%" ? ` ${doc.discount_value}%` : ""}`}</Text>
                  <Text style={{ fontSize: 8, color: "#dc2626" }}>-{fmt(doc.discount_amount)}</Text>
                </View>
              )}
              {/* ราคาหลังหักส่วนลด */}
              {hasDiscount && (
                <View style={{ flexDirection: "row", borderBottom: "0.5pt solid #e5ddd5", paddingVertical: 2, paddingHorizontal: 5 }}>
                  <Text style={{ flex: 1, fontSize: 8, color: "#78716c" }}>ราคาหลังหักส่วนลด</Text>
                  <Text style={{ fontSize: 8, color: "#57534e" }}>{fmt(afterDiscount)}</Text>
                </View>
              )}
              {/* หักภาษี ณ ที่จ่าย 3% */}
              {(hasWht || isGrossup) && (
                <View style={{ flexDirection: "row", borderBottom: "0.5pt solid #e5ddd5", paddingVertical: 2, paddingHorizontal: 5 }}>
                  <Text style={{ flex: 1, fontSize: 8, color: "#78716c" }}>หักภาษี ณ ที่จ่าย 3%</Text>
                  <Text style={{ fontSize: 8, color: "#57534e" }}>{fmt(doc.wht_amount)}</Text>
                </View>
              )}
              {/* จำนวนเงินทั้งสิ้น */}
              <View style={{ flexDirection: "row", backgroundColor: "#bae6fd", paddingVertical: 3, paddingHorizontal: 5 }}>
                <Text style={{ flex: 1, fontSize: 9, fontWeight: "bold" }}>จำนวนเงินทั้งสิ้น</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>{fmt(displayTotal)}</Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "flex-end" }}>
              {hasDiscount && (
                <>
                  <Text style={{ fontSize: 8, color: "#78716c" }}>
                    {`ส่วนลด${doc.discount_type === "%" ? ` ${doc.discount_value}%` : ""}`}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#57534e" }}>{fmt(doc.subtotal)}</Text>
                  <Text style={{ fontSize: 8, color: "#dc2626" }}>-{fmt(doc.discount_amount)}</Text>
                </>
              )}
              {hasWht && (
                <>
                  <Text style={{ fontSize: 8, color: "#78716c" }}>หัก ณ ที่จ่าย 3%</Text>
                  <Text style={{ fontSize: 8, color: "#dc2626" }}>-{fmt(doc.wht_amount)}</Text>
                </>
              )}
              <View style={{ borderTop: "1pt solid #292524", marginTop: 4, paddingTop: 3 }}>
                <Text style={{ fontWeight: "bold", fontSize: 12, textAlign: "right" }}>{fmt(displayTotal)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Remarks / Payment / Bank */}
        {(remarkLines.length > 0 || paymentLines.length > 0 || hasBank) && (
          <View style={{ marginTop: 10, fontSize: 9 }}>
            {remarkLines.length > 0 && (
              <View>
                <Text style={S.secTitle}>หมายเหตุ :</Text>
                {remarkLines.map((line, i) => (
                  <View key={i} style={S.bulletRow}>
                    <Text style={S.bullet}>●</Text>
                    <Text style={S.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            )}
            {paymentLines.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={S.secTitle}>เงื่อนไขการชำระเงิน :</Text>
                {paymentLines.map((line, i) => (
                  <View key={i} style={S.bulletRow}>
                    <Text style={S.bullet}>●</Text>
                    <Text style={S.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            )}
            {hasBank && (
              <View style={{ marginTop: 6 }}>
                <Text style={S.secTitle}>ข้อมูลการชำระเงิน :</Text>
                {doc.issuer_account_name && (
                  <Text style={S.bulletText}>ชื่อบัญชี: {doc.issuer_account_name}</Text>
                )}
                <Text style={S.bulletText}>
                  {`เลขที่บัญชี: ${doc.issuer_account_number ?? ""} ธนาคาร ${doc.issuer_bank_name ?? ""}${doc.issuer_bank_branch ? ` สาขา ${doc.issuer_bank_branch}` : ""}`}
                </Text>
                {isInvoice && doc.issuer_phone && (
                  <Text style={S.bulletText}>เบอร์ติดต่อ {doc.issuer_phone}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {isInvoice && (
          <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 9 }}>
            ได้รับงานตามรายการข้างต้นไว้โดยถูกต้องและเรียบร้อย
          </Text>
        )}

        {/* Signatures */}
        <View style={S.sigRow}>
          <View style={[S.sigBox, S.sigBoxLeft]}>
            <Text style={S.sigLabel}>{SIG_LEFT[doc.doc_type]}</Text>
            <View style={S.sigLine} />
            <Text style={S.sigName}>(........................................................)</Text>
            <Text style={S.sigDate}>วันที่...... /...... /......</Text>
          </View>
          <View style={S.sigBox}>
            <Text style={S.sigLabel}>{SIG_RIGHT[doc.doc_type]}</Text>
            {doc.issuer_signature_url && (
              <Image src={doc.issuer_signature_url} style={S.sigImage} />
            )}
            <View style={S.sigLine} />
            <Text style={S.sigName}>({doc.issuer_name ?? ""})</Text>
            <Text style={S.sigDate}>วันที่ {formatThaiDate(doc.doc_date)}</Text>
          </View>
        </View>

        {isQuotation && (doc.issuer_contact_line || doc.issuer_email) && (
          <Text style={S.footerNote}>
            {doc.issuer_contact_line
              ? `ยืนยันใบเสนอราคา : โอนเงินและส่ง Line ยืนยันที่ ${doc.issuer_contact_line}`
              : `ยืนยันใบเสนอราคา : โอนเงินและส่งเมลยืนยันที่ ${doc.issuer_email ?? ""}`}
          </Text>
        )}

      </Page>
    </Document>
  )
}

export function getDocFilename(doc: Pick<Doc, "doc_type" | "doc_number" | "doc_date" | "customer_name">): string {
  const typeLabel: Record<string, string> = {
    quotation: "ใบเสนอราคา", invoice: "ใบส่งมอบงาน", receipt: "ใบเสร็จ",
  }
  const run = doc.doc_number.split("-").pop() ?? ""
  const d = new Date(doc.doc_date)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)
  const cust = (doc.customer_name ?? "").replace(/\s+/g, "")
  return `${typeLabel[doc.doc_type] ?? doc.doc_type}${run}_${cust}_${dd}${mm}${yy}.pdf`
}
