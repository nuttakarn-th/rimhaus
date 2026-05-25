import { Sidebar } from "@/components/layout/Sidebar"

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
