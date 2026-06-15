'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Loader2, User, Clock, MapPin } from 'lucide-react'

interface GymEntry {
  entry_id: number
  student_id: string
  recorded_by: number
  entry_time: string
  exit_time: string | null
  student?: { name: string; roll_no: string }
}

export function GymActivityLog() {
  const [entries, setEntries] = useState<GymEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch('/api/gym-entries/log')
        if (!res.ok) throw new Error('Failed to fetch entries')
        const data = await res.json()
        setEntries(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load gym entries:', err)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
    // Refresh every 10 seconds
    const interval = setInterval(fetchEntries, 10000)
    return () => clearInterval(interval)
  }, [])

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  function getDuration(entryTime: string, exitTime: string | null) {
    if (!exitTime) return null
    const start = new Date(entryTime)
    const end = new Date(exitTime)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const activeEntries = entries.filter((e) => !e.exit_time)
  const recentCheckouts = entries.filter((e) => e.exit_time).slice(0, 10)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Currently Inside Gym
          </CardTitle>
          <CardDescription>Students who are currently in the gym</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeEntries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No students inside</p>
          ) : (
            <div className="space-y-3">
              {activeEntries.map((entry) => {
                const now = new Date()
                const entryTime = new Date(entry.entry_time)
                const diff = now.getTime() - entryTime.getTime()
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

                return (
                  <div key={entry.entry_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/50 bg-background/50 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-foreground break-words text-base leading-tight flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {entry.student?.name || entry.student_id}
                        </h4>
                        <Badge variant="default" className="shrink-0 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                          Active Now
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 p-2 rounded-lg w-fit">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>In: {formatTime(entry.entry_time)}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{formatDate(entry.entry_time)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/30 sm:border-0 mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                      <div className="text-xs text-muted-foreground mb-1">Duration</div>
                      <Badge variant="secondary" className="font-mono text-sm">{duration}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Check-Outs</CardTitle>
          <CardDescription>Recent student exits from the gym</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentCheckouts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No recent check-outs</p>
          ) : (
            <div className="space-y-3">
              {recentCheckouts.map((entry) => (
                <div key={entry.entry_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/50 bg-background/50 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-foreground break-words text-base leading-tight flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {entry.student?.name || entry.student_id}
                      </h4>
                      <Badge variant="secondary" className="shrink-0">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 p-2 rounded-lg w-fit">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>In: {formatTime(entry.entry_time)}</span>
                      <span className="text-muted-foreground/50">→</span>
                      <span>Out: {formatTime(entry.exit_time!)}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{formatDate(entry.entry_time)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/30 sm:border-0 mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                    <div className="text-xs text-muted-foreground mb-1">Session Length</div>
                    <Badge variant="outline" className="font-mono text-sm">{getDuration(entry.entry_time, entry.exit_time)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
