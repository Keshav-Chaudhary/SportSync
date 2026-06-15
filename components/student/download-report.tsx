'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DownloadReport({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCount()
  }, [])

  async function fetchCount() {
    try {
      const res = await fetch(`/api/reports/count?userId=${userId}`)
      const data = await res.json()
      setCount(data.count || 0)
    } catch {
      setCount(0)
    }
  }

  async function handleDownload() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/reports/download?userId=${userId}`)

      if (!res.ok) {
        const err = await res.json()
        setError(err.error)
        return
      }

      // 🔥 Download file
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `gym-report-${Date.now()}.pdf`
      a.click()

      window.URL.revokeObjectURL(url)

      // update count
      setCount((prev) => prev + 1)
    } catch (e: any) {
      setError(e.message)
    }

    setLoading(false)
  }

  const remaining = 3 - count

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Report
        </CardTitle>
        <CardDescription>
          Get your last 7 days activity report (PDF)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            You can download up to <b>3 reports per day</b>.
          </p>
          <p className="text-sm mt-1">
            Remaining today: <b>{remaining}</b>
          </p>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Button */}
        <Button
          onClick={handleDownload}
          disabled={loading || remaining <= 0}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF Report
        </Button>

        {remaining <= 0 && (
          <p className="text-xs text-red-500 text-center">
            Daily limit reached. Try again tomorrow.
          </p>
        )}
      </CardContent>
    </Card>
  )
}