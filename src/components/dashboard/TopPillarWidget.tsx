import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTENT_PILLAR_LABELS, CONTENT_PILLAR_COLORS } from "@/lib/constants"
import type { ContentPillar } from "@/lib/types"

export interface PillarStat {
  pillar: ContentPillar
  engagement: number
  count: number
}

interface TopPillarWidgetProps {
  stats: PillarStat[]
}

export function TopPillarWidget({ stats }: TopPillarWidgetProps) {
  const sorted = [...stats].sort((a, b) => b.engagement - a.engagement)
  const top = sorted[0]
  const total = stats.reduce((s, p) => s + p.engagement, 0)

  return (
    <Card className="border-[hsl(35,20%,88%)]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[hsl(25,10%,50%)]">Engagement ต่อ Content Pillar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.length === 0 ? (
          <p className="text-sm text-[hsl(25,10%,50%)] text-center py-4">ยังไม่มีข้อมูล — ลอง tag pillar ให้คอนเทนต์ก่อน</p>
        ) : (
          <>
            {top && (
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTENT_PILLAR_COLORS[top.pillar]}`}>
                  {CONTENT_PILLAR_LABELS[top.pillar]}
                </span>
                <span className="text-xs text-[hsl(25,10%,50%)]">pillar ที่ engagement ดีสุด</span>
              </div>
            )}
            {sorted.map(({ pillar, engagement, count }) => {
              const pct = total > 0 ? Math.round((engagement / total) * 100) : 0
              return (
                <div key={pillar} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[hsl(25,20%,20%)]">{CONTENT_PILLAR_LABELS[pillar]}</span>
                    <span className="text-[hsl(25,10%,50%)]">{engagement.toLocaleString()} ({count} โพส)</span>
                  </div>
                  <div className="h-1.5 bg-[hsl(35,25%,92%)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(24,85%,50%)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </>
        )}
      </CardContent>
    </Card>
  )
}
