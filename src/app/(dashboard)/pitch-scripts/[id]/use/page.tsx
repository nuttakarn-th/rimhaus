import { notFound } from "next/navigation"
import { getPitchScript } from "@/actions/pitch-scripts.actions"
import { PitchScriptUse } from "@/components/pitch-scripts/PitchScriptUse"

export default async function UsePitchScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const script = await getPitchScript(id)
  if (!script) notFound()

  return <PitchScriptUse script={script} />
}
