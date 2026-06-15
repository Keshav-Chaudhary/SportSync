'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoanStats {
  total_active: number
  total_overdue: number
  total_returned: number
  avg_loan_duration: number
}

export function AdminLoanTracking() {
  const [stats, setStats] = useState<LoanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLoanStats()
  }, [])

  async function fetchLoanStats() {
    try {
      const res = await fetch('/api/admin/loans')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        setError('Failed to fetch loan statistics')
      }
    } catch (err) {
      setError('Error fetching loan data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Tracking</CardTitle>
        <CardDescription>Equipment lending statistics</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{stats.total_active}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.total_overdue}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Returned</p>
              <p className="text-2xl font-bold">{stats.total_returned}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{stats.avg_loan_duration} days</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
