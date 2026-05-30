import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: string
  color?: "orange" | "blue" | "green" | "amber"
  href?: string
}

const colorMap: Record<string, { bg: string; iconBg: string; value: string }> = {
  orange: {
    bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-100",
    iconBg: "bg-orange-100",
    value: "text-orange-700",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-blue-100",
    iconBg: "bg-blue-100",
    value: "text-blue-700",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-100",
    iconBg: "bg-emerald-100",
    value: "text-emerald-700",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-100",
    iconBg: "bg-amber-100",
    value: "text-amber-700",
  },
}

export function KpiCard({ title, value, subtitle, icon, color = "orange" }: KpiCardProps) {
  const style = colorMap[color]
  return (
    <div className={cn("border rounded-2xl p-4 flex flex-col gap-3", style.bg)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", style.iconBg)}>
        {icon}
      </div>
      <div>
        <div className={cn("text-2xl font-black leading-none tracking-tight", style.value)}>{value}</div>
        <div className="text-xs font-semibold text-[hsl(25,20%,35%)] mt-1.5">{title}</div>
        {subtitle && <div className="text-[10px] text-[hsl(25,10%,55%)] mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}
