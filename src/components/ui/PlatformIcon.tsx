import { cn } from "@/lib/utils"

// Simple Icons SVG paths — viewBox 0 0 24 24
const SVG_DATA: Record<string, string> = {
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  youtube:
    "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  shopee:
    "M12 0a12 12 0 1 0 0 24A12 12 0 0 0 12 0zm0 3.6a3.6 3.6 0 0 1 3.573 3.15H8.427A3.6 3.6 0 0 1 12 3.6zm5.4 14.4H6.6a1.2 1.2 0 0 1-1.2-1.2V8.4h13.2v8.4a1.2 1.2 0 0 1-1.2 1.2zm-5.4-7.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z",
  lemon8:
    "M17.25.75H6.75C3.433.75.75 3.433.75 6.75v10.5c0 3.317 2.683 6 6 6h10.5c3.317 0 6-2.683 6-6V6.75c0-3.317-2.683-6-6-6zm-5.116 16.37a4.627 4.627 0 0 1-4.621-4.62c0-1.627.843-3.064 2.121-3.896A3.112 3.112 0 0 1 8.387 6.1a3.63 3.63 0 0 1 3.63-3.63 3.63 3.63 0 0 1 3.63 3.63 3.112 3.112 0 0 1-1.248 2.503 4.627 4.627 0 0 1 2.12 3.896 4.627 4.627 0 0 1-4.535 4.62z",
}

// Official brand CI colors
export const PLATFORM_CI: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#010101",
  youtube: "#FF0000",
  shopee: "#EE4D2D",
  lemon8: "#FF9500",
}

export const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  shopee: "Shopee",
  lemon8: "Lemon8",
}

interface PlatformIconProps {
  platform: string
  size?: number
  color?: string
  className?: string
}

export function PlatformIcon({ platform, size = 16, color, className }: PlatformIconProps) {
  const key = platform.toLowerCase()
  const d = SVG_DATA[key]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color ?? PLATFORM_CI[key] ?? "#6b7280"}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

// Platform chip — icon + label in a pill
interface PlatformChipProps {
  platform: string
  size?: "sm" | "xs"
  showLabel?: boolean
  className?: string
}

export function PlatformChip({ platform, size = "sm", showLabel = true, className }: PlatformChipProps) {
  const key = platform.toLowerCase()
  const label = PLATFORM_LABELS[key] ?? platform
  const color = PLATFORM_CI[key] ?? "#6b7280"

  if (size === "xs") {
    return (
      <span
        className={cn("inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold text-white leading-none", className)}
        style={{ backgroundColor: color }}
      >
        <PlatformIcon platform={platform} size={8} color="white" />
        {showLabel && platform.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white", className)}
      style={{ backgroundColor: color }}
    >
      <PlatformIcon platform={platform} size={11} color="white" />
      {showLabel && label}
    </span>
  )
}

// Platform bubble — circle with icon only, no text
interface PlatformBubbleProps {
  platform: string
  size?: number
  noHover?: boolean
  className?: string
}

export function PlatformBubble({ platform, size = 40, noHover = false, className }: PlatformBubbleProps) {
  const key = platform.toLowerCase()
  const color = PLATFORM_CI[key] ?? "#6b7280"
  const iconSize = Math.round(size * 0.45)
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform",
        !noHover && "hover:scale-110",
        className
      )}
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <PlatformIcon platform={platform} size={iconSize} color="white" />
    </div>
  )
}
