'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ClipboardList, AlertCircle, Loader2, CheckCircle2, Clock, User, Package } from 'lucide-react'

interface EquipmentLoan {
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
  equipment?: { name: string }
  student?: { name: string }
}

export function LoanManagement() {
  const [loans, setLoans] = useState<EquipmentLoan[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [loading, setLoading] = useState(true)
  const [returning, setReturning] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchLoans()
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchLoans, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchLoans() {
    try {
      const res = await fetch('/api/loans?all=true')
      if (!res.ok) throw new Error('Failed to fetch loans')
      const data = await res.json()
      setLoans(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load loans')
      setLoans([])
    } finally {
      setLoading(false)
    }
  }

  const displayedLoans = loans.filter((l) => 
    activeTab === 'active' 
      ? l.status === 'ISSUED' || l.status === 'OVERDUE' 
      : l.status === 'RETURNED' || l.status === 'CANCELLED'
  )

  async function handleReturnEquipment(loanId: number) {
    setReturning(loanId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to process return')
      }

      const data = await response.json()
      setSuccess('Equipment returned successfully')
      
      // Refresh loans immediately
      await fetchLoans()

      // Also refresh equipment inventory in the Issue Equipment panel
      window.dispatchEvent(new Event('equipment-updated'))
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process return'
      setError(errorMsg)
      console.error('Return error:', errorMsg)
    } finally {
      setReturning(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function isOverdue(dueDate: string) {
    return new Date(dueDate) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Loan Management
        </CardTitle>
        <CardDescription>Track and process equipment returns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4 border-b border-border/30 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-xl transition-all border shrink-0 ${activeTab === 'active' ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
          >
            Active & Overdue
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-xl transition-all border shrink-0 ${activeTab === 'history' ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
          >
            Loan History
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : displayedLoans.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              {activeTab === 'active' ? 'No active loans' : 'No loan history'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
              {displayedLoans.map((loan) => (
                <div key={loan.loan_id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-background/50 shadow-sm hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-foreground truncate flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {loan.student?.name || loan.student_id}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                         <Package className="w-3.5 h-3.5" />
                         {loan.equipment?.name || 'Unknown'} (Qty: {loan.quantity})
                      </div>
                    </div>
                    <Badge variant={loan.status === 'OVERDUE' ? 'destructive' : loan.status === 'RETURNED' ? 'secondary' : 'default'} className="shrink-0 text-[10px] px-1.5 py-0">
                      {loan.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-card/50 p-2 rounded-lg border border-border/30">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <div>
                        <span className="font-bold text-foreground/80 block">Issued</span>
                        {formatDate(loan.issued_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <span className="font-bold text-foreground/80 block">{loan.status === 'RETURNED' ? 'Returned' : 'Due'}</span>
                        {loan.status === 'RETURNED' && loan.returned_at ? (
                           formatDate(loan.returned_at)
                        ) : (
                           <>
                             {formatDate(loan.due_date)}
                             {isOverdue(loan.due_date) && <span className="text-red-500 font-bold ml-1">OVERDUE</span>}
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {activeTab === 'active' && (
                    <div className="pt-2 flex justify-end border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleReturnEquipment(loan.loan_id)}
                        disabled={returning === loan.loan_id}
                        className="w-full sm:w-auto h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 transition-colors"
                      >
                        {returning === loan.loan_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Process Return
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
