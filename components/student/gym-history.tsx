'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Activity, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function GymHistory({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔍 Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetch(`/api/gym-entries/history?userId=${userId}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [userId])

  // 📊 Analytics
  const stats = useMemo(() => {
    let total = data.length
    let active = data.filter(e => !e.exit_time).length

    const now = new Date()

    let durations: number[] = []
    let monthlyTotal = 0

    data.forEach(e => {
      if (!e.exit_time) return

      const start = new Date(e.entry_time)
      const end = new Date(e.exit_time)

      const mins = (end.getTime() - start.getTime()) / (1000 * 60)
      durations.push(mins)

      // 📅 Only current month
      if (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      ) {
        monthlyTotal += mins
      }
    })

  const avg =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0

  return {
    total,
    active,
    avg,
    monthlyTotal: Math.round(monthlyTotal), // minutes
  }
}, [data])

  // 🔍 Filtering
  const filtered = useMemo(() => {
    return data.filter(entry => {
      const isActive = !entry.exit_time

      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'completed' && isActive) return false

      if (search) {
        return new Date(entry.entry_time)
          .toLocaleString()
          .toLowerCase()
          .includes(search.toLowerCase())
      }

      return true
    })
  }, [data, search, statusFilter])

  function formatDate(date: string) {
    return new Date(date).toLocaleString()
  }
  function formatTotalTime(mins: number) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  function getDuration(entry: any) {
    if (!entry.exit_time) return '—'
    const start = new Date(entry.entry_time).getTime()
    const end = new Date(entry.exit_time).getTime()
    const mins = Math.round((end - start) / (1000 * 60))
    return `${mins} min`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Gym History
        </CardTitle>
        <CardDescription>Track your sessions & activity</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 📊 Analytics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Total Visits</p>
            <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Active</p>
            <p className="text-lg sm:text-xl font-bold">{stats.active}</p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Avg Duration</p>
            <p className="text-lg sm:text-xl font-bold">{stats.avg} <span className="text-xs font-medium text-muted-foreground">min</span></p>
          </div>
          
          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">This Month</p>
            <p className="text-lg sm:text-xl font-bold">{formatTotalTime(stats.monthlyTotal)}</p>
          </div>
        </div>

        {/* 🔍 Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background focus:bg-background/80 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' }
            ].map((f) => (
              <Button
                key={f.id}
                variant={statusFilter === f.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(f.id as any)}
                className="rounded-xl transition-all"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 📋 List */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No results found</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((entry) => {
              const isActive = !entry.exit_time

              return (
                <div
                  key={entry.entry_id}
                  className="flex flex-col p-4 border rounded-lg hover:bg-muted/40 transition gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium break-words text-base leading-tight flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Gym Session
                    </h4>
                    <Badge variant={isActive ? 'default' : 'outline'} className="shrink-0 mt-0.5">
                      {isActive ? 'Active Now' : 'Completed'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                    <p className="text-xs text-muted-foreground flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold">In:</span> 
                      <span>{formatDate(entry.entry_time)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold">Out:</span> 
                      <span>{entry.exit_time ? formatDate(entry.exit_time) : '—'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground sm:col-span-2 pt-1 border-t border-border/30 mt-1">
                      <span className="font-semibold">Duration:</span> {getDuration(entry)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}