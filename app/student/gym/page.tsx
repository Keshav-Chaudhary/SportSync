import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { GymCheckIn } from '@/components/student/gym-check-in'
import { DashboardHeader } from '@/components/dashboard/header'
import { Activity } from 'lucide-react'

async function getGymData(userId: string) {
  try {
    const [studentResult] = await pool.query(
      'SELECT roll_no FROM STUDENT WHERE user_id = ?',
      [userId]
    ) as any

    const student = studentResult?.[0] || null
    if (!student) {
      return { isInGym: false, currentGymEntry: null }
    }

    const [gymEntry] = await pool.query(
      'SELECT * FROM GYM_ENTRY WHERE student_id = ? AND exit_time IS NULL LIMIT 1',
      [student.roll_no]
    ) as any

    return {
      isInGym: !!gymEntry?.[0],
      currentGymEntry: gymEntry?.[0] || null,
    }
  } catch {
    return { isInGym: false, currentGymEntry: null }
  }
}

export default async function StudentGymPage() {
  const session = await getSession()

  if (!session) redirect('/auth/login')

  if (session.role !== 'STUDENT') {
    if (session.role === 'ADMIN') redirect('/admin')
    if (session.role === 'STAFF') redirect('/staff')
    redirect('/auth/login')
  }

  const data = await getGymData(session.user_id)
  const fullName = session.name || 'Student'
  const firstName = fullName.split(' ')[0]
  const lastName = fullName.split(' ').slice(1).join(' ')

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <DashboardHeader firstName={firstName} lastName={lastName} role="Student" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw]">
        
        {/* HEADER */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            Gym Access Control
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Monitor gym live occupancy status and review your current check-in session.
          </p>
        </div>

        {/* GYM CHECK-IN CONTAINER */}
        <div className="border border-border/55 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both w-full overflow-hidden">
          <GymCheckIn
            userId={session.user_id}
            isInGym={data.isInGym}
            currentEntry={data.currentGymEntry}
          />
        </div>

      </main>
    </div>
  )
}
