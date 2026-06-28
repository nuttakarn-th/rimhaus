export const AI_STYLES = [
  { key: "mid_century", label: "Mid-Century Modern", emoji: "🪑", prompt: "mid-century modern interior, warm walnut wood, clean lines, organic shapes, earth tones, retro chic" },
  { key: "japandi", label: "Japandi", emoji: "🌿", prompt: "japandi interior design, minimalist, wabi-sabi, natural materials, neutral beige and white, calm serene" },
  { key: "minimal", label: "Minimal", emoji: "◻️", prompt: "minimalist interior design, white walls, simple clean furniture, uncluttered, breathing space, modern" },
  { key: "cozy", label: "Cozy / Hygge", emoji: "🕯️", prompt: "cozy hygge interior, warm lighting, soft textiles, candles, comfortable plush furniture, warm amber tones" },
  { key: "industrial", label: "Industrial", emoji: "⚙️", prompt: "industrial interior design, exposed brick, metal elements, Edison bulbs, reclaimed dark wood, urban loft" },
  { key: "vintage", label: "Vintage", emoji: "🎞️", prompt: "vintage retro interior, antique furniture, warm patina, nostalgic decor, floral accents, classic charm" },
  { key: "nature", label: "Nature / Biophilic", emoji: "🪴", prompt: "biophilic interior design, lush indoor plants, natural wood, rattan furniture, earthy green and brown tones" },
] as const

export const AI_ROOM_TYPES = [
  { key: "coffee_corner", label: "มุมกาแฟ", emoji: "☕" },
  { key: "bedroom", label: "ห้องนอน", emoji: "🛏️" },
  { key: "garden_corner", label: "มุมสวน", emoji: "🌱" },
  { key: "kitchen", label: "ครัว", emoji: "🍳" },
  { key: "living_room", label: "ห้องรับแขก", emoji: "🛋️" },
  { key: "work_corner", label: "มุมทำงาน", emoji: "💻" },
  { key: "laundry_corner", label: "มุมซักล้าง", emoji: "🧺" },
] as const

export const AI_VIBES = [
  { key: "bright", label: "สว่างโปร่ง", prompt: "bright airy natural lighting, light colors, open space" },
  { key: "warm", label: "อบอุ่น", prompt: "warm golden hour lighting, cozy warm color palette" },
  { key: "luxury", label: "เรียบหรู", prompt: "luxurious elegant sophisticated atmosphere, premium materials" },
  { key: "relaxed", label: "สบายๆ", prompt: "relaxed casual comfortable atmosphere, laid-back" },
] as const

export const AI_PRODUCT_CATEGORIES = [
  "โซฟา", "เก้าอี้", "โต๊ะ", "ชั้นวาง",
  "โคมไฟ", "พรม", "ของตกแต่ง", "ผ้าม่าน",
  "อุปกรณ์ครัว", "เครื่องชงกาแฟ",
  "ชุดเครื่องนอน", "อุปกรณ์สวน", "อุปกรณ์ซักล้าง",
] as const

export type AiStyleKey = typeof AI_STYLES[number]["key"]
export type AiRoomTypeKey = typeof AI_ROOM_TYPES[number]["key"]
export type AiVibeKey = typeof AI_VIBES[number]["key"]
