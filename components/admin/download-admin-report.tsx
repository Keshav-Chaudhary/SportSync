'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AdminDownloadReport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/export/pdf')

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const blob = await res.blob()
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `admin-complete-report-${timestamp}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Complete Report
        </CardTitle>
        <CardDescription>
          Export ALL system data (users, equipment, loans, gym entries) as PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={handleDownload} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Download Full System Report
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Includes complete tables from all 8 database tables
        </p>
      </CardContent>
    </Card>
  )
}

