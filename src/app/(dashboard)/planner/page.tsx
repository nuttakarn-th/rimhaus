import { getContentItems } from "@/actions/content.actions"
import { getJobs } from "@/actions/jobs.actions"
import { ContentPlannerClient } from "@/components/planner/ContentPlannerClient"
import { Sparkles } from "lucide-react"

export default async function PlannerPage() {
  const [contentItems, jobs] = await Promise.all([
    getContentItems(),
    getJobs(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[hsl(24,85%,50%)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[hsl(25,20%,15%)] dark:text-[hsl(35,20%,88%)]">ปฏิทิน Content</h1>
          <p className="text-xs text-[hsl(25,10%,50%)]">วางแผนรายวัน · ติดตาม Repurpose · ไม่พลาดช่วง Sale</p>
        </div>
      </div>

      <ContentPlannerClient contentItems={contentItems} jobs={jobs} />
    </div>
  )
}
