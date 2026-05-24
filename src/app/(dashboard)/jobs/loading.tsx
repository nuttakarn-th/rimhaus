import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )
}
