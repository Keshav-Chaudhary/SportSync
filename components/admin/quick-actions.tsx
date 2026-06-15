'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Users, Package, Server, Database } from 'lucide-react'
import {Download } from 'lucide-react'
import { Zap } from 'lucide-react'

function QuickAction({
  icon: Icon,
  cmd,
  description,
  onClick,
}: {
  icon: any
  cmd: string
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
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{cmd}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export function AdminQuickActions() {
  const router = useRouter()

  const goTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-card/50 backdrop-blur">
      <div className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        Quick Actions
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <QuickAction
          icon={Users}
          cmd="users.manage"
          description="Create / assign roles"
          onClick={() => goTo('/admin/users')}
        />
        <QuickAction
          icon={Package}
          cmd="inventory.audit"
          description="Check stock integrity"
          onClick={() => goTo('/admin/equipment')}
        />
        <QuickAction
          icon={Server}
          cmd="system.inspect"
          description="Monitor services"
          onClick={() => goTo('/admin/system')}
        />
        <QuickAction
          icon={Database}
          cmd="sql.console"
          description="Run direct queries"
          onClick={() => goTo('/admin/sql')}
        />
        <QuickAction
          icon={Download}
          cmd="data.export"
          description="Generate PDF export of all system data"
          onClick={() => window.open('/api/admin/export/pdf', '_blank')}
        />
      </div>
    </div>
  )
}