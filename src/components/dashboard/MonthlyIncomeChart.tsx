"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyIncomeChartProps {
  data: { month: string; income: number }[]
}

export function MonthlyIncomeChart({ data }: MonthlyIncomeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(25,10%,50%)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(25,10%,50%)" }} axisLine={false} tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString("th-TH")}`, "รายรับ"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(35,20%,88%)" }}
        />
        <Bar dataKey="income" fill="hsl(24,85%,50%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
