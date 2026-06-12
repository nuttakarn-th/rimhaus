export default function Loading() {
  return (
    <div className="min-h-screen bg-[hsl(35,30%,97%)]">
      <div className="w-full aspect-square sm:aspect-auto sm:min-h-[60vh] bg-[hsl(25,20%,20%)] animate-pulse" />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <div className="flex gap-5 justify-center py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-14 bg-[hsl(35,20%,88%)] rounded animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 mx-auto bg-[hsl(35,20%,88%)] rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-36 bg-[hsl(35,20%,88%)] rounded-2xl animate-pulse" style={{ animationDelay: `${(i * 4 + j) * 40}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
