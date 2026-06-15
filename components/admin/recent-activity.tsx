'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Loader2, Package, Activity } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'loan' | 'gym'
  description: string
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  async function fetchActivity() {
    const supabase = createClient()
    
    const [loansRes, gymRes] = await Promise.all([
      supabase
        .from('equipment_loans')
        .select(`
          loan_id,
          borrow_date,
          status,
          equipment(name),
          user_accounts!equipment_loans_user_id_fkey(
            students(first_name, last_name),
            staff(first_name, last_name)
          )
        `)
        .order('borrow_date', { ascending: false })
        .limit(5),
      supabase
        .from('gym_entries')
        .select(`
          entry_id,
          check_in_time,
          check_out_time,
          user_accounts!gym_entries_user_id_fkey(
            students(first_name, last_name),
            staff(first_name, last_name)
          )
        `)
        .order('check_in_time', { ascending: false })
        .limit(5),
    ])

    const loanActivities: ActivityItem[] = (loansRes.data || []).map((loan) => {
      const user = loan.user_accounts
      const student = (user as { students?: { first_name: string; last_name: string }[] })?.students?.[0]
      const staff = (user as { staff?: { first_name: string; last_name: string }[] })?.staff?.[0]
      const name = student 
        ? `${student.first_name} ${student.last_name}`
        : staff 
        ? `${staff.first_name} ${staff.last_name}`
        : 'Unknown'
      
      return {
        id: `loan-${loan.loan_id}`,
        type: 'loan' as const,
        description: `${name} borrowed ${(loan.equipment as { name: string } | null)?.name || 'equipment'}`,
        timestamp: loan.borrow_date,
      }
    })

    const gymActivities: ActivityItem[] = (gymRes.data || []).map((entry) => {
      const user = entry.user_accounts
      const student = (user as { students?: { first_name: string; last_name: string }[] })?.students?.[0]
      const staff = (user as { staff?: { first_name: string; last_name: string }[] })?.staff?.[0]
      const name = student 
        ? `${student.first_name} ${student.last_name}`
        : staff 
        ? `${staff.first_name} ${staff.last_name}`
        : 'Unknown'
      
      return {
        id: `gym-${entry.entry_id}`,
        type: 'gym' as const,
        description: entry.check_out_time 
          ? `${name} checked out of gym`
          : `${name} checked into gym`,
        timestamp: entry.check_out_time || entry.check_in_time,
      }
    })

    const combined = [...loanActivities, ...gymActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)

    setActivities(combined)
    setLoading(false)
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'loan' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-accent/20 text-accent'
                }`}>
                  {activity.type === 'loan' ? (
                    <Package className="h-3 w-3" />
                  ) : (
                    <Activity className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
