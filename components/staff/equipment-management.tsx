'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Package, AlertCircle, Loader2 } from 'lucide-react'

interface Equipment {
  equipment_id: number
  name: string
  category_id: number
  total_quantity: number
  available_quantity: number
  category?: { name: string }
}

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [studentRollNo, setStudentRollNo] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchEquipment()

    const onEquipmentUpdated = () => {
      fetchEquipment()
    }

    window.addEventListener('equipment-updated', onEquipmentUpdated)
    return () => window.removeEventListener('equipment-updated', onEquipmentUpdated)
  }, [])

  async function fetchEquipment() {
    try {
      const res = await fetch('/api/equipment')
      if (!res.ok) throw new Error('Failed to fetch equipment')
      const data = await res.json()
      setEquipment(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load equipment')
      setEquipment([])
    } finally {
      setLoading(false)
    }
  }

  async function handleIssueEquipment() {
    if (!studentRollNo || !selectedEquipment || quantity < 1) {
      setError('Please fill all fields')
      return
    }

    setIssuing(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: selectedEquipment.equipment_id,
          student_id: studentRollNo,
          quantity: parseInt(quantity.toString()),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to issue equipment')
      }

      setSuccess(`Equipment issued successfully to ${studentRollNo}`)
      setStudentRollNo('')
      setSelectedEquipment(null)
      setQuantity(1)
      fetchEquipment()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue equipment')
    } finally {
      setIssuing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Issue Equipment
        </CardTitle>
        <CardDescription>Issue sports equipment to students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">


            {error && (
              <Alert variant="destructive" className="font-mono relative">
                <AlertCircle className="h-4 w-4" />
                <button
                  onClick={() => setError('')}
                  className="absolute right-2 top-2 text-destructive hover:text-destructive/80 w-5 h-5"
                >
                  ×
                </button>
                <AlertDescription className="whitespace-pre-wrap font-mono">{error}</AlertDescription>
              </Alert>
            )}


          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="student">Student Roll Number</Label>
            <Input
              id="student"
              placeholder="e.g., 2023001"
              value={studentRollNo}
              onChange={(e) => setStudentRollNo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Available Equipment</Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : equipment.length === 0 ? (
              <p className="text-sm text-muted-foreground">No equipment available</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {equipment.map((item) => (
                  <button
                    key={item.equipment_id}
                    onClick={() => {
                      setSelectedEquipment(item)
                      setQuantity(1)
                    }}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedEquipment?.equipment_id === item.equipment_id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category?.name}</p>
                      </div>
                      <Badge variant={item.available_quantity > 0 ? 'default' : 'secondary'}>
                        {item.available_quantity}/{item.total_quantity}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedEquipment && (
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={selectedEquipment.available_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          <Button
            onClick={handleIssueEquipment}
            disabled={issuing || !studentRollNo || !selectedEquipment || quantity < 1}
            className="w-full"
          >
            {issuing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing...
              </>
            ) : (
              'Issue Equipment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
