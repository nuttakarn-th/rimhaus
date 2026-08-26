import type { AffiliateZone } from "@/lib/types"

export const ZONE_CONFIG: Record<AffiliateZone, { label: string; emoji: string; color: string }> = {
  living_room:  { label: "ห้องรับแขก",      emoji: "🛋️", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  kitchen:      { label: "ห้องครัว",         emoji: "🍳", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  bathroom:     { label: "ห้องน้ำ",          emoji: "🚿", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  miscellaneous:{ label: "ของใช้เบ็ดเตล็ด", emoji: "🔧", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  appliances:   { label: "เครื่องใช้ไฟฟ้า", emoji: "⚡", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  garden:       { label: "สวนนอกบ้าน",      emoji: "🌿", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  workspace:    { label: "โต๊ะทำงาน+Gadget",emoji: "💻", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  wall_shelf:   { label: "ชั้นวาง ผนัง",    emoji: "📦", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
}

export const ZONE_ORDER: AffiliateZone[] = [
  "living_room", "kitchen", "bathroom", "miscellaneous",
  "appliances", "garden", "workspace", "wall_shelf",
]
