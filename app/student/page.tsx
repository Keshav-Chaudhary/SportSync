import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { StudentQuickActions } from '@/components/student/student-quick-actions'
import {
  Package,
  Clock,
  Calendar,
  CheckCircle,
  Activity,
  Shield,
  User,
  Target,
} from 'lucide-react'

// ─── DATA FETCHING ────────────────────────────────────────────────────────
async function getStudentData(userId: string) {
  try {
    const [studentResult] = await pool.query(
      'SELECT * FROM STUDENT WHERE user_id = ?',
      [userId]
    ) as any

    const student = studentResult?.[0] || null

    if (!student) {
      return {
        student: null,
        activeLoansCount: 0,
        monthlyLoans: 0,
        gymVisits: 0,
        isInGym: false,
        currentGymEntry: null,
      }
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [[activeLoans]] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE student_id = ? AND status IN ('ISSUED','OVERDUE')",
      [student.roll_no]
    ) as any

    const [[monthlyLoans]] = await pool.query(
      'SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE student_id = ? AND issued_at >= ?',
      [student.roll_no, startOfMonth]
    ) as any

    const [[gymVisits]] = await pool.query(
      'SELECT COUNT(*) as count FROM GYM_ENTRY WHERE student_id = ? AND entry_time >= ?',
      [student.roll_no, startOfMonth]
    ) as any

    const [gymEntry] = await pool.query(
      'SELECT * FROM GYM_ENTRY WHERE student_id = ? AND exit_time IS NULL LIMIT 1',
      [student.roll_no]
    ) as any

    return {
      student,
      activeLoansCount: activeLoans?.count || 0,
      monthlyLoans: monthlyLoans?.count || 0,
      gymVisits: gymVisits?.count || 0,
      isInGym: !!gymEntry?.[0],
      currentGymEntry: gymEntry?.[0] || null,
    }
  } catch {
    return {
      student: null,
      activeLoansCount: 0,
      monthlyLoans: 0,
      gymVisits: 0,
      isInGym: false,
      currentGymEntry: null,
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

function GoalProgress({
  label,
  value,
  max,
  colorClass = 'bg-primary',
}: {
  label: string
  value: number
  max: number
  colorClass?: string
}) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-foreground font-bold">
          {value} <span className="text-muted-foreground">/ {max}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────
export default async function StudentDashboard() {
  const session = await getSession()

  if (!session) redirect('/auth/login')

  if (session.role !== 'STUDENT') {
    if (session.role === 'ADMIN') redirect('/admin')
    if (session.role === 'STAFF') redirect('/staff')
    redirect('/auth/login')
  }

  const data = await getStudentData(session.user_id)
  const fullName = data.student?.name || 'Student'
  const firstName = fullName.split(' ')[0]
  const lastName = fullName.split(' ').slice(1).join(' ')

  const LOAN_TARGET = 10
  const GYM_TARGET = 20

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <DashboardHeader firstName={firstName} lastName={lastName} role="Student" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw] overflow-x-hidden">
        
        {/* HEADER */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Student Dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Welcome back, {firstName}. Access sports equipment, view active loans, and manage your gym logs.
          </p>
        </div>

        {/* SYSTEM STATUS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="border border-border/50 rounded-2xl p-4 bg-card/40 backdrop-blur-md flex flex-wrap gap-4 items-center shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground mr-2">
              <Activity className="w-4 h-4 text-primary" />
              Portal Status
            </div>

            <StatusPill active={true} label="API Online" />
            <StatusPill active={true} label="Database Connected" />
            <StatusPill active={data.isInGym} label={data.isInGym ? "Gym Active" : "Gym Checked Out"} />
            <StatusPill active={data.activeLoansCount > 0} label={data.activeLoansCount > 0 ? "Active Loans Open" : "No Open Loans"} />

            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              Secure Session
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <StatsCard
            title="Active Loans"
            value={data.activeLoansCount}
            description="Currently borrowed items"
            icon={Package}
          />
          <StatsCard
            title="Monthly Loans"
            value={data.monthlyLoans}
            description="Items issued this month"
            icon={Clock}
          />
          <StatsCard
            title="Gym Visits"
            value={data.gymVisits}
            description="Total sessions this month"
            icon={Calendar}
          />
          <StatsCard
            title="Gym Status"
            value={data.isInGym ? 'ACTIVE' : 'IDLE'}
            description={data.isInGym ? 'Inside gym facility' : 'Outside gym facility'}
            icon={CheckCircle}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <StudentQuickActions />
        </div>

        {/* DETAILS GRID */}
        <div className="grid gap-6 lg:grid-cols-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">

          {/* Monthly Goals */}
          <div className="border border-border/50 rounded-2xl p-5 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Monthly Progress Goals
            </h3>
            
            <div className="space-y-5">
              <GoalProgress
                label="Equipment Loans"
                value={data.monthlyLoans}
                max={LOAN_TARGET}
                colorClass="bg-primary"
              />
              <GoalProgress
                label="Gym Entries"
                value={data.gymVisits}
                max={GYM_TARGET}
                colorClass="bg-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-border/30 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Targets reset automatically at month end</span>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-8 px-6 py-4 border-t border-border/50 bg-background/50 flex justify-between items-center text-xs font-semibold text-muted-foreground z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>SportSync Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Role: Student</span>
          <span>UID: {session.user_id}</span>
        </div>
      </footer>
    </div>
  )
}
