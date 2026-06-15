'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, AlertCircle, CheckCircle2, Database, Lock, RotateCcw } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface QueryResult {
  success: boolean
  queryName?: string
  description?: string
  sql?: string
  results?: Array<{ statement: string; result: any[] }>
  lastResult?: any[]
  affectedRows?: number
  error?: string
  sqlState?: string
  errno?: number
}

const DEMO_QUERIES = [
  {
    id: 'basic-commit',
    name: 'Basic Commit',
    icon: CheckCircle2,
    color: 'bg-foreground/10 text-foreground',
    description: 'Successful loan transaction',
    acid: 'Durability'
  },
  {
    id: 'rollback-demo',
    name: 'Rollback Demo',
    icon: RotateCcw,
    color: 'bg-muted text-muted-foreground',
    description: 'Undo changes with ROLLBACK',
    acid: 'Atomicity'
  },
  {
    id: 'trigger-failure',
    name: 'Trigger Failure',
    icon: AlertCircle,
    color: 'bg-foreground/5 text-foreground/70',
    description: 'Insufficient stock constraint',
    acid: 'Consistency'
  },
  {
    id: 'row-lock',
    name: 'Row Lock',
    icon: Lock,
    color: 'bg-foreground/10 text-foreground',
    description: 'FOR UPDATE locking',
    acid: 'Isolation'
  },
  {
    id: 'return-equipment',
    name: 'Return Equipment',
    icon: CheckCircle2,
    color: 'bg-muted text-foreground',
    description: 'Update loan status',
    acid: 'Consistency'
  },
  {
    id: 'non-repeatable-read',
    name: 'Non-repeatable Read',
    icon: Database,
    color: 'bg-foreground/5 text-foreground/80',
    description: 'Isolation level demo',
    acid: 'Isolation'
  },
  {
    id: 'phantom-read',
    name: 'Phantom Read',
    icon: Database,
    color: 'bg-foreground/10 text-foreground',
    description: 'Phantom anomaly demo',
    acid: 'Isolation'
  },
  {
    id: 'foreign-key-failure',
    name: 'Foreign Key Failure',
    icon: AlertCircle,
    color: 'bg-muted text-muted-foreground',
    description: 'Invalid reference error',
    acid: 'Consistency'
  },
  {
    id: 'multiple-operations',
    name: 'Multiple Ops',
    icon: Play,
    color: 'bg-foreground/10 text-foreground',
    description: 'Combined UPDATE + INSERT',
    acid: 'Atomicity'
  },
  {
    id: 'check-triggers',
    name: 'Check Triggers',
    icon: Database,
    color: 'bg-muted text-foreground',
    description: 'Verify DB triggers exist',
    acid: 'Diagnostic'
  },
  {
    id: 'cleanup-test-data',
    name: 'Cleanup Data',
    icon: RotateCcw,
    color: 'bg-foreground/5 text-muted-foreground',
    description: 'Remove test loans & reset',
    acid: 'Atomicity'
  }
]

