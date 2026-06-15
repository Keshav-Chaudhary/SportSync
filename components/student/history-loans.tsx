'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, AlertCircle, History, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HistoryLoans({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 🔍 Filters
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<'all' | '30' | '7'>('all')

  useEffect(() => {
    fetchData()
  }, [userId])

  async function fetchData() {
    try {
      const res = await fetch(`/api/loans/history?userId=${userId}`)

      if (!res.ok) {
        const err = await res.json()
        setError(err.error)
        return
      }

      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch (e: any) {
      setError(e.message)
    }

    setLoading(false)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function getDuration(loan: any) {
    if (!loan.returned_at) return '—'
    const start = new Date(loan.issued_at).getTime()
    const end = new Date(loan.returned_at).getTime()
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  function isOverdue(loan: any) {
    if (!loan.returned_at) return false
    return new Date(loan.returned_at) > new Date(loan.due_date)
  }

  // 📊 Analytics
  const stats = useMemo(() => {
    const total = data.length

    const durations = data
      .filter(l => l.returned_at)
      .map(l => {
        const start = new Date(l.issued_at).getTime()
        const end = new Date(l.returned_at).getTime()
        return (end - start) / (1000 * 60 * 60 * 24)
      })

    const avg =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0

    const overdue = data.filter(isOverdue).length

    return { total, avg, overdue }
  }, [data])

  // 🔍 Filtering
  const filtered = useMemo(() => {
    return data.filter(loan => {
      // search
      if (search && !loan.name?.toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      // date range
      if (range !== 'all') {
        const days = parseInt(range)
        const date = new Date(loan.issued_at)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)

        if (date < cutoff) return false
      }

      return true
    })
  }, [data, search, range])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Loan History
        </CardTitle>
        <CardDescription>Track your past borrowed equipment</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 📊 Analytics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Total Loans</p>
            <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Avg Time</p>
            <p className="text-lg sm:text-xl font-bold">{stats.avg} <span className="text-xs font-medium text-muted-foreground">days</span></p>
          </div>

          <div className="p-2 sm:p-3 border rounded-lg text-center flex flex-col justify-center bg-card/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Overdue</p>
            <p className="text-lg sm:text-xl font-bold text-destructive">{stats.overdue}</p>
          </div>
        </div>

        {/* 🔍 Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background focus:bg-background/80 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', '30', '7'].map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r as any)}
                className="rounded-xl transition-all"
              >
                {r === 'all' ? 'All Time' : `Last ${r} Days`}
              </Button>
            ))}
          </div>
        </div>

        {/* 📋 List */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">No results found</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((loan) => {
              const overdue = isOverdue(loan)

              return (
                <div
                  key={loan.loan_id}
                  className="flex flex-col p-4 border rounded-lg hover:bg-muted/40 transition gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium break-words text-base leading-tight">
                      {loan.name || 'Unknown Equipment'}
                    </h4>
                    <Badge variant={overdue ? 'destructive' : 'outline'} className="shrink-0 mt-0.5">
                      {overdue ? 'Overdue' : 'Returned'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                    <p className="text-xs text-muted-foreground flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold">Borrowed:</span> 
                      <span>{formatDate(loan.issued_at)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold">Returned:</span> 
                      <span>{formatDate(loan.returned_at)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground sm:col-span-2 pt-1 border-t border-border/30 mt-1">
                      <span className="font-semibold">Duration:</span> {getDuration(loan)}
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