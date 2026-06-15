'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ClipboardList, Dumbbell, Zap, ShieldHalf } from 'lucide-react'

export function StaffSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/staff') return pathname === '/staff'
    return pathname?.startsWith(path)
  }

  const getLinkClasses = (path: string) => {
    return `flex flex-col md:flex-row items-center justify-center md:justify-start h-[56px] md:h-12 min-w-[56px] md:min-w-0 px-2 md:px-3 rounded-lg md:rounded-xl transition-all duration-200 group/item ${
      isActive(path)
        ? 'text-primary bg-primary/15 shadow-[0_0_10px_rgba(var(--primary),0.1)]'
        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
    }`
  }

  return (
    <aside className="peer group fixed bottom-0 left-0 right-0 md:right-auto md:top-0 z-50 flex flex-row md:flex-col bg-card/90 md:bg-card/80 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-border/50 h-[65px] md:h-screen w-full md:w-[72px] md:hover:w-[260px] transition-all duration-300 md:overflow-hidden shadow-[var(--shadow-lg)]">
      
      {/* Brand (Desktop only) */}
      <div className="hidden md:flex items-center h-16 px-4 shrink-0 border-b border-border/30">
        <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <ShieldHalf className="w-5 h-5" />
        </div>
        <span className="ml-4 font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Staff Portal
        </span>
      </div>

      {/* Menu */}
      <div className="flex-1 py-1 md:py-6 flex flex-row md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto px-2 md:px-3 custom-scrollbar items-center md:items-stretch justify-around md:justify-start">
        
        <div className="hidden md:block text-[10px] font-bold tracking-widest text-muted-foreground/60 mb-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap uppercase">
          Overview
        </div>

        <Link href="/staff" className={getLinkClasses('/staff')}>
          <LayoutDashboard className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
          <span className="text-[10px] md:text-sm mt-1 md:mt-0 md:ml-4 font-medium whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 block">
            Dashboard
          </span>
        </Link>
        
        <div className="hidden md:block text-[10px] font-bold tracking-widest text-muted-foreground/60 mt-6 mb-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap uppercase">
          Management
        </div>

        <Link href="/staff/equipment" className={getLinkClasses('/staff/equipment')}>
          <Package className="w-5 h-5 shrink-0" />
          <span className="text-[10px] md:text-sm mt-1 md:mt-0 md:ml-4 font-medium whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 block">
            Equipment
          </span>
        </Link>

        <Link href="/staff/loans" className={getLinkClasses('/staff/loans')}>
          <ClipboardList className="w-5 h-5 shrink-0" />
          <span className="text-[10px] md:text-sm mt-1 md:mt-0 md:ml-4 font-medium whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 block">
            Loans
          </span>
        </Link>

        <Link href="/staff/gym" className={getLinkClasses('/staff/gym')}>
          <Dumbbell className="w-5 h-5 shrink-0" />
          <span className="text-[10px] md:text-sm mt-1 md:mt-0 md:ml-4 font-medium whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 block">
            Gym Control
          </span>
        </Link>
      </div>

      <div className="hidden md:flex p-4 border-t border-border/30 shrink-0">
        <Link href="/" className="flex items-center h-10 px-1 hover:text-primary text-muted-foreground transition-colors group/item">
          <Zap className="w-5 h-5 shrink-0" />
          <span className="ml-5 text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Go to Landing Page
          </span>
        </Link>
      </div>
    </aside>
  )
}
