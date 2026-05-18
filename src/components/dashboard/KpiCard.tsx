import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function KpiCard({ title, value, subtitle, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("border-[hsl(35,20%,88%)]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(25,10%,50%)]">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[hsl(25,20%,15%)]">{value}</div>
        {subtitle && <p className="text-xs text-[hsl(25,10%,50%)] mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
