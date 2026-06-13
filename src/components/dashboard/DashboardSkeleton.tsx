export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-[hsl(35,20%,88%)] rounded-full" />
              <div className="w-8 h-8 rounded-xl bg-[hsl(35,20%,90%)]" />
            </div>
            <div className="h-7 w-24 bg-[hsl(35,20%,86%)] rounded-full" />
            <div className="h-3 w-28 bg-[hsl(35,20%,90%)] rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[hsl(35,20%,88%)]" />
              <div className="h-3 w-28 bg-[hsl(35,20%,88%)] rounded-full" />
            </div>
            <div className="h-40 bg-[hsl(35,20%,92%)] rounded-xl" />
          </div>
        ))}
      </div>

      {/* Pillar widget */}
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] p-4 space-y-3">
        <div className="h-3 w-32 bg-[hsl(35,20%,88%)] rounded-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-[hsl(35,20%,92%)] rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent jobs list */}
      <div className="bg-white rounded-2xl border border-[hsl(35,20%,88%)] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="h-4 w-28 bg-[hsl(35,20%,88%)] rounded-full" />
          <div className="h-3 w-14 bg-[hsl(35,20%,90%)] rounded-full" />
        </div>
        <div className="divide-y divide-[hsl(35,25%,94%)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-1.5 h-10 rounded-full bg-[hsl(35,20%,88%)]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-[hsl(35,20%,88%)] rounded-full" />
                <div className="h-2.5 w-20 bg-[hsl(35,20%,91%)] rounded-full" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <div className="h-4 w-16 bg-[hsl(35,20%,88%)] rounded-full" />
                <div className="h-3 w-12 bg-[hsl(35,20%,91%)] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
