import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Clock, CheckCircle2, LogIn } from 'lucide-react'

export function StaffRecentActivity({ activities }: { activities: any[] }) {
  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          My Recent Actions
        </CardTitle>
        <CardDescription>Latest gym check-ins and check-outs handled by you</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No recent activity found</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              // Determine if this represents a checkout or checkin
              // We sort by COALESCE(exit_time, entry_time) in the SQL query
              // If it has an exit time, we highlight the exit action
              const isCheckedOut = !!activity.exit_time
              
              return (
                <div key={activity.entry_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold text-sm truncate">{activity.student_name}</span>
                      <span className="text-xs text-muted-foreground">({activity.roll_no})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-medium">
                      {isCheckedOut ? (
                        <>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Checked Out
                          </Badge>
                          <span className="text-muted-foreground">{formatTime(activity.exit_time)}</span>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                            <LogIn className="w-3 h-3 mr-1" />
                            Checked In
                          </Badge>
                          <span className="text-muted-foreground">{formatTime(activity.entry_time)}</span>
                        </>
                      )}
                      <span className="text-muted-foreground/50">•</span>
                      <span className="text-muted-foreground">{formatDate(isCheckedOut ? activity.exit_time : activity.entry_time)}</span>
                    </div>
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
