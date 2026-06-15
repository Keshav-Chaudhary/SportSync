import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { AdminSystemOverview } from '@/components/admin/system-overview'
import { DashboardHeader } from '@/components/dashboard/header'
import { Terminal } from 'lucide-react'

export default async function SystemOverviewPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/auth/login')

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <DashboardHeader firstName="System" lastName="Admin" role="Administrator" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Terminal className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
            System Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Real-time monitoring of backend services and system health.
          </p>
        </div>

        <div className="border border-border/50 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both w-full overflow-hidden">
          <AdminSystemOverview />
        </div>
      </main>
    </div>
  )
}
