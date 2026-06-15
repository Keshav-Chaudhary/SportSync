import { pool } from '@/lib/db/mysql'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export async function AdminTriggerOverview() {
  const [triggerRows] = await pool.query(
    `SELECT
      TRIGGER_NAME,
      EVENT_OBJECT_TABLE AS tableName,
      EVENT_MANIPULATION AS eventType,
      ACTION_TIMING AS timing,
      ACTION_ORIENTATION AS orientation,
      ACTION_STATEMENT AS statement
    FROM information_schema.TRIGGERS
    WHERE TRIGGER_SCHEMA = DATABASE()
    ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME`
  ) as any

  const triggers = Array.isArray(triggerRows) ? triggerRows : []

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Database Triggers</CardTitle>
        <CardDescription>List of SQL triggers defined in the active database.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {triggers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No triggers found in the current database.</p>
        ) : (
          <div className="space-y-3">
            {triggers.map((trigger: any) => (
              <details key={trigger.TRIGGER_NAME} className="group rounded-lg border border-border bg-card p-4 transition shadow-sm hover:shadow-md">
                <summary className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer list-none text-left">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{trigger.TRIGGER_NAME}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      Table: {trigger.tableName} · Event: {trigger.eventType}
                    </p>
                  </div>
                  <Badge variant="secondary" className="uppercase text-[10px] tracking-[0.2em] shrink-0 mt-0.5 sm:mt-0">
                    {trigger.eventType}
                  </Badge>
                </summary>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-md bg-muted p-3">
                    <p className="font-medium">Trigger Body</p>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs font-mono text-muted-foreground">
                      {trigger.statement || 'No trigger body available.'}
                    </pre>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-border p-3 bg-background">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Table</p>
                      <p className="font-medium">{trigger.tableName}</p>
                    </div>
                    <div className="rounded-md border border-border p-3 bg-background">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Timing / Orientation</p>
                      <p className="font-medium">{trigger.timing} · {trigger.orientation}</p>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
