"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#000000",
  youtube: "#FF0000",
  lemon8: "#FFD700",
  shopee: "#EE4D2D",
}

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  lemon8: "Lemon8",
  shopee: "Shopee",
}

interface PlatformSummaryProps {
  data: { platform: string; count: number }[]
}

export function PlatformSummary({ data }: PlatformSummaryProps) {
  if (!data.length) {
    return <p className="text-sm text-[hsl(25,10%,50%)] text-center py-8">ยังไม่มีข้อมูลโพส</p>
  }

  const chartData = data.map(d => ({
    name: LABELS[d.platform] ?? d.platform,
    value: d.count,
    color: COLORS[d.platform] ?? "#6b7280",
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [Number(v), "โพส"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
