'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const ANALYTICS_URL = '/api/staff/equipment-analytics'

// ✅ Read CSS variables at runtime so recharts SVG gets real color values
function getCssVar(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

interface AnalyticsData {
  topEquipment: { equipment: string; category: string; borrow_count: number }[]
  trend: { day: string; loans: number }[]
  overdueByCategory: { category: string; overdue_count: number }[]
  monthlyGymUsers: { month: string; users: number }[]
}

export function EquipmentAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Resolved at render time from your global CSS --chart-* vars
  const [colors, setColors] = useState({
    chart1: '#e07b39', // fallback only
    chart2: '#3aa89e',
    chart3: '#4a6fa5',
    chart4: '#c9a227',
    chart5: '#b85c38',
  })

  useEffect(() => {
    // Resolve actual computed values after mount (supports dark mode too)
    setColors({
      chart1: `oklch(${getCssVar('--chart-1')})`,
      chart2: `oklch(${getCssVar('--chart-2')})`,
      chart3: `oklch(${getCssVar('--chart-3')})`,
      chart4: `oklch(${getCssVar('--chart-4')})`,
      chart5: `oklch(${getCssVar('--chart-5')})`,
    })
  }, [])

  useEffect(() => {
    fetch(ANALYTICS_URL)
      .then(res => res.json())
      .then((json: AnalyticsData & { error?: string }) => {
        if (json.error) {
          setError(json.error)
        } else {
          setData({
            ...json,
            trend: (json.trend || []).map(row => ({
              ...row,
              day: row.day ? row.day.toString().slice(5) : row.day,
            })),
          })
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load analytics')
        setLoading(false)
        console.error(err)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Top Borrowed Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>

          {/* Daily Loans Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>

          {/* Overdue Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>

          {/* Monthly Users Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>

        </CardContent>
      </Card>
    )
  }
  if (error) return (
    <div className="p-6 text-center text-destructive">Error: {error}</div>
  )
  if (!data || data.topEquipment.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No borrowing history yet — issue some equipment!
        </CardContent>
      </Card>
    )
  }

  // ✅ chartConfig uses your --chart-* vars via shadcn's ChartContainer token system
  const chartConfig: Record<string, any> = {
    borrow_count: { label: 'Borrows',  color: 'var(--chart-1)' },
    loans:        { label: 'Loans',    color: 'var(--chart-2)' },
    overdue_count:{ label: 'Overdue',  color: 'var(--chart-3)' },
    users:        { label: 'Users',    color: 'var(--chart-4)' },
  }

  // Two alternating colors for bar chart — chart-1 and chart-2
  const BAR_COLORS = [colors.chart1, colors.chart2]

  // Pie slice colors — all 5 chart vars
  const PIE_COLORS = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          data.analytics
        </CardTitle>
        <span className="text-xs text-muted-foreground font-mono">Last 30 days</span>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* 1️⃣ Top Borrowed Equipment */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Top Borrowed
          </h3>
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px]">
            <BarChart data={data.topEquipment.slice(0, 6)}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis
                dataKey="equipment"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 9 }}
                height={80}
                angle={-45}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} />
              <Bar dataKey="borrow_count" radius={[4, 4, 0, 0]}>
                {data.topEquipment.slice(0, 6).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* 2️⃣ Daily Loans */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Daily Loans
          </h3>
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px]">
            <LineChart data={data.trend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(128,128,128,0.15)"
                vertical={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
              />
              <YAxis allowDecimals={false} />
              <Line
                type="monotone"
                dataKey="loans"
                stroke="#000"
                strokeWidth={2}
                dot={{ r: 3, fill: colors.chart2, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* 3️⃣ Overdue by Category */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Overdue by Category
          </h3>
          {data.overdueByCategory.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={data.overdueByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="overdue_count"
                  nameKey="category"
                >
                  {data.overdueByCategory.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm rounded-lg border">
              No overdue items 🎉
            </div>
          )}
        </div>

        {/* 4️⃣ Monthly Gym Users */}
        <div className="space-y-2">
          <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Monthly Gym Users
          </h3>
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px]">
            <BarChart data={data.monthlyGymUsers}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis allowDecimals={false} />
              <Bar
                dataKey="users"
                radius={[4, 4, 0, 0]}
                fill={colors.chart4}
              />
            </BarChart>
          </ChartContainer>
        </div>

      </CardContent>
    </Card>
  )
}