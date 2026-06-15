import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StaffQuickActions } from '@/components/staff/staff-quick-actions'
import {
  Package,
  Users,
  AlertTriangle,
  Activity,
  Shield,
} from 'lucide-react'

// ─── DATA ───────────────────────────────────────────────────────────────
async function getStaffData() {
  try {
    const [[totalEquipment]] = await pool.query(
      'SELECT COUNT(*) as count FROM EQUIPMENT'
    ) as any

    const [[activeLoans]] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'ISSUED'"
    ) as any

    const [[overdueLoans]] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'OVERDUE' AND due_date < NOW()"
    ) as any

    const [[currentOccupancy]] = await pool.query(
      'SELECT COUNT(*) as count FROM GYM_ENTRY WHERE exit_time IS NULL'
    ) as any

    return {
      totalEquipment: totalEquipment?.count || 0,
      activeLoans: activeLoans?.count || 0,
      overdueLoans: overdueLoans?.count || 0,
      currentOccupancy: currentOccupancy?.count || 0,
    }
  } catch {
    return {
      totalEquipment: 0,
      activeLoans: 0,
      overdueLoans: 0,
      currentOccupancy: 0,
    }
  }
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────
function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-background/60 border border-border/50 shadow-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          active
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
        }`}
      />
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default async function StaffDashboard() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  if (session.role === 'ADMIN') {
    redirect('/admin')
  }

  if (session.role !== 'STAFF') {
    if (session.role === 'STUDENT') redirect('/student')
    redirect('/auth/login')
  }

  const [staffProfile] = await pool.query(
    'SELECT * FROM STAFF WHERE user_id = ?',
    [session.user_id]
  ) as any

  const data = await getStaffData()
  const fullName = staffProfile?.[0]?.name || 'Staff'
  const firstName = fullName.split(' ')[0]
  const lastName  = fullName.split(' ').slice(1).join(' ')

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <DashboardHeader firstName={firstName} lastName={lastName} role="Staff" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw] overflow-x-hidden">

        {/* HEADER */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Staff Dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Overview of operations, inventory, and system monitoring.
          </p>
        </div>

        {/* SYSTEM STATUS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="border border-border/50 rounded-2xl p-4 bg-card/40 backdrop-blur-md flex flex-wrap gap-4 items-center shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground mr-2">
              <Activity className="w-4 h-4 text-primary" />
              System Status
            </div>

            <StatusPill active={true} label="API Online" />
            <StatusPill active={true} label="DB Connected" />
            <StatusPill active={data.overdueLoans === 0} label={data.overdueLoans === 0 ? "Loans Stable" : "Overdue Items"} />
            <StatusPill active={true} label="Gym Tracking" />

            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              Secure Session
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <StatsCard title="Inventory" value={data.totalEquipment} description="Total items" icon={Package} />
          <StatsCard title="Active Loans" value={data.activeLoans} description="In circulation" icon={Users} />
          <StatsCard title="Overdue" value={data.overdueLoans} description="Critical attention" icon={AlertTriangle} />
          <StatsCard title="Gym Live" value={data.currentOccupancy} description="Current occupancy" icon={Activity} />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <StaffQuickActions />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 px-6 py-4 border-t border-border/50 bg-background/50 flex justify-between items-center text-xs font-semibold text-muted-foreground z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>SportSync Staff Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Role: Staff</span>
          <span>UID: {session.user_id}</span>
        </div>
      </footer>
    </div>
  )
}
