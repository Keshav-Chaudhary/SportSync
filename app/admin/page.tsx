import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard } from '@/components/dashboard/stats-card'

import { AdminSystemOverview } from '@/components/admin/system-overview'
import { AdminUserManagement } from '@/components/admin/user-management'
import { AdminEquipmentOverview } from '@/components/admin/equipment-overview'
import { AdminLoanTracking } from '@/components/admin/loan-tracking'
import { AdminTriggerOverview } from '@/components/admin/trigger-overview'
import { SQLPlayground } from '@/components/admin/sql-playground'
import { AdminAnalytics } from '@/components/admin/admin-analytics'
import { DevModeWrapper } from '@/components/admin/dev-mode-wrapper'

import {
  Activity,
  TrendingUp,
  Terminal,
  Shield,
  Zap,
  AlertTriangle,
  Users,
  Package,
  Download,
} from 'lucide-react'

import { AdminQuickActions } from '@/components/admin/quick-actions'
import { AdminDownloadReport } from '@/components/admin/download-admin-report'

// ─── DATA ───────────────────────────────────────────────────────────────

async function getAdminData() {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) as count FROM USER_ACCOUNT') as any
    const [[students]] = await pool.query('SELECT COUNT(*) as count FROM STUDENT') as any
    const [[staff]] = await pool.query('SELECT COUNT(*) as count FROM STAFF') as any
    const [[equipment]] = await pool.query('SELECT SUM(total_quantity) as count FROM EQUIPMENT') as any

    const [[activeLoans]] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status IN ('ISSUED','OVERDUE')"
    ) as any

    const [[overdueLoans]] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status='OVERDUE'"
    ) as any

    const [[todayGym]] = await pool.query(
      "SELECT COUNT(*) as count FROM GYM_ENTRY WHERE DATE(entry_time)=CURDATE()"
    ) as any

    const [[monthlyGym]] = await pool.query(
      "SELECT COUNT(*) as count FROM GYM_ENTRY WHERE MONTH(entry_time)=MONTH(NOW()) AND YEAR(entry_time)=YEAR(NOW())"
    ) as any

    return {
      totalUsers: users?.count || 0,
      totalStudents: students?.count || 0,
      totalStaff: staff?.count || 0,
      totalEquipment: equipment?.count || 0,
      activeLoans: activeLoans?.count || 0,
      overdueLoans: overdueLoans?.count || 0,
      todayGymEntries: todayGym?.count || 0,
      monthlyGymVisits: monthlyGym?.count || 0,
    }
  } catch {
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalStaff: 0,
      totalEquipment: 0,
      activeLoans: 0,
      overdueLoans: 0,
      todayGymEntries: 0,
      monthlyGymVisits: 0,
    }
  }
}

// ─── UI HELPERS ─────────────────────────────────────────────────────────

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

// ─── PAGE ───────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  if (session.role !== 'ADMIN') {
    if (session.role === 'STUDENT') redirect('/student')
    if (session.role === 'STAFF') redirect('/staff')
    redirect('/auth/login')
  }

  const data = await getAdminData()

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_40%)] bg-[radial-gradient(ellipse_at_top,_var(--foreground)_0%,_transparent_40%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <DashboardHeader firstName="System" lastName="Admin" role="Administrator" />

      <main className="relative z-10 p-4 md:p-8 space-y-4 md:space-y-8 max-w-[1600px] mx-auto w-full max-w-[100vw] overflow-x-hidden">

        {/* HEADER */}
        <div id="section-dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both pt-4 md:pt-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            System Dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Comprehensive overview of university sports facilities, operations, and user activity.
          </p>
        </div>

        {/* SYSTEM STATUS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="border border-border/50 rounded-2xl p-4 bg-card/40 backdrop-blur-md flex flex-wrap gap-4 items-center shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground mr-2">
              <Activity className="w-4 h-4 text-primary" />
              Live Status
            </div>

            <StatusPill active label="API Online" />
            <StatusPill active label="Database Connected" />
            <StatusPill active={data.overdueLoans === 0} label={data.overdueLoans === 0 ? "Loans Stable" : "Overdue Loans Active"} />
            <StatusPill active label="Gym Tracking Active" />

            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              Secure Connection
            </div>
          </div>
        </div>

        {/* STATS - Enhanced System Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <StatsCard
            title="Total Users"
            value={data.totalUsers.toLocaleString()}
            description={
              <span>
                <span className="font-medium">{data.totalStudents}</span> students ·{' '}
                <span className="font-medium">{data.totalStaff}</span> staff
              </span>
            }
            icon={Users}
          />

          <StatsCard
            title="Active Loans"
            value={data.activeLoans.toLocaleString()}
            description={
              data.overdueLoans > 0 ? (
                <span className="text-amber-600 dark:text-amber-500 font-medium">
                  {data.overdueLoans} overdue
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-500 font-medium">All clear ✓</span>
              )
            }
            icon={TrendingUp}
          />

          <StatsCard
            title="Inventory"
            value={data.totalEquipment.toLocaleString()}
            description="Total equipment items"
            icon={Package}
          />

          <StatsCard
            title="Gym Activity"
            value={data.todayGymEntries.toLocaleString()}
            description={
              <span>
                <span className="font-medium">{data.monthlyGymVisits.toLocaleString()}</span> visits this month
              </span>
            }
            icon={Activity}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <AdminQuickActions />
        </div>



      </main>

      {/* FOOTER */}
      <footer className="mt-8 px-6 py-4 border-t border-border/50 bg-background/50 flex justify-between items-center text-xs font-semibold text-muted-foreground z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>SportSync Enterprise System</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Role: Administrator</span>
          <span>UID: {session.user_id.slice(0, 8)}</span>
        </div>
      </footer>

    </div>
  )
}
// import { redirect } from 'next/navigation'
// import { getSession } from '@/lib/auth/session'
// import { pool } from '@/lib/db/mysql'
// import { DashboardHeader } from '@/components/dashboard/header'
// import { StatsCard } from '@/components/dashboard/stats-card'
// import { AdminSystemOverview } from '@/components/admin/system-overview'
// import { AdminUserManagement } from '@/components/admin/user-management'
// import { AdminEquipmentOverview } from '@/components/admin/equipment-overview'
// import { AdminLoanTracking } from '@/components/admin/loan-tracking'
// import { AdminTriggerOverview } from '@/components/admin/trigger-overview'
// import { SQLPlayground } from '@/components/admin/sql-playground'
// import { Users, Package, Activity, TrendingUp } from 'lucide-react'

