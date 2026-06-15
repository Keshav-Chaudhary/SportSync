'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Terminal, Code2, ShieldAlert, ShieldCheck, ChevronRight, Activity } from 'lucide-react'

interface DevModeWrapperProps {
  children: React.ReactNode
}

export function DevModeWrapper({ children }: DevModeWrapperProps) {
  const [devMode, setDevMode] = useState(false)

  return (
    <div className="space-y-4">

      {/* Toggle Header */}
      <div className={`
        relative overflow-hidden border rounded-xl transition-all duration-300
        ${devMode
          ? 'border-blue-500/40 bg-blue-950/10'
          : 'border-border/50 bg-card/50'
        }
        backdrop-blur-sm
      `}>

        <div className={`
          absolute top-0 left-0 right-0 h-px transition-all duration-500
          ${devMode ? 'bg-foreground/40' : 'bg-border/30'}
        `} />

        <div className="px-3 sm:px-5 py-4 flex flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">

          {/* Left: icon + label + description */}
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`
              mt-0.5 p-1.5 rounded-md border transition-all duration-300 shrink-0
              ${devMode
                ? 'border-foreground/30 bg-foreground/5 text-foreground'
                : 'border-border bg-muted/30 text-muted-foreground'
              }
            `}>
              <Terminal className="w-3.5 h-3.5" />
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-foreground truncate">
                  Developer Mode
                </span>
                <span className={`
                  inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border transition-all duration-300 shrink-0
                  ${devMode
                    ? 'bg-foreground/10 text-foreground border-foreground/20'
                    : 'bg-muted/50 text-muted-foreground border-border'
                  }
                `}>
                  <span className={`
                    w-1.5 h-1.5 rounded-full transition-all duration-300
                    ${devMode ? 'bg-foreground' : 'bg-muted-foreground/50'}
                  `} />
                  {devMode ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                {devMode
                  ? 'System internals are visible — raw data & query logs enabled'
                  : 'Enable to access advanced analytics, query logs & raw data tables'
                }
              </p>
            </div>
          </div>

          {/* Right: shield icon + toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-1 sm:mt-0">
            {devMode
              ? <ShieldAlert className="w-4 h-4 text-foreground/70 hidden sm:block" />
              : <ShieldCheck className="w-4 h-4 text-muted-foreground/40 hidden sm:block" />
            }
            <Switch
              checked={devMode}
              onCheckedChange={setDevMode}
              className="data-[state=checked]:bg-foreground data-[state=unchecked]:bg-muted/60"
            />
          </div>
        </div>

        {/* Info bar — visible only when active */}
        {devMode && (
          <div className="border-t border-foreground/10 px-5 py-2 flex items-center gap-3 bg-foreground/[0.03]">
            <Activity className="w-3 h-3 text-foreground/60 flex-shrink-0" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium tracking-wide uppercase text-foreground/70">
              <span className="flex items-center gap-1">
                <ChevronRight className="w-2.5 h-2.5" />
                raw SQL queries visible
              </span>
              <span className="text-foreground/30">·</span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-2.5 h-2.5" />
                full record sets unlocked
              </span>
              <span className="text-foreground/30">·</span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-2.5 h-2.5" />
                session-scoped only
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {devMode ? (
        <div className="space-y-4">
          {children}
        </div>
      ) : (
        <div className="py-10 border border-dashed border-border/60 rounded-xl bg-card/20 text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-xl border border-border/50 bg-muted/20">
              <Code2 className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Advanced tools are hidden</p>
          <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
            Toggle developer mode above to access query logs, raw data tables, and system internals.
          </p>
        </div>
      )}

    </div>
  )
}