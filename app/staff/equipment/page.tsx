import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { EquipmentManagement } from '@/components/staff/equipment-management'
import { EquipmentAnalytics } from '@/components/staff/equipment-analytics'
import { DashboardHeader } from '@/components/dashboard/header'
import { Package } from 'lucide-react'

export default async function StaffEquipmentPage() {
  const session = await getSession()
  if (!session || session.role !== 'STAFF') redirect('/auth/login')

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <DashboardHeader firstName="Staff" lastName="Member" role="Staff" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
            Equipment Management
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Manage sports gear inventory, add new items, and view equipment analytics.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both w-full">
          <div className="border border-border/50 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden w-full lg:col-span-2">
            <EquipmentAnalytics />
          </div>

          <div className="border border-border/50 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden w-full lg:col-span-2">
            <EquipmentManagement />
          </div>
        </div>
      </main>
    </div>
  )
}
