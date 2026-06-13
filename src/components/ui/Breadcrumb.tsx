import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-[hsl(25,10%,55%)] mb-1" aria-label="breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-[hsl(25,10%,72%)]" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-[hsl(25,20%,25%)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[hsl(25,20%,25%)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
