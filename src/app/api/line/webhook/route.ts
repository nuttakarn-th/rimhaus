import { verifyLineSignature, replyMessage, buildDocFlex } from "@/lib/line-api"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DocType } from "@/lib/types"

export const dynamic = "force-dynamic"

type LineTextEvent = {
  type: "message"
  replyToken: string
  source: { userId: string }
  message: { type: "text"; text: string }
}

type LineEvent = LineTextEvent | { type: string }

async function generateDocNumberAdmin(
  supabase: ReturnType<typeof createAdminClient>,
  docType: DocType
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix =
    docType === "quotation" ? "QT" : docType === "invoice" ? "INV" : "REC"
  const { count } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("doc_type", docType)
    .gte("doc_date", `${year}-01-01`)
    .lte("doc_date", `${year}-12-31`)
  const seq = String((count ?? 0) + 1).padStart(3, "0")
  return `${prefix}-${year}-${seq}`
}

async function handleTextEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: LineTextEvent
) {
  const lineUserId = event.source.userId
  const text = event.message.text.trim()
  const replyToken = event.replyToken

  // Look up linked user account
  const { data: account } = await supabase
    .from("line_accounts")
    .select("user_id")
    .eq("line_user_id", lineUserId)
    .single()

  // ── เชื่อม [TOKEN] ──────────────────────────────────────────────
  const linkMatch = text.match(/^เชื่อม\s+([A-Z0-9]{6})\s*$/i)
  if (linkMatch) {
    const token = linkMatch[1].toUpperCase()
    const now = new Date().toISOString()
    const { data: linkToken } = await supabase
      .from("line_link_tokens")
      .select("id, user_id")
      .eq("token", token)
      .gt("expires_at", now)
      .is("used_at", null)
      .single()

    if (!linkToken) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "❌ Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสร้าง Token ใหม่ในแอป",
        },
      ])
      return
    }

    // Insert line_accounts
    const { error: insertErr } = await supabase
      .from("line_accounts")
      .upsert({ user_id: linkToken.user_id, line_user_id: lineUserId })

    if (insertErr) {
      await replyMessage(replyToken, [
        { type: "text", text: "❌ เกิดข้อผิดพลาดในการเชื่อมบัญชี กรุณาลองใหม่" },
      ])
      return
    }

    // Mark token used
    await supabase
      .from("line_link_tokens")
      .update({ used_at: now })
      .eq("id", linkToken.id)

    await replyMessage(replyToken, [
      {
        type: "text",
        text: "✅ เชื่อมบัญชีสำเร็จ! ตอนนี้คุณสามารถใช้คำสั่งสร้างเอกสารผ่าน LINE ได้แล้ว\n\nพิมพ์ ช่วย เพื่อดูคำสั่งทั้งหมด",
      },
    ])
    return
  }

  // ── Commands requiring a linked account ────────────────────────
  if (!account) {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "⚠️ บัญชีของคุณยังไม่ได้เชื่อมกับ Rimhaus\nกรุณาไปที่ Settings → LINE Bot แล้วสร้าง Token เพื่อเชื่อมบัญชี",
      },
    ])
    return
  }

  const userId = account.user_id

  // ── รายการ ──────────────────────────────────────────────────────
  if (text === "รายการ") {
    const { data: docs } = await supabase
      .from("documents")
      .select("id, doc_type, doc_number, doc_date, customer_name, total")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!docs || docs.length === 0) {
      await replyMessage(replyToken, [
        { type: "text", text: "ยังไม่มีเอกสาร" },
      ])
      return
    }

    const list = docs
      .map((d) => {
        const typeLabel =
          d.doc_type === "quotation"
            ? "QT"
            : d.doc_type === "invoice"
            ? "INV"
            : "REC"
        return `${typeLabel} ${d.doc_number}\n${d.customer_name ?? "-"} | ฿${Number(d.total).toLocaleString("th-TH")}`
      })
      .join("\n\n")

    await replyMessage(replyToken, [
      { type: "text", text: `📄 เอกสาร 5 รายการล่าสุด:\n\n${list}` },
    ])
    return
  }

  // ── Document creation: qt / inv / rec ───────────────────────────
  const docMatch = text.match(/^(qt|inv|rec)\s+(.+?)\s*\|\s*(.+?)\s*\|\s*([\d,]+(?:\.\d+)?)\s*$/i)
  if (docMatch) {
    const typeKey = docMatch[1].toLowerCase()
    const customerName = docMatch[2].trim()
    const itemDesc = docMatch[3].trim()
    const priceStr = docMatch[4].replace(/,/g, "")
    const price = parseFloat(priceStr)

    if (isNaN(price)) {
      await replyMessage(replyToken, [
        { type: "text", text: "❌ ราคาไม่ถูกต้อง" },
      ])
      return
    }

    const docType: DocType =
      typeKey === "qt"
        ? "quotation"
        : typeKey === "inv"
        ? "invoice"
        : "receipt"

    const docNumber = await generateDocNumberAdmin(supabase, docType)
    const docDate = new Date().toISOString().split("T")[0]

    const { data: newDoc, error: docErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        doc_type: docType,
        doc_number: docNumber,
        doc_date: docDate,
        customer_name: customerName,
        status: "sent",
        subtotal: price,
        vat_rate: 0,
        vat_amount: 0,
        wht_rate: 0,
        wht_amount: 0,
        discount_type: "%",
        discount_value: 0,
        discount_amount: 0,
        total: price,
        platforms: [],
      })
      .select()
      .single()

    if (docErr || !newDoc) {
      await replyMessage(replyToken, [
        { type: "text", text: "❌ ไม่สามารถสร้างเอกสารได้ กรุณาลองใหม่" },
      ])
      return
    }

    await supabase.from("document_items").insert({
      document_id: newDoc.id,
      description: itemDesc,
      quantity: 1,
      unit_price: price,
      amount: price,
      sort_order: 0,
    })

    const flex = buildDocFlex({
      docType,
      docNumber,
      customerName,
      total: price,
      id: newDoc.id,
    })

    await replyMessage(replyToken, [flex])
    return
  }

  // ── Help / fallback ─────────────────────────────────────────────
  await replyMessage(replyToken, [
    {
      type: "text",
      text:
        "📋 คำสั่งที่ใช้ได้:\n\n" +
        "• เชื่อม [TOKEN] — เชื่อมบัญชี LINE\n" +
        "• qt [ลูกค้า] | [รายการ] | [ราคา] — สร้างใบเสนอราคา\n" +
        "• inv [ลูกค้า] | [รายการ] | [ราคา] — สร้างใบแจ้งหนี้\n" +
        "• rec [ลูกค้า] | [รายการ] | [ราคา] — สร้างใบเสร็จ\n" +
        "• รายการ — ดู 5 เอกสารล่าสุด\n\n" +
        "ตัวอย่าง: qt บริษัท ABC | งานถ่ายภาพ | 5000",
    },
  ])
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-line-signature") ?? ""

    if (!verifyLineSignature(body, signature)) {
      return new Response("Unauthorized", { status: 401 })
    }

    const payload = JSON.parse(body) as { events: LineEvent[] }
    const supabase = createAdminClient()

    for (const event of payload.events) {
      if (
        event.type === "message" &&
        "message" in event &&
        event.message.type === "text"
      ) {
        await handleTextEvent(supabase, event as LineTextEvent)
      }
    }
  } catch {
    // Always return 200 to LINE
  }

  return new Response("OK", { status: 200 })
}