// async function getAdminData() {
//   try {
//     // Get total users
//     const [totalUsersResult] = await pool.query(
//       'SELECT COUNT(*) as count FROM USER_ACCOUNT'
//     ) as any
//     const totalUsers = totalUsersResult[0]?.count || 0

//     // Get total students
//     const [totalStudentsResult] = await pool.query(
//       'SELECT COUNT(*) as count FROM STUDENT'
//     ) as any
//     const totalStudents = totalStudentsResult[0]?.count || 0

//     // Get total staff
//     const [totalStaffResult] = await pool.query(
//       'SELECT COUNT(*) as count FROM STAFF'
//     ) as any
//     const totalStaff = totalStaffResult[0]?.count || 0

//     // Get total equipment
//     const [totalEquipmentResult] = await pool.query(
//       'SELECT SUM(total_quantity) as count FROM EQUIPMENT'
//     ) as any
//     const totalEquipment = totalEquipmentResult[0]?.count || 0

//     // Get active loans
//     const [activeLoansResult] = await pool.query(
//       "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status IN ('ISSUED', 'OVERDUE')"
//     ) as any
//     const activeLoans = activeLoansResult[0]?.count || 0

//     // Get overdue loans
//     const [overdueLoansResult] = await pool.query(
//       "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'OVERDUE'"
//     ) as any
//     const overdueLoans = overdueLoansResult[0]?.count || 0

//     // Get gym entries today
//     const [todayGymResult] = await pool.query(
//       "SELECT COUNT(*) as count FROM GYM_ENTRY WHERE DATE(entry_time) = CURDATE()"
//     ) as any
//     const todayGymEntries = todayGymResult[0]?.count || 0

//     // Get gym entries this month
//     const [monthlyGymResult] = await pool.query(
//       "SELECT COUNT(*) as count FROM GYM_ENTRY WHERE MONTH(entry_time) = MONTH(NOW()) AND YEAR(entry_time) = YEAR(NOW())"
//     ) as any
//     const monthlyGymVisits = monthlyGymResult[0]?.count || 0

//     return {
//       totalUsers,
//       totalStudents,
//       totalStaff,
//       totalEquipment,
//       activeLoans,
//       overdueLoans,
//       todayGymEntries,
//       monthlyGymVisits,
//     }
//   } catch (error) {
//     console.error('Error fetching admin data:', error)
//     return {
//       totalUsers: 0,
//       totalStudents: 0,
//       totalStaff: 0,
//       totalEquipment: 0,
//       activeLoans: 0,
//       overdueLoans: 0,
//       todayGymEntries: 0,
//       monthlyGymVisits: 0,
//     }
//   }
// }

// export default async function AdminDashboard() {
//   // Check authentication
//   const session = await getSession()
  
//   if (!session) {
//     redirect('/auth/login')
//   }

//   // Verify admin role
//   if (session.role !== 'ADMIN') {
//     if (session.role === 'STUDENT') redirect('/student')
//     if (session.role === 'STAFF') redirect('/staff')
//     redirect('/auth/login')
//   }

//   const data = await getAdminData()

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardHeader 
//         firstName="System"
//         lastName="Admin"
//         role="Administrator"
//       />
//       <main className="p-6">
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
//           <p className="text-muted-foreground">System overview and management</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
//           <StatsCard
//             title="Total Users"
//             value={data.totalUsers}
//             description={`${data.totalStudents} students, ${data.totalStaff} staff`}
//             icon={Users}
//           />
//           <StatsCard
//             title="Active Loans"
//             value={data.activeLoans}
//             description={`${data.overdueLoans} overdue`}
//             icon={TrendingUp}
//           />
//           <StatsCard
//             title="Equipment"
//             value={data.totalEquipment}
//             description="Total items"
//             icon={Package}
//           />
//           <StatsCard
//             title="Gym Today"
//             value={data.todayGymEntries}
//             description={`${data.monthlyGymVisits} this month`}
//             icon={Activity}
//           />
//         </div>

//         {/* Main Content */}
//         <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
//           <div className="lg:col-span-2 space-y-6 min-w-0">
//             <AdminSystemOverview />
//             <AdminLoanTracking />
//           </div>
//           <div className="space-y-6 min-w-0">
//             <AdminUserManagement />
//             <AdminEquipmentOverview />
//           </div>
//         </div>

//         {/* Database Triggers */}
//         <div className="mt-8">
//           <AdminTriggerOverview />
//         </div>

//         {/* SQL Playground */}
//         <div className="mt-8">
//           <SQLPlayground />
//         </div>
//       </main>
//     </div>
//   )
// }
