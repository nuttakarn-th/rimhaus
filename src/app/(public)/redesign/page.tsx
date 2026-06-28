import { RedesignTool } from "@/components/redesign/RedesignTool"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { HeadingReveal } from "@/components/ui/HeadingReveal"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Room Redesign",
  description: "อัปโหลดรูปมุมบ้าน เลือกสไตล์ แล้วดูว่าบ้านคุณจะเป็นยังไง",
}

export default function RedesignPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="px-4 pt-10 pb-8 text-center">
        <ScrollReveal>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-tx/60 mb-2">AI TOOL</p>
        </ScrollReveal>
        <HeadingReveal>
          <h1
            className="text-5xl sm:text-6xl text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic" }}
          >
            Room Redesign
          </h1>
        </HeadingReveal>
        <ScrollReveal delay={150}>
          <p className="text-sm text-muted-foreground mt-2">อัปโหลดรูปมุมบ้าน เลือกสไตล์ แล้วดูว่าบ้านคุณจะเป็นยังไง</p>
        </ScrollReveal>
      </div>
      <RedesignTool />
    </div>
  )
}
