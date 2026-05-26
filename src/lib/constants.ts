import type { JobStatus, PaymentStatus, DealType, ReviewType, ContentStatus, ContentPillar, PostStatus, RateCardCategory, DocType, DocStatus } from "./types"

export const RATE_CARD_CATEGORY_LABELS: Record<RateCardCategory, string> = {
  per_platform: "ต่อแพลตฟอร์ม",
  bundle: "เหมาทุกแพลตฟอร์ม",
  addon: "เพิ่มเติม",
  barter: "ระบบ Barter",
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  accepted: "รับงาน",
  in_progress: "กำลังทำ",
  content_done: "ทำคอนเทนต์เสร็จ",
  posted: "โพสแล้ว",
  closed: "ปิดงาน",
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  accepted: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  content_done: "bg-purple-100 text-purple-800",
  posted: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "รอรับเงิน",
  invoiced: "ออกบิลแล้ว",
  received: "รับเงินแล้ว",
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-red-100 text-red-700",
  invoiced: "bg-yellow-100 text-yellow-700",
  received: "bg-green-100 text-green-700",
}

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  paid: "รับจ้าง (มีค่าตอบแทน)",
  barter_inbound: "Barter — ลูกค้าเสนอ",
  barter_outbound: "Barter — ขอเอง",
}

export const DEAL_TYPE_COLORS: Record<DealType, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  barter_inbound: "bg-violet-100 text-violet-800",
  barter_outbound: "bg-sky-100 text-sky-800",
}

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  short_video: "คลิปสั้น",
  photo: "รูปภาพ",
  long_video: "คลิปยาว",
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "ไอเดีย",
  scripting: "เขียนสคริปต์",
  shooting: "ถ่ายทำ",
  editing: "ตัดต่อ",
  ready: "พร้อมโพส",
  posted: "โพสแล้ว",
  cancelled: "ยกเลิก",
}

export const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
  idea: "bg-sky-100 text-sky-700",
  scripting: "bg-violet-100 text-violet-700",
  shooting: "bg-orange-100 text-orange-700",
  editing: "bg-pink-100 text-pink-700",
  ready: "bg-teal-100 text-teal-700",
  posted: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
}

export const CONTENT_PILLAR_LABELS: Record<ContentPillar, string> = {
  room_corner: "🏠 มุมบ้าน",
  product_review: "⭐ รีวิวสินค้า",
  organization_tips: "📌 ทริคจัดบ้าน",
  home_humor: "😅 มุขแต่งบ้าน",
}

export const CONTENT_PILLAR_COLORS: Record<ContentPillar, string> = {
  room_corner: "bg-sky-100 text-sky-700",
  product_review: "bg-amber-100 text-amber-700",
  organization_tips: "bg-teal-100 text-teal-700",
  home_humor: "bg-pink-100 text-pink-700",
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "ร่าง",
  scheduled: "กำหนดเวลา",
  posted: "โพสแล้ว",
  archived: "เก็บเข้าคลัง",
}

export const PRODUCT_CATEGORIES = [
  "เฟอร์นิเจอร์",
  "ของตกแต่งบ้าน",
  "ผ้าและสิ่งทอ",
  "โคมไฟ",
  "เครื่องครัว",
  "ห้องน้ำ",
  "สวนและระเบียง",
  "อิเล็กทรอนิกส์",
  "อื่นๆ",
]

export const INCOME_CATEGORIES = [
  "ค่ารีวิว",
  "ค่าโฆษณา",
  "คอมมิชชั่น",
  "ค่า Affiliate",
  "อื่นๆ",
]

export const EXPENSE_CATEGORIES = [
  "อุปกรณ์ถ่ายทำ",
  "ค่าเดินทาง",
  "ซื้อสินค้า",
  "ซอฟต์แวร์/แอป",
  "ค่าอินเทอร์เน็ต",
  "อื่นๆ",
]

export const PAYMENT_METHODS = [
  "โอนเงิน",
  "เงินสด",
  "PromptPay",
  "บัตรเครดิต",
  "อื่นๆ",
]

export const CONTENT_TYPES = [
  { value: "short_video", label: "คลิปสั้น" },
  { value: "photo", label: "รูปภาพ" },
  { value: "long_video", label: "คลิปยาว" },
  { value: "story", label: "สตอรี่" },
  { value: "reel", label: "รีล" },
  { value: "blog", label: "บล็อก" },
]

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  quotation: "ใบเสนอราคา",
  invoice: "ใบแจ้งหนี้",
  receipt: "ใบเสร็จรับเงิน",
}

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  draft: "ร่าง",
  sent: "ส่งแล้ว",
  paid: "ชำระแล้ว",
  cancelled: "ยกเลิก",
}

export const DOC_STATUS_COLORS: Record<DocStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
}

export const JOB_STATUSES: JobStatus[] = [
  "accepted",
  "in_progress",
  "content_done",
  "posted",
  "closed",
]
