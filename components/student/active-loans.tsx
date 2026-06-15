'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react'

interface Loan {
  loan_id: number
  equipment_id: number
  student_id: string
  quantity: number
  issued_by: number
  issued_at: string
  due_date: string
  returned_at: string | null
  returned_by: number | null
  status: string
  name?: string
}

interface ActiveLoansProps {
  userId: string
}

export function ActiveLoans({ userId }: ActiveLoansProps) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    console.log('ActiveLoans component mounted with userId:', userId)
    setLoading(true)
    fetchLoans()
  }, [userId])

  async function fetchLoans() {
    try {
      const url = `/api/loans?userId=${userId}`
      console.log('Fetching loans from:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setLoans([])
        setError(`API Error: ${errorData.error || 'Unknown error'}`)
        return
      }
      
      const data = await response.json()
      console.log('Loans data received:', data)
      
      if (Array.isArray(data)) {
        console.log('Data is array, length:', data.length)
        setLoans(data)
      } else {
        console.warn('Data is not an array:', data)
        setLoans([])
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoans([])
    }
    setLoading(false)
  }

  function isOverdue(dueDate: string) {
    return new Date(dueDate) < new Date()
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Active Loans
        </CardTitle>
        <CardDescription>Equipment you currently have borrowed</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You have no active loans</p>
            <p className="text-sm">Browse equipment above to borrow items</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.loan_id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-foreground break-words text-base leading-tight">
                      {loan.name || 'Unknown Equipment'}
                    </h4>
                    <Badge variant={isOverdue(loan.due_date) ? 'destructive' : 'secondary'} className="shrink-0">
                      {isOverdue(loan.due_date) ? 'Overdue' : loan.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Due: {formatDate(loan.due_date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Borrowed: {formatDate(loan.issued_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
