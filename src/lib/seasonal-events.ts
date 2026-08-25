export interface SeasonalEvent {
  id: string
  name: string
  emoji: string
  month: number   // 1-12; 0 = every month
  day: number
  endDay?: number
  type: "sale" | "holiday" | "payday"
  colorClass: string
  tips: string[]
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "payday",
    name: "Payday Week 💰",
    emoji: "💰",
    month: 0,
    day: 25,
    endDay: 31,
    type: "payday",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    tips: ["โพสสินค้าคุ้มค่า", "Affiliate ของใช้บ้าน", "รีวิวช่วง Sale"],
  },
  {
    id: "new_year",
    name: "New Year",
    emoji: "🎉",
    month: 1,
    day: 1,
    type: "holiday",
    colorClass: "bg-purple-100 text-purple-800 border-purple-300",
    tips: ["ของแต่งบ้านรับปีใหม่", "แพ็กเกจ Wish List"],
  },
  {
    id: "valentine",
    name: "Valentine's Day",
    emoji: "❤️",
    month: 2,
    day: 14,
    type: "holiday",
    colorClass: "bg-pink-100 text-pink-800 border-pink-300",
    tips: ["Gift guide ของขวัญ", "ของตกแต่งห้องโรแมนติก"],
  },
  {
    id: "sale_44",
    name: "4.4 Sale",
    emoji: "🛍️",
    month: 4,
    day: 4,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate ของบ้าน", "รีวิวสินค้าช่วง Sale"],
  },
  {
    id: "songkran",
    name: "สงกรานต์",
    emoji: "💦",
    month: 4,
    day: 13,
    endDay: 15,
    type: "holiday",
    colorClass: "bg-blue-100 text-blue-800 border-blue-300",
    tips: ["ของแต่งบ้านซัมเมอร์", "รีวิวสินค้า Outdoor"],
  },
  {
    id: "sale_55",
    name: "5.5 Sale",
    emoji: "🛍️",
    month: 5,
    day: 5,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate สินค้าบ้าน", "โพสช่วง Sale"],
  },
  {
    id: "midyear_sale",
    name: "Mid-Year Sale",
    emoji: "🔥",
    month: 6,
    day: 15,
    endDay: 30,
    type: "sale",
    colorClass: "bg-red-100 text-red-800 border-red-300",
    tips: ["รวมของลดราคา", "Before/After ปรับบ้าน"],
  },
  {
    id: "sale_77",
    name: "7.7 Sale",
    emoji: "🛍️",
    month: 7,
    day: 7,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate ของบ้าน", "โพสสินค้าลดราคา"],
  },
  {
    id: "sale_88",
    name: "8.8 Sale",
    emoji: "🛍️",
    month: 8,
    day: 8,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate ของบ้าน", "รีวิวสินค้าช่วง Sale"],
  },
  {
    id: "mothers_day",
    name: "วันแม่",
    emoji: "🌸",
    month: 8,
    day: 12,
    type: "holiday",
    colorClass: "bg-pink-100 text-pink-800 border-pink-300",
    tips: ["Gift guide วันแม่", "ของแต่งบ้านของขวัญ"],
  },
  {
    id: "sale_99",
    name: "9.9 Sale",
    emoji: "🛍️",
    month: 9,
    day: 9,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate ของบ้าน", "โพสสินค้า Shopee/Lazada"],
  },
  {
    id: "sale_1010",
    name: "10.10 Sale",
    emoji: "🛍️",
    month: 10,
    day: 10,
    type: "sale",
    colorClass: "bg-orange-100 text-orange-800 border-orange-300",
    tips: ["Affiliate ของบ้าน", "โพสช่วง Sale ใหญ่"],
  },
  {
    id: "sale_1111",
    name: "11.11 Sale",
    emoji: "🔥",
    month: 11,
    day: 11,
    type: "sale",
    colorClass: "bg-red-100 text-red-800 border-red-300",
    tips: ["Mega Sale Affiliate", "รวมของที่ซื้อดี", "รีวิวล่วงหน้า 1 สัปดาห์"],
  },
  {
    id: "sale_1212",
    name: "12.12 Sale",
    emoji: "🔥",
    month: 12,
    day: 12,
    type: "sale",
    colorClass: "bg-red-100 text-red-800 border-red-300",
    tips: ["Mega Sale Affiliate", "ของขวัญปีใหม่", "สรุปของดีปีนี้"],
  },
  {
    id: "fathers_day",
    name: "วันพ่อ",
    emoji: "👑",
    month: 12,
    day: 5,
    type: "holiday",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-300",
    tips: ["Gift guide วันพ่อ", "ของแต่งบ้านของขวัญ"],
  },
  {
    id: "xmas",
    name: "Christmas",
    emoji: "🎄",
    month: 12,
    day: 24,
    endDay: 26,
    type: "holiday",
    colorClass: "bg-green-100 text-green-800 border-green-300",
    tips: ["ของตกแต่งบ้านคริสต์มาส", "Gift guide"],
  },
  {
    id: "new_year_eve",
    name: "New Year Eve",
    emoji: "🎆",
    month: 12,
    day: 31,
    type: "holiday",
    colorClass: "bg-purple-100 text-purple-800 border-purple-300",
    tips: ["สรุปปีที่ผ่านมา", "Wish List ปีใหม่"],
  },
]

