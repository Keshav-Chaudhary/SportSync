import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { GymActivityLog } from '@/components/staff/gym-activity-log'
import { GymEntryLog } from '@/components/staff/gym-entry-log'
import { DashboardHeader } from '@/components/dashboard/header'
import { StaffRecentActivity } from '@/components/staff/staff-recent-activity'
import { Dumbbell } from 'lucide-react'
import { pool } from '@/lib/db/mysql'

export default async function StaffGymPage() {
  const session = await getSession()
  if (!session || session.role !== 'STAFF') redirect('/auth/login')

  const [staffProfile] = await pool.query(
    'SELECT * FROM STAFF WHERE user_id = ?',
    [session.user_id]
  ) as any

  const staffId = staffProfile?.[0]?.staff_id

  const [recentActivity] = await pool.query(
    `SELECT g.entry_id, g.entry_time, g.exit_time, s.name as student_name, s.roll_no
     FROM GYM_ENTRY g
     JOIN STUDENT s ON g.student_id = s.roll_no
     WHERE g.recorded_by = ?
     ORDER BY COALESCE(g.exit_time, g.entry_time) DESC
     LIMIT 6`,
     [staffId]
  ) as any

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <DashboardHeader firstName="Staff" lastName="Member" role="Staff" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
            Gym Control
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Monitor live gym entries, track current occupancy, and review activity logs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both w-full">
          <div className="border border-border/50 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden w-full lg:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-foreground">Live Entries</h3>
            <GymEntryLog />
          </div>

          <div className="border border-border/50 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden w-full lg:col-span-2">
            <h3 className="font-bold text-lg mb-4 text-foreground">Activity Log</h3>
            <GymActivityLog />
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both w-full">
          <StaffRecentActivity activities={recentActivity || []} />
        </div>
      </main>
    </div>
  )
}
