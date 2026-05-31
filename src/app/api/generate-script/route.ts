import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const PILLAR_LABELS: Record<string, string> = {
  room_corner: "มุมบ้าน (รีวิวมุมต่างๆ เช่น ห้องนอน ครัว สวน ระเบียง ห้องน้ำ)",
  product_review: "รีวิวสินค้า (เฟอร์นิเจอร์ อุปกรณ์ทำความสะอาด ของใช้ในบ้าน)",
  organization_tips: "ทริคจัดบ้าน (DIY ง่ายๆ จัดของ organization tips ไอเดียประหยัดงบ)",
  home_humor: "มุขแต่งบ้าน (อารมณ์ขัน เรื่องจริงชีวิตคนแต่งบ้าน relatable)",
}

const STYLE_LABELS: Record<string, string> = {
  humor: "ตลก/มุขขำ — ใช้อารมณ์ขันติดดิน เล่นกับความขี้เกียจหรือปัญหาชีวิตจริง",
  review: "รีวิวตรงๆ — บอกทั้งข้อดีและข้อเสีย ตรงไปตรงมา จากประสบการณ์ใช้จริง",
  before_after: "Before & After — เล่าเปรียบเทียบก่อน-หลัง ดราม่านิดหน่อย",
  howto: "How-to / DIY — สอนขั้นตอนแบบเพื่อนสอนเพื่อน ไม่ยุ่งยาก",
}

const DURATION_LABELS: Record<string, string> = {
  short: "สั้น ~15-30 วินาที (≈30-50 คำ)",
  medium: "กลาง ~30-60 วินาที (≈80-130 คำ)",
  long: "ยาว ~1-2 นาที (≈150-220 คำ)",
}

const SYSTEM_PROMPT = `คุณคือนักเขียน script voiceover ประจำเพจ "เมื่อไหร่บ้านจะเสร็จ?" เพจแต่งบ้านที่มีสไตล์อารมณ์ขัน เป็นกันเอง เล่าเหมือนเพื่อนมาเล่าให้ฟัง ไม่ใช่นักการตลาด

## กฎสำคัญ
- ห้ามเริ่มด้วย "สวัสดีครับ/ค่ะ" หรือแนะนำตัว
- ห้ามใช้ภาษาโฆษณา: "นำเสนอ", "ประสิทธิภาพ", "เหมาะสำหรับ", "ผู้ชม", "คุณผู้ชม"
- ใช้ "ทุกคน" ไม่ใช่ "ผู้ชม"
- ใช้ประโยคสั้น ตัดฉับ
- แปลง spec เป็นภาษาคนทั่วไป เช่น "IP67" → "ตกน้ำก็ไม่พัง"

## โครงสร้าง 4 ส่วน
1. 🪝 Hook (3 วิแรก) — ดึงความสนใจทันที อย่าเริ่มธรรมดา
2. 📖 Story / Pain Point — เล่าประสบการณ์จริง ให้คนอิน
3. 💡 Solution — นำเสนอสิ่งที่มาแก้ปัญหา เลือก 2-3 จุดเด่น
4. 📣 CTA — ปิดด้วยความรู้สึกจริงๆ + คำถามปลายเปิดชวนคอมเมนต์

## Output format
ให้ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่นนอกจาก JSON:
{
  "hook": "...",
  "story": "...",
  "solution": "...",
  "cta": "...",
  "full_script": "..."
}

full_script คือ script รวมทุกส่วน พร้อมพูดได้เลย`

export async function POST(request: Request) {
  try {
    const { pillar, product, style, duration } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const userPrompt = `เขียน script voiceover สำหรับ:
- หมวดหมู่: ${PILLAR_LABELS[pillar] ?? pillar}
- สินค้า/เนื้อหา: ${product}
- สไตล์: ${STYLE_LABELS[style] ?? style}
- ความยาว: ${DURATION_LABELS[duration] ?? duration}

เขียน script ตามโครงสร้าง 4 ส่วน ให้พอดีกับความยาวที่กำหนด`

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""

    let parsed: Record<string, string>
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { full_script: raw }
    } catch {
      parsed = { full_script: raw }
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error("generate-script error:", err)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
