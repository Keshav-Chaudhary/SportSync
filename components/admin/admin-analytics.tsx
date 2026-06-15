'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

import { StatsCard } from '@/components/dashboard/stats-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Activity, Package } from 'lucide-react'

// const ANALYTICS_URL = '/api/admin/analytics?gymLimit=2&loanLimit=2'
const ANALYTICS_URL = '/api/admin/analytics?gymLimit=5&loanLimit=5'

interface AnalyticsData {
  recentGymEntries?: Array<{
    entry_id: number
    student_id: string
    recorded_by: number
    entry_time: string
    exit_time: string | null
    created_at: string
  }>
  recentLoans?: Array<{
    loan_id: number
    equipment_id: number
    student_id: string
    quantity: number
    issued_by: number
    issued_at: string
    due_date: string
    returned_at: string | null
    returned_by: number | null
    status: 'ISSUED' | 'RETURNED' | 'OVERDUE'
    created_at: string
  }>
  dailyTrend: Array<{
    date: string
    gymVisits: number
    gymUsers: number
    loans: number
    overdue: number
  }>
  monthlyTrend: Array<{
    month: string
    gymVisits: number
    loans: number
    growth: number
  }>
  peakGymHours: Array<{
    hour: number
    avg_visits: number
  }>
  growthSummary: {
    gymWeekly: number
    loanWeekly: number
  }
  totals?: {
    totalGymUsers?: number
    totalLoans30d?: number
  }
}

