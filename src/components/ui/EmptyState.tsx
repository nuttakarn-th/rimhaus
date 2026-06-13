import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-[hsl(35,20%,88%)] p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(35,25%,94%)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[hsl(25,10%,65%)]" />
      </div>
      <p className="text-sm font-semibold text-[hsl(25,20%,25%)]">{title}</p>
      {description && (
        <p className="text-xs text-[hsl(25,10%,55%)] mt-1 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="mt-5">
          <Button size="sm" variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
