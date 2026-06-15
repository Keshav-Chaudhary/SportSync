'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle, Package } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CategoryStats {
  category_id: number
  category_name: string
  total_items: number
  total_quantity: number
  available_quantity: number
  utilization_percent: number
}

export function AdminEquipmentOverview() {
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEquipmentStats()
  }, [])

  async function fetchEquipmentStats() {
    try {
      const res = await fetch('/api/admin/equipment')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        setError('')
      } else {
        setError('Failed to fetch equipment statistics')
      }
    } catch (err) {
      setError('Error fetching equipment data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Equipment Overview
        </CardTitle>
        <CardDescription>Equipment availability by category</CardDescription>
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
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.category_id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1 sm:gap-0">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{cat.category_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.available_quantity}/{cat.total_quantity} available ({cat.total_items} item types)
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{cat.utilization_percent}%</span>
                </div>
                <Progress 
                  value={cat.utilization_percent} 
                  className="h-2"
                />
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No equipment data available
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
