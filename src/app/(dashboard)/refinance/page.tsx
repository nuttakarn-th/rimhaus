import { RefinanceCalculator } from "@/components/refinance/RefinanceCalculator"
import { listRefinanceSessions } from "@/actions/refinance.actions"

export const metadata = { title: "คำนวณรีไฟแนนซ์" }

export default async function RefinancePage() {
  const sessions = await listRefinanceSessions()
  return <RefinanceCalculator initialSessions={sessions} />
}
