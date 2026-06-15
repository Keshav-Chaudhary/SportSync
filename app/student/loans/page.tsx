import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoansTabs } from '@/components/student/loans-tabs'
import { DashboardHeader } from '@/components/dashboard/header'
import { ClipboardList } from 'lucide-react'

export default async function StudentLoansPage() {
  const session = await getSession()

  if (!session) redirect('/auth/login')

  if (session.role !== 'STUDENT') {
    if (session.role === 'ADMIN') redirect('/admin')
    if (session.role === 'STAFF') redirect('/staff')
    redirect('/auth/login')
  }

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
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            My Loans & History
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Track your currently borrowed equipment, past loan history, and gym visits.
          </p>
        </div>

        {/* LOANS TABS CONTAINER */}
        <div className="border border-border/55 rounded-2xl p-4 md:p-6 bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both w-full overflow-hidden">
          <LoansTabs userId={session.user_id} />
        </div>

      </main>
    </div>
  )
}
