import { createHmac } from "crypto"

export type LineMessage =
  | { type: "text"; text: string }
  | { type: "flex"; altText: string; contents: object }

export function verifyLineSignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET!
  const digest = createHmac("sha256", secret)
    .update(body)
    .digest("base64")
  return digest === signature
}

export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<void> {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
}

export function buildDocFlex(doc: {
  docType: string
  docNumber: string
  customerName: string
  total: number
  id: string
}): LineMessage {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const printUrl = `${appUrl}/documents/${doc.id}/print`

  const typeLabel =
    doc.docType === "quotation"
      ? "ใบเสนอราคา"
      : doc.docType === "invoice"
      ? "ใบแจ้งหนี้"
      : "ใบเสร็จรับเงิน"

  return {
    type: "flex",
    altText: `${typeLabel} ${doc.docNumber}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: typeLabel,
            weight: "bold",
            size: "sm",
            color: "#ffffff",
          },
        ],
        backgroundColor: "#E06820",
        paddingAll: "12px",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "เลขที่",
                size: "xs",
                color: "#888888",
                flex: 2,
              },
              {
                type: "text",
                text: doc.docNumber,
                size: "xs",
                weight: "bold",
                flex: 3,
                align: "end",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ลูกค้า",
                size: "xs",
                color: "#888888",
                flex: 2,
              },
              {
                type: "text",
                text: doc.customerName,
                size: "xs",
                flex: 3,
                align: "end",
                wrap: true,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ยอดรวม",
                size: "xs",
                color: "#888888",
                flex: 2,
              },
              {
                type: "text",
                text: `฿${doc.total.toLocaleString("th-TH")}`,
                size: "xs",
                weight: "bold",
                color: "#E06820",
                flex: 3,
                align: "end",
              },
            ],
          },
        ],
        paddingAll: "12px",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "ดู / โหลด PDF",
              uri: printUrl,
            },
            style: "primary",
            color: "#E06820",
            height: "sm",
          },
        ],
        paddingAll: "12px",
      },
    },
  }
}
