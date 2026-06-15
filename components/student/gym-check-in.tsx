'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, Users } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())
const OCCUPANCY_URL = '/api/gym/occupancy'

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getElapsedTime(startTime: string) {
  const now = new Date()
  const start = new Date(startTime)
  const diffMs = now.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

interface GymCheckInProps {
  userId: string
  isInGym: boolean
  currentEntry: {
    entry_id: string
    entry_time: string
  } | null
}

export function GymCheckIn({ userId, isInGym, currentEntry }: GymCheckInProps) {
  const { data: occupancyData, error: occupancyError } = useSWR(
    OCCUPANCY_URL,
    fetcher
  )

  const occupancy = occupancyData?.occupancy ?? 0
  const isLoading = !occupancyData && !occupancyError
  const capacity = 50
  const occupancyPercent = Math.min(100, Math.round((occupancy / capacity) * 100))

  return (
    <Card className="border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground font-bold">
          <Activity className="h-5 w-5 text-primary" />
          Gym Access Status
        </CardTitle>
        <CardDescription>Your current gym entry record and access status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center space-y-6">
          
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isInGym 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'bg-muted/50 text-muted-foreground border border-border/50'
            }`}>
              <Activity className="h-8 w-8 animate-pulse" />
            </div>

            <div>
              {isInGym ? (
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                    Currently Checked In
                  </span>
                  {currentEntry && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Entered at {formatTime(currentEntry.entry_time)}</span>
                      <span className="text-border">|</span>
                      <span>Active for {getElapsedTime(currentEntry.entry_time)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border/40">
                  Currently Checked Out
                </span>
              )}
            </div>
          </div>

          <div className="w-full pt-6 border-t border-border/30 space-y-3">
            {/* Occupancy Header */}
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>Live Facility Occupancy</span>
              </div>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live
              </span>
            </div>

            {/* Main Display */}
            {isLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse py-2 text-left font-mono">
                connecting.facility.sensor...
              </div>
            ) : occupancyError ? (
              <div className="text-sm text-rose-500 py-2 text-left">
                Failed to retrieve live sensor occupancy data.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Big Number & Stats */}
                <div className="flex items-end justify-between">
                  <div className="flex items-end gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">
                      {occupancy}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground mb-1">
                      students inside
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {occupancyPercent}% capacity
                  </span>
                </div>

                {/* Clean continuous progress bar */}
                <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Capacity Limit: {capacity}</span>
                  <span>{capacity - occupancy} slots available</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Staff members record your entry and exit at the front desk. Please coordinate with the attendant at the entrance.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
