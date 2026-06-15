'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Users, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SystemStats {
  total_users: number
  total_students: number
  total_staff: number
  total_admins: number
  system_health: 'healthy' | 'warning' | 'critical'
}

export function AdminSystemOverview() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSystemStats()
  }, [])

  async function fetchSystemStats() {
    try {
      const res = await fetch('/api/admin/system')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || `Failed to fetch system statistics (${res.status})`)
      }
    } catch (err) {
      setError('Error fetching system data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>Overall system health and user statistics</CardDescription>
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
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-4">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                </div>
              </div>
              <Badge variant="outline">Total</Badge>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-transparent dark:border-blue-900/20">
                <span className="text-sm">Students</span>
                <span className="font-semibold">{stats.total_students}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-transparent dark:border-purple-900/20">
                <span className="text-sm">Staff Members</span>
                <span className="font-semibold">{stats.total_staff}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-transparent dark:border-indigo-900/20">
                <span className="text-sm">Administrators</span>
                <span className="font-semibold">{stats.total_admins}</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-lg font-semibold capitalize mt-1">{stats.system_health}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(stats.system_health)}`}>
                  {stats.system_health === 'healthy' && <CheckCircle2 className="inline h-4 w-4 mr-1" />}
                  {stats.system_health}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
