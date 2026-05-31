import type { Metadata } from "next"
import { getSettings } from "@/actions/ratecard.actions"
import { Sidebar } from "@/components/layout/Sidebar"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const name = settings?.page_name ?? "Rimhaus"
  const title = `${name} — Admin`
  const description = `ระบบจัดการ Rate Card และคอนเทนต์ของ ${name}`
  const image = settings?.og_image_url || settings?.hero_bg_image_url || settings?.image_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell flex h-full min-h-screen bg-[hsl(35,30%,97%)]">
      <Sidebar />
      <main className="flex-1 md:ml-60 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto print-page-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
