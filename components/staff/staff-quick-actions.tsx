'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Package, ClipboardList, Dumbbell, Database, Zap } from 'lucide-react'

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: any
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition text-left w-full"
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-background group-hover:bg-primary/10">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export function StaffQuickActions() {
  const router = useRouter()

  const goTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card/50 backdrop-blur shadow-sm">
      <div className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        Quick Actions
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Package} title="Equipment Inventory" description="Update equipment" onClick={() => goTo('/staff/equipment')} />
        <QuickAction icon={ClipboardList} title="Manage Loans" description="Approve / return" onClick={() => goTo('/staff/loans')} />
        <QuickAction icon={Dumbbell} title="Live Gym Status" description="Track entries" onClick={() => goTo('/staff/gym')} />
        <QuickAction icon={Database} title="System Logs" description="Review activity" onClick={() => goTo('/staff/gym')} />
      </div>
    </div>
  )
}