function getCssVar(variable: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gymOpen, setGymOpen] = useState(false)
  const [loanOpen, setLoanOpen] = useState(false)

  const [colors, setColors] = useState({
    chart1: '#e07b39',
    chart2: '#3aa89e',
    chart3: '#4a6fa5'
  })

  useEffect(() => {
    setColors({
      chart1: `oklch(${getCssVar('--chart-1')})`,
      chart2: `oklch(${getCssVar('--chart-2')})`,
      chart3: `oklch(${getCssVar('--chart-3')})`
    })
  }, [])

  useEffect(() => {
    fetch(ANALYTICS_URL)
      .then(res => res.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load analytics')
        setLoading(false)
      })
  }, [])

  const totalsData = data?.totals || {}

  const totalGymUsers =
    totalsData.totalGymUsers ??
    data?.dailyTrend?.reduce((a, b) => a + (b.gymUsers || 0), 0) ??
    0

  const totalLoans =
    totalsData.totalLoans30d ??
    data?.dailyTrend?.reduce((a, b) => a + (b.loans || 0), 0) ??
    0

  const todayVisits =
    data?.dailyTrend?.[data.dailyTrend.length - 1]?.gymVisits || 0

  const monthlyVisits = data?.monthlyTrend?.[0]?.gymVisits || 0
  const target = 5000
  const progress = (monthlyVisits / target) * 100

  const growthGym = data?.growthSummary?.gymWeekly || 0
  const growthLoans = data?.growthSummary?.loanWeekly || 0

  const recentGymEntries = data?.recentGymEntries || []
  const recentLoansData = data?.recentLoans || []

  const [showFullGym, setShowFullGym] = useState(false)
  const [showFullLoan, setShowFullLoan] = useState(false)
  const [fullGymData, setFullGymData] = useState<any[]>([])
  const [fullLoanData, setFullLoanData] = useState<any[]>([])
  const [loadingFull, setLoadingFull] = useState(false)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-500">{error}</CardContent>
      </Card>
    )
  }

  if (!data) return null

  const loanStatusStyle = (status: string) => {
    if (status === 'RETURNED') return 'default'
    if (status === 'ISSUED') return 'secondary'
    return 'destructive'
  }

  const loanStatusLabel = (status: string) => {
    if (status === 'RETURNED') return 'Returned'
    if (status === 'ISSUED') return 'Active'
    return 'Overdue'
  }

  return (
    <div className="space-y-8">

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Gym Users"
          value={totalGymUsers.toLocaleString()}
          description="Unique users in last 30 days"
          icon={Users}
          trend={{ value: growthGym, isPositive: growthGym > 0 }}
        />
        <StatsCard
          title="Total Loans"
          value={totalLoans.toLocaleString()}
          description="Equipment loans in last 30 days"
          icon={Package}
          trend={{ value: growthLoans, isPositive: growthLoans > 0 }}
        />
        <StatsCard
          title="Today's Visits"
          value={todayVisits.toLocaleString()}
          description="Gym entries recorded today"
          icon={Activity}
        />
        <StatsCard
          title="Monthly Progress"
          value={`${monthlyVisits}/${target}`}
          description={`Towards ${target} target (${Math.round(progress)}%)`}
          icon={TrendingUp}
        />
      </div>

      {/* PROGRESS */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Visit Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{monthlyVisits.toLocaleString()} visits this month</span>
            <span>Target: {target.toLocaleString()}</span>
          </div>
          <Progress value={Math.min(progress, 100)} />
        </CardContent>
      </Card>

      {/* CHARTS */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-sm font-medium mb-1 text-muted-foreground">Daily Activity (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyTrend.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line 
                  dataKey="gymUsers" 
                  name="Gym Users" 
                  stroke="#2563eb"   // blue
                  dot={false} 
                  strokeWidth={2} 
                />

                <Line 
                  dataKey="loans" 
                  name="Loans" 
                  stroke="#16a34a"   // green
                  dot={false} 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium mb-1 text-muted-foreground">Busiest Hours</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.peakGymHours.slice(0, 10).map(h => ({ ...h, label: formatHour(h.hour) }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg_visits" name="Avg Visits" fill={colors.chart3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RECENT ACTIVITY */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        {/* Gym Entries */}
        <Card>
          <Collapsible open={gymOpen} onOpenChange={setGymOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Gym Check-ins</p>
                    <p className="text-xs text-muted-foreground">
                      Showing {showFullGym ? fullGymData.length : recentGymEntries.length} entries
                      <span className="mx-1">·</span>
                      <span className="font-medium text-foreground/80">Last 30 days</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{gymOpen ? 'Hide' : 'Show details'}</span>
                  {gymOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4 border-t">
                {recentGymEntries.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    No gym entries in the last 30 days.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead>Student</TableHead>
                            <TableHead>Checked In</TableHead>
                            <TableHead>Checked Out</TableHead>
                            <TableHead>Recorded By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(showFullGym ? fullGymData : recentGymEntries).map((entry) => (
                            <TableRow key={entry.entry_id}>
                              <TableCell className="font-medium">{entry.student_id}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(entry.entry_time).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {entry.exit_time
                                  ? new Date(entry.exit_time).toLocaleString()
                                  : <span className="text-amber-500 text-xs font-medium">Still inside</span>}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">#{entry.recorded_by}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {!showFullGym && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLoadingFull(true)
                          fetch('/api/admin/analytics?gymLimit=1000')
                            .then(res => res.json())
                            .then(json => {
                              setFullGymData(json.recentGymEntries || [])
                              setShowFullGym(true)
                              setLoadingFull(false)
                            })
                        }}
                        disabled={loadingFull}
                      >
                        {loadingFull ? 'Loading…' : 'Load all entries'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Loan History */}
        <Card>
          <Collapsible open={loanOpen} onOpenChange={setLoanOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Borrowed Equipment</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>
                        Showing {showFullLoan ? fullLoanData.length : recentLoansData.length} loans
                      </span>
                      <span>·</span>
                      <span className="font-medium text-foreground/80">Last 30 days</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{loanOpen ? 'Hide' : 'Show details'}</span>
                  {loanOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4 border-t">
                {recentLoansData.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">
                    No borrowed items in the last 30 days.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead>Student</TableHead>
                            <TableHead>Equipment</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead>Returned</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(showFullLoan ? fullLoanData : recentLoansData).map((loan) => (
                            <TableRow key={loan.loan_id}>
                              <TableCell className="font-medium">{loan.student_id}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">#{loan.equipment_id}</TableCell>
                              <TableCell className="font-semibold">{loan.quantity}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(loan.issued_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(loan.due_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {loan.returned_at
                                  ? new Date(loan.returned_at).toLocaleDateString()
                                  : <span className="text-muted-foreground/60">—</span>}
                              </TableCell>
                              <TableCell>
                                <Badge variant={loanStatusStyle(loan.status)} className="text-xs">
                                  {loanStatusLabel(loan.status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {!showFullLoan && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLoadingFull(true)
                          fetch('/api/admin/analytics?loanLimit=1000')
                            .then(res => res.json())
                            .then(json => {
                              setFullLoanData(json.recentLoans || [])
                              setShowFullLoan(true)
                              setLoadingFull(false)
                            })
                        }}
                        disabled={loadingFull}
                      >
                        {loadingFull ? 'Loading…' : 'Load all loans'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

    </div>
  )
}