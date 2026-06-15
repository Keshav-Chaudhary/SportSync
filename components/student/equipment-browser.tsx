'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Package, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Equipment {
  equipment_id: number
  name: string
  category_id: number
  category_name: string
  available_quantity: number
  total_quantity: number
}

interface Category {
  category_id: number
  category_name: string
}

interface EquipmentBrowserProps {
  readOnly?: boolean
}

export function EquipmentBrowser({ readOnly = false }: EquipmentBrowserProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [returnDate, setReturnDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [equipmentRes, categoriesRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/equipment-categories'),
      ])

      const equipmentData = equipmentRes.ok ? await equipmentRes.json() : []
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : []

      setEquipment(Array.isArray(equipmentData) ? equipmentData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setEquipment([])
      setCategories([])
    }
    setLoading(false)
  }

  async function handleBorrow() {
    if (!selectedEquipment || !returnDate || quantity < 1) return
    setBorrowing(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: selectedEquipment.equipment_id,
          quantity: quantity,
          due_date: returnDate,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to borrow equipment')
      }

      setSuccess('Equipment borrowed successfully!')
      setDialogOpen(false)
      setSelectedEquipment(null)
      setQuantity(1)
      setReturnDate('')
      
      // Refresh page after 1.5 seconds
      setTimeout(() => {
        router.refresh()
        setSuccess('')
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to borrow equipment'
      setError(errorMsg)
      console.error('Borrow error:', err)
    } finally {
      setBorrowing(false)
    }
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id.toString() === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Set default return date to 7 days from now
  const defaultReturnDate = new Date()
  defaultReturnDate.setDate(defaultReturnDate.getDate() + 7)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {readOnly ? 'Equipment Availability' : 'Browse Equipment'}
        </CardTitle>
        <CardDescription>
          {readOnly ? 'View available sports equipment' : 'Find and borrow sports equipment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6 mb-8 mt-2">
          {/* Prominent Search Bar */}
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              placeholder="Search for sports equipment, gear, or accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base md:text-lg rounded-2xl bg-muted/50 border-border/50 focus:bg-background shadow-inner transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full transition-all ${selectedCategory === 'all' ? 'shadow-md shadow-primary/20' : 'bg-background hover:bg-muted'}`}
            >
              All Gear
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.category_id}
                variant={selectedCategory === cat.category_id.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.category_id.toString())}
                className={`rounded-full transition-all ${selectedCategory === cat.category_id.toString() ? 'shadow-md shadow-primary/20' : 'bg-background hover:bg-muted'}`}
              >
                {cat.category_name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEquipment.map((item) => (
              <div
                key={item.equipment_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4"
              >
                <div className="flex-1 min-w-0 w-full">
                  <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.category_name || 'Uncategorized'}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <Badge variant={item.available_quantity > 0 ? 'default' : 'secondary'}>
                      {item.available_quantity} available
                    </Badge>
                    {!readOnly && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">of {item.total_quantity}</span>
                    )}
                  </div>
                </div>
                {!readOnly && (
                  <div className="w-full sm:w-auto flex justify-end">
                    <Button 
                      size="sm" 
                      className="w-full sm:w-auto"
                      disabled={item.available_quantity === 0}
                      onClick={() => {
                        setSelectedEquipment(item)
                        setReturnDate(defaultReturnDate.toISOString().split('T')[0])
                        setQuantity(1)
                        setError('')
                        setDialogOpen(true)
                      }}
                    >
                      Borrow
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredEquipment.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No equipment found matching your criteria
              </div>
            )}
          </div>
        )}

        {!readOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Borrow {selectedEquipment?.name}</DialogTitle>
                <DialogDescription>
                  Select quantity and expected return date
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedEquipment?.available_quantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {selectedEquipment?.available_quantity}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Expected Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleBorrow} 
                  disabled={borrowing || !returnDate || quantity < 1}
                >
                  {borrowing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Borrowing...
                    </>
                  ) : (
                    'Confirm Borrow'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