export function getEventsForDate(month: number, day: number): SeasonalEvent[] {
  return SEASONAL_EVENTS.filter(e => {
    if (e.month !== 0 && e.month !== month) return false
    const end = e.endDay ?? e.day
    return day >= e.day && day <= end
  })
}

export function getUpcomingEvents(daysAhead = 7): Array<{ event: SeasonalEvent; date: Date }> {
  const today = new Date()
  const seen = new Set<string>()
  const results: Array<{ event: SeasonalEvent; date: Date }> = []
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    const m = d.getMonth() + 1
    const day = d.getDate()
    for (const ev of getEventsForDate(m, day)) {
      if (!seen.has(ev.id)) {
        seen.add(ev.id)
        results.push({ event: ev, date: d })
      }
    }
  }
  return results
}

export const CONTENT_CATEGORIES = {
  review:        { label: "รีวิวสินค้า",       emoji: "⭐", color: "bg-orange-100 text-orange-800" },
  repurpose:     { label: "Repurpose",          emoji: "🔄", color: "bg-blue-100 text-blue-800" },
  affiliate:     { label: "Affiliate",          emoji: "🔗", color: "bg-green-100 text-green-800" },
  everyday_pick: { label: "ของที่ใช้จริง",     emoji: "❤️", color: "bg-pink-100 text-pink-800" },
  inspire:       { label: "Inspiration",        emoji: "✨", color: "bg-purple-100 text-purple-800" },
  before_after:  { label: "Before & After",     emoji: "🏠", color: "bg-teal-100 text-teal-800" },
  diy:           { label: "DIY/How-to",         emoji: "🔨", color: "bg-amber-100 text-amber-800" },
  seasonal_sell: { label: "ช่วง Sale",          emoji: "🛍️", color: "bg-red-100 text-red-800" },
  haul:          { label: "Haul/Unboxing",      emoji: "📦", color: "bg-indigo-100 text-indigo-800" },
  followup:      { label: "30-day Follow-up",   emoji: "📅", color: "bg-slate-100 text-slate-800" },
  trend:         { label: "ตอบ Trend",          emoji: "🔥", color: "bg-rose-100 text-rose-800" },
  connect:       { label: "Connect/Q&A",        emoji: "💬", color: "bg-cyan-100 text-cyan-800" },
} as const

export type ContentCategoryKey = keyof typeof CONTENT_CATEGORIES

export const CONTENT_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  photo:       { label: "ภาพ",        emoji: "📸" },
  short_video: { label: "VDO สั้น",  emoji: "🎬" },
  long_video:  { label: "VDO ยาว",   emoji: "🎥" },
  reel:        { label: "Reel",       emoji: "▶️" },
  story:       { label: "Story",      emoji: "⭕" },
  blog:        { label: "บทความ",     emoji: "📝" },
}

export const DAY_SUGGESTIONS: Record<number, { label: string; color: string }> = {
  1: { label: "💡 Value/สอน",          color: "text-blue-600" },
  2: { label: "💡 Value/สอน",          color: "text-blue-600" },
  3: { label: "⭐ Review/Repurpose",    color: "text-orange-600" },
  4: { label: "🔗 Affiliate/Picks",    color: "text-green-600" },
  5: { label: "🛍️ Sell/Payday",        color: "text-red-600" },
  6: { label: "🛍️ Affiliate/Sell",     color: "text-red-600" },
  0: { label: "💬 Connect/Q&A",        color: "text-purple-600" },
}