export function SQLPlayground() {
  const [selectedQuery, setSelectedQuery] = useState<string>('')
  const [customSql, setCustomSql] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<QueryResult[]>([])

  const executeQuery = async (queryId?: string, sql?: string) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/sql-playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryId: queryId || null,
          customSql: sql || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setExecutionHistory(prev => [data, ...prev.slice(0, 9)]) // Keep last 10
      } else {
        setResult({
          success: false,
          error: data.error || 'Query execution failed',
          sqlState: data.sqlState,
          errno: data.errno
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error or server unavailable'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoQuery = (queryId: string) => {
    setSelectedQuery(queryId)
    executeQuery(queryId)
  }

  const handleCustomQuery = () => {
    if (!customSql.trim()) return
    executeQuery(undefined, customSql)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Playground & Transaction Simulator
          </CardTitle>
          <CardDescription>
            Execute predefined transaction queries and explore database concurrency concepts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Queries Grid */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Transaction Demos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {DEMO_QUERIES.map((query) => {
                const Icon = query.icon
                return (
                  <Button
                    key={query.id}
                    variant={selectedQuery === query.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-2 w-full overflow-hidden"
                    onClick={() => handleDemoQuery(query.id)}
                    disabled={loading}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium text-center truncate w-full block">{query.name}</span>
                    <Badge variant="secondary" className={`text-xs ${query.color} whitespace-normal text-center h-auto w-full inline-block leading-tight`}>
                      {query.description}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em] text-current border-current/50 shrink-0 truncate max-w-full">
                      {query.acid}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Custom Query */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Custom SELECT Query</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="Enter a SELECT query (e.g., SELECT * FROM EQUIPMENT LIMIT 5)"
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                className="font-mono text-sm"
                rows={4}
              />
              <Button
                onClick={handleCustomQuery}
                disabled={loading || !customSql.trim()}
                className="w-full md:w-auto"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Execute Custom Query
              </Button>
            </div>
          </div>

          {/* Current Result */}
          {result && (
            <div className="w-full overflow-hidden">
              <h3 className="text-lg font-semibold mb-4">Query Result</h3>
              <Card className="w-full overflow-hidden">
                <CardContent className="pt-6 w-full">
                  {result.success ? (
                    <div className="space-y-4 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <span className="font-semibold text-green-700">Success</span>
                        {result.affectedRows !== undefined && (
                          <Badge variant="outline">
                            {result.affectedRows} row{result.affectedRows !== 1 ? 's' : ''} affected
                          </Badge>
                        )}
                      </div>
                      {result.queryName && (
                        <div>
                          <p className="font-medium">{result.queryName}</p>
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      )}
                      {result.sql && (
                        <div className="w-full overflow-hidden">
                          <p className="text-sm font-medium mb-2">Executed SQL:</p>
                          <pre className="bg-gray-50 dark:bg-card p-3 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words w-full border border-border/50">
                            {result.sql}
                          </pre>
                        </div>
                      )}
                      {result.results && result.results.length > 0 && (
                        <div className="space-y-4 w-full">
                          {result.results.map((stmtResult, index) => (
                            <div key={index} className="border rounded p-3 overflow-hidden w-full">
                              <p className="text-sm font-medium mb-2">Statement {index + 1}:</p>
                              <pre className="bg-gray-50 dark:bg-card p-2 rounded text-xs font-mono mb-2 overflow-x-auto whitespace-pre-wrap break-words w-full border border-border/50">
                                {stmtResult.statement}
                              </pre>
                              {Array.isArray(stmtResult.result) && stmtResult.result.length > 0 ? (
                                <div>
                                  <p className="text-sm font-medium mb-2">Result:</p>
                                  <ScrollArea className="h-32 w-full border rounded">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b bg-gray-50">
                                          {Object.keys(stmtResult.result[0]).map((key) => (
                                            <th key={key} className="text-left p-2 font-medium">
                                              {key}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {stmtResult.result.slice(0, 10).map((row: any, rowIndex: number) => (
                                          <tr key={rowIndex} className="border-b">
                                            {Object.values(row).map((value: any, i: number) => (
                                              <td key={i} className="p-2">
                                                {value?.toString() || 'NULL'}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                        {stmtResult.result.length > 10 && (
                                          <tr>
                                            <td colSpan={Object.keys(stmtResult.result[0]).length} className="p-2 text-center text-muted-foreground">
                                              ... and {stmtResult.result.length - 10} more rows
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </ScrollArea>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {stmtResult.result?.affectedRows ? `${stmtResult.result.affectedRows} rows affected` : 'No result data'}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">Query Failed</p>
                          <p>{result.error}</p>
                          {result.sqlState && (
                            <p className="text-xs">SQL State: {result.sqlState}</p>
                          )}
                          {result.errno && (
                            <p className="text-xs">Error Code: {result.errno}</p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Executions</h3>
              <div className="space-y-2">
                {executionHistory.map((hist, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => setResult(hist)}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {hist.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{hist.queryName || 'Custom Query'}</span>
                        </div>
                        <Badge variant={hist.success ? "default" : "destructive"}>
                          {hist.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}