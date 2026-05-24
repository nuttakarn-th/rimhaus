"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/actions/auth.actions"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  CalendarDays,
  Smartphone,
  CreditCard,
  Building2,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "หน้าหลัก" },
  { href: "/jobs", icon: ClipboardList, label: "งานรีวิว" },
  { href: "/finances", icon: Wallet, label: "การเงิน" },
  { href: "/content", icon: CalendarDays, label: "วางแผนคอนเทนต์" },
  { href: "/posts", icon: Smartphone, label: "จัดการโพส" },
  { href: "/customers", icon: Building2, label: "ลูกค้า" },
  { href: "/documents", icon: FileText, label: "เอกสาร" },
  { href: "/settings/issuers", icon: User, label: "ผู้ออกเอกสาร" },
  { href: "/settings/ratecard", icon: CreditCard, label: "Rate Card" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-[hsl(35,20%,88%)] flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-[hsl(35,25%,92%)] transition-colors"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5 text-[hsl(25,20%,35%)]" />
        </button>
        <span className="text-xl">🏠</span>
        <span className="font-bold text-lg text-[hsl(25,20%,15%)]">Rimhaus</span>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-60 bg-white border-r border-[hsl(35,20%,88%)] flex flex-col z-40",
        "transition-transform duration-200 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Desktop logo */}
        <div className="hidden md:flex h-16 items-center px-6 border-b border-[hsl(35,20%,88%)]">
          <span className="text-xl mr-2">🏠</span>
          <span className="font-bold text-lg text-[hsl(25,20%,15%)]">Rimhaus</span>
        </div>
        {/* Mobile logo + close */}
        <div className="md:hidden h-14 flex items-center px-4 border-b border-[hsl(35,20%,88%)] justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-lg text-[hsl(25,20%,15%)]">Rimhaus</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[hsl(35,25%,92%)] transition-colors"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5 text-[hsl(25,20%,35%)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(24,85%,50%)] text-white"
                    : "text-[hsl(25,20%,35%)] hover:bg-[hsl(35,25%,92%)] hover:text-[hsl(25,20%,15%)]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-[hsl(35,20%,88%)]">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[hsl(25,10%,50%)] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
