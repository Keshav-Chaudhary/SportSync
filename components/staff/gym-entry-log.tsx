'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, LogIn, LogOut, Loader2, Clock } from 'lucide-react'

interface GymEntry {
  entry_id: number
  student_id: string
  entry_time: string
  exit_time: string | null
}

export function GymEntryLog() {

        const [entries, setEntries] = useState<GymEntry[]>([])
        const [loading, setLoading] = useState(true)
        const [searchRollNo, setSearchRollNo] = useState('')
        const [checkingIn, setCheckingIn] = useState(false)
        const [checkingOut, setCheckingOut] = useState<number | null>(null)
        const [checkInError, setCheckInError] = useState('')
        const router = useRouter()


  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const response = await fetch('/api/gym-entries/log')
      const data = response.ok ? await response.json() : []
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching entries:', error)
      setEntries([])
    }
    setLoading(false)
  }

  async function handleCheckIn() {
    if (!searchRollNo.trim()) return
    
    setCheckingIn(true)
    try {
      const response = await fetch('/api/gym-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: searchRollNo }),
      })


      if (response.ok) {
        fetchEntries()
        setSearchRollNo('')
        router.refresh()
        setCheckInError('')
      } else {
        const errorData = await response.json()
        setCheckInError(errorData.error || 'Unknown error occurred')
      }

    } catch (error) {
      console.error('Check in error:', error)
      alert('Failed to check in student')
    }
    setCheckingIn(false)
  }

  async function handleCheckOut(entryId: number) {
    setCheckingOut(entryId)
    try {
      const response = await fetch(`/api/gym-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        fetchEntries()
        router.refresh()
      }
    } catch (error) {
      console.error('Check out error:', error)
      alert('Failed to check out student')
    }
    setCheckingOut(null)
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getElapsedTime(entryTime: string, exitTime: string | null) {
    const end = exitTime ? new Date(exitTime) : new Date()
    const start = new Date(entryTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const activeEntries = entries.filter(e => !e.exit_time)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Gym Entry Management
        </CardTitle>
        <CardDescription>Log student gym entries and exits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Check In Form */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">

          <h3 className="font-semibold">Check In Student</h3>
          {checkInError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg relative">
              <button
                onClick={() => setCheckInError('')}
                className="absolute right-2 top-2 text-destructive hover:text-destructive/80 w-5 h-5"
              >
                ×
              </button>
              <p className="text-sm font-mono text-destructive whitespace-pre-wrap">{checkInError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                placeholder="Enter student roll number"
                value={searchRollNo}
                onChange={(e) => setSearchRollNo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn || !searchRollNo.trim()}
              >
                {checkingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Check In
              </Button>
            </div>
          </div>
        </div>


        {/* Active Entries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Currently Inside ({activeEntries.length})</h3>
            <Badge variant="default">{activeEntries.length}</Badge>
          </div>

          {activeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students currently in gym</p>
          ) : (
            <div className="space-y-2">
              {activeEntries.map((entry) => (
                <div
                  key={entry.entry_id}
                  className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">{entry.student_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Since {formatTime(entry.entry_time)} ({getElapsedTime(entry.entry_time, null)})
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCheckOut(entry.entry_id)}
                    disabled={checkingOut === entry.entry_id}
                    size="sm"
                    variant="destructive"
                  >
                    {checkingOut === entry.entry_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Check Outs */}
        {entries.filter(e => e.exit_time).length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Recent Check Outs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Recent Check Outs</DialogTitle>
                <DialogDescription>Recently checked out students</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {entries
                  .filter(e => e.exit_time)
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.entry_id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{entry.student_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(entry.entry_time)} - {formatTime(entry.exit_time!)} ({getElapsedTime(entry.entry_time, entry.exit_time)})
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
