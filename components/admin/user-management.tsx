'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Search, Loader2, AlertCircle, Eye, Trash2, Edit2, Info, ClipboardList, Dumbbell, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface User {
  user_id: number
  username: string
  email: string
  role_id: number
  created_at: string
  role_name: string
  user_type: 'STUDENT' | 'STAFF' | 'ADMIN'
  roll_no?: string
  staff_id?: string
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<number | null>(null)

  // Details dialog state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [userActivity, setUserActivity] = useState<{ gym_entries: any[]; equipment_loans: any[] }>({
    gym_entries: [],
    equipment_loans: []
  })

  // Loan editing state
  const [editingLoan, setEditingLoan] = useState<any>(null)
  const [editLoanQty, setEditLoanQty] = useState<number>(1)
  const [editLoanDueDate, setEditLoanDueDate] = useState<string>('')
  const [editLoanStatus, setEditLoanStatus] = useState<string>('ISSUED')
  const [editLoanSubmitting, setEditLoanSubmitting] = useState(false)

  // User deletion state
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deletingUserSubmitting, setDeletingUserSubmitting] = useState(false)

  // Loan/Gym deletion confirmation states
  const [deletingLoanId, setDeletingLoanId] = useState<number | null>(null)
  const [deletingGymEntryId, setDeletingGymEntryId] = useState<number | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
        setError('')
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Error fetching users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId: number, newRoleId: number) {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: newRoleId }),
      })
      if (res.ok) {
        fetchUsers()
      } else {
        setError('Failed to update user role')
      }
    } catch (err) {
      setError('Error updating user role')
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  async function handleViewDetails(userId: number) {
    setSelectedUserId(userId)
    setDetailLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${userId}/activity`)
      if (res.ok) {
        const data = await res.json()
        setUserDetails(data.user_details)
        setUserActivity({
          gym_entries: data.gym_entries || [],
          equipment_loans: data.equipment_loans || []
        })
      } else {
        const errData = await res.json()
        setError(errData.error || 'Failed to fetch user details')
        setSelectedUserId(null)
      }
    } catch (err) {
      setError('Error fetching details')
      console.error(err)
      setSelectedUserId(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function refreshDetails(userId: number) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/activity`)
      if (res.ok) {
        const data = await res.json()
        setUserDetails(data.user_details)
        setUserActivity({
          gym_entries: data.gym_entries || [],
          equipment_loans: data.equipment_loans || []
        })
      }
    } catch (err) {
      console.error('Error refreshing details:', err)
    }
  }

  async function handleReturnLoan(loanId: number) {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' }),
      })
      if (res.ok) {
        if (selectedUserId) refreshDetails(selectedUserId)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to return equipment')
      }
    } catch (err) {
      console.error('Error returning equipment:', err)
    }
  }

  async function handleUpdateLoan() {
    if (!editingLoan || !selectedUserId) return
    setEditLoanSubmitting(true)
    try {
      const res = await fetch(`/api/loans/${editingLoan.loan_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: editLoanDueDate,
          quantity: editLoanQty,
          status: editLoanStatus
        })
      })
      if (res.ok) {
        setEditingLoan(null)
        refreshDetails(selectedUserId)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to update loan')
      }
    } catch (err) {
      console.error('Error updating loan:', err)
    } finally {
      setEditLoanSubmitting(false)
    }
  }

  async function handleDeleteLoan(loanId: number) {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setDeletingLoanId(null)
        if (selectedUserId) refreshDetails(selectedUserId)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to delete loan')
      }
    } catch (err) {
      console.error('Error deleting loan:', err)
    }
  }

  async function handleDeleteGymEntry(entryId: number) {
    try {
      const res = await fetch(`/api/gym-entries/${entryId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setDeletingGymEntryId(null)
        if (selectedUserId) refreshDetails(selectedUserId)
      } else {
        const errData = await res.json()
        alert(errData.error || 'Failed to delete gym entry')
      }
    } catch (err) {
      console.error('Error deleting gym entry:', err)
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) return
    setDeletingUserSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.user_id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setDeletingUser(null)
        setSelectedUserId(null)
        fetchUsers() // Refresh list
      } else {
        const errData = await res.json()
        setError(errData.error || 'Failed to delete user')
        setDeletingUser(null)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Error deleting user')
      setDeletingUser(null)
    } finally {
      setDeletingUserSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.roll_no?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesRole = roleFilter === 'all' || user.user_type === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW: TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-32">Change Role</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.user_type === 'ADMIN' ? 'default' :
                          user.user_type === 'STAFF' ? 'secondary' :
                          'outline'
                        }>
                          {user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.roll_no || user.staff_id || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role_id.toString()}
                          onValueChange={(value) => updateUserRole(user.user_id, parseInt(value))}
                          disabled={updating === user.user_id}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Admin</SelectItem>
                            <SelectItem value="2">Staff</SelectItem>
                            <SelectItem value="3">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleViewDetails(user.user_id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeletingUser(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW: CARDS */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-background/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-foreground truncate">{user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={
                        user.user_type === 'ADMIN' ? 'default' :
                        user.user_type === 'STAFF' ? 'secondary' :
                        'outline'
                      } className="text-[10px] px-1.5 py-0">
                        {user.user_type}
                      </Badge>
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleViewDetails(user.user_id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeletingUser(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-card/50 p-2 rounded-lg border border-border/30">
                    <div>
                      <span className="font-bold text-foreground/80 block">ID / Roll No</span>
                      {user.roll_no || user.staff_id || 'N/A'}
                    </div>
                    <div>
                      <span className="font-bold text-foreground/80 block">Joined</span>
                      {formatDate(user.created_at)}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border/50">
                    <span className="text-xs font-bold text-foreground/80">Access Level:</span>
                    <Select
                      value={user.role_id.toString()}
                      onValueChange={(value) => updateUserRole(user.user_id, parseInt(value))}
                      disabled={updating === user.user_id}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="text-xs">Admin</SelectItem>
                        <SelectItem value="2" className="text-xs">Staff</SelectItem>
                        <SelectItem value="3" className="text-xs">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  No users found
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>

    {/* USER DETAILS DIALOG */}
    <Dialog open={selectedUserId !== null && !detailLoading} onOpenChange={(open) => { if(!open) setSelectedUserId(null) }}>
      <DialogContent className="sm:max-w-[750px] max-w-[calc(100vw-2rem)] overflow-y-auto max-h-[85vh] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6">
        {userDetails && (
          <>
            <DialogHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                  {userDetails.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {userDetails.email}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 pr-6">
                <Badge className="px-2.5 py-1 text-xs" variant={
                  userDetails.role === 'ADMIN' ? 'default' :
                  userDetails.role === 'STAFF' ? 'secondary' :
                  'outline'
                }>
                  {userDetails.role}
                </Badge>
                <Button variant="destructive" size="sm" className="h-8 gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                  const mappedUser: User = {
                    user_id: userDetails.user_id || selectedUserId!,
                    username: userDetails.name,
                    email: userDetails.email,
                    role_id: userDetails.role === 'ADMIN' ? 1 : userDetails.role === 'STAFF' ? 2 : 3,
                    created_at: userDetails.created_at,
                    role_name: userDetails.role,
                    user_type: userDetails.role,
                    roll_no: userDetails.roll_no,
                    staff_id: userDetails.staff_id
                  }
                  setDeletingUser(mappedUser)
                }}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete User
                </Button>
              </div>
            </DialogHeader>

            <Tabs defaultValue="profile" className="mt-4">
              <TabsList className="w-full grid grid-cols-3 bg-muted/40 p-1 rounded-xl">
                <TabsTrigger value="profile" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" />Profile</TabsTrigger>
                <TabsTrigger value="loans" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Equipment Loans</TabsTrigger>
                <TabsTrigger value="gym" className="text-xs sm:text-sm py-1.5 flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5" />Gym Activity</TabsTrigger>
              </TabsList>

              {/* PROFILE TAB */}
              <TabsContent value="profile" className="space-y-4 pt-4 outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 sm:p-4 rounded-xl border border-border/40 bg-background/50">
                    <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">User Details</span>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">User ID / Type:</span>
                        <span className="font-semibold">{userDetails.roll_no || userDetails.staff_id || userDetails.user_id || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Phone Number:</span>
                        <span className="font-semibold">{userDetails.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Registration Date:</span>
                        <span className="font-semibold">{formatDate(userDetails.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {userDetails.role === 'STUDENT' && (
                    <div className="p-3 sm:p-4 rounded-xl border border-border/40 bg-background/50">
                      <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Residence Status</span>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Hosteler:</span>
                          <span className="font-semibold">{userDetails.is_hosteler ? 'Yes' : 'No'}</span>
                        </div>
                        {userDetails.is_hosteler && (
                          <>
                            <div className="flex justify-between py-1 border-b border-border/10">
                              <span className="text-muted-foreground">Hostel Name:</span>
                              <span className="font-semibold">{userDetails.hostel_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/10">
                              <span className="text-muted-foreground">Room Number:</span>
                              <span className="font-semibold">{userDetails.room_no || 'N/A'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* LOANS TAB */}
              <TabsContent value="loans" className="pt-4 outline-none">
                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/30">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs">Equipment</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Issued At</TableHead>
                        <TableHead className="text-xs">Due Date</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivity.equipment_loans.map((loan: any) => (
                        <TableRow key={loan.loan_id} className="text-xs sm:text-sm">
                          <TableCell className="font-medium text-xs">{loan.equipment_name}</TableCell>
                          <TableCell className="text-xs">{loan.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={
                              loan.status === 'RETURNED' ? 'secondary' :
                              loan.status === 'OVERDUE' ? 'destructive' :
                              'default'
                            } className="text-[10px] px-1.5 py-0">
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatDate(loan.issued_at)}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatDate(loan.due_date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {loan.status !== 'RETURNED' && (
                                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleReturnLoan(loan.loan_id)}>
                                  Return
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => {
                                setEditingLoan(loan)
                                setEditLoanQty(loan.quantity)
                                setEditLoanStatus(loan.status)
                                setEditLoanDueDate(loan.due_date ? new Date(loan.due_date).toISOString().split('T')[0] : '')
                              }}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20" onClick={() => setDeletingLoanId(loan.loan_id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {userActivity.equipment_loans.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                            No equipment loan records found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* GYM ACTIVITY TAB */}
              <TabsContent value="gym" className="pt-4 outline-none">
                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/30">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs">Entry Time</TableHead>
                        <TableHead className="text-xs">Exit Time</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivity.gym_entries.map((entry: any) => {
                        const entryTime = new Date(entry.entry_time)
                        const exitTime = entry.exit_time ? new Date(entry.exit_time) : null
                        let duration = '-'
                        if (exitTime) {
                          const diffMins = Math.round((exitTime.getTime() - entryTime.getTime()) / 60000)
                          duration = `${diffMins} min`
                        }

                        return (
                          <TableRow key={entry.entry_id} className="text-xs sm:text-sm">
                            <TableCell className="text-xs text-muted-foreground">
                              {entryTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {exitTime ? exitTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 text-[9px] animate-pulse">
                                  Active Now
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs font-medium">{duration}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20" onClick={() => setDeletingGymEntryId(entry.entry_id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {userActivity.gym_entries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                            No gym check-in records found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* LOAN EDIT MODAL */}
    <Dialog open={editingLoan !== null} onOpenChange={(open) => { if(!open) setEditingLoan(null) }}>
      <DialogContent className="sm:max-w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Edit Loan Record</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Modify parameters for this active or historic loan.
          </DialogDescription>
        </DialogHeader>

        {editingLoan && (
          <div className="space-y-4 py-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Equipment</label>
              <Input disabled value={editingLoan.equipment_name} className="h-9 bg-muted" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Quantity</label>
              <Input type="number" min="1" value={editLoanQty} onChange={(e) => setEditLoanQty(parseInt(e.target.value) || 1)} className="h-9" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Due Date</label>
              <Input type="date" value={editLoanDueDate} onChange={(e) => setEditLoanDueDate(e.target.value)} className="h-9" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Status</label>
              <Select value={editLoanStatus} onValueChange={setEditLoanStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISSUED" className="text-xs">ISSUED</SelectItem>
                  <SelectItem value="RETURNED" className="text-xs">RETURNED</SelectItem>
                  <SelectItem value="OVERDUE" className="text-xs">OVERDUE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditingLoan(null)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleUpdateLoan} disabled={editLoanSubmitting} className="h-9 text-xs bg-primary hover:bg-primary/95 text-white">
            {editLoanSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* DELETE USER CONFIRMATION */}
    <Dialog open={deletingUser !== null} onOpenChange={(open) => { if(!open) setDeletingUser(null) }}>
      <DialogContent className="sm:max-w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-red-600 text-center">Delete User Account?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 text-center">
            Are you sure you want to delete <strong>{deletingUser?.username}</strong>? This is destructive and irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-left my-4 space-y-2">
          <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Deletion Rules:
          </span>
          <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-1">
            <li>Student records: Deletes gym entries and returned loan history. Blocked if active loans exist.</li>
            <li>Staff records: Blocked if they have recorded entry/loan history to keep database audit trail intact.</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-row justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeletingUser(null)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleDeleteUser} disabled={deletingUserSubmitting} className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white">
            {deletingUserSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* DELETE LOAN CONFIRMATION */}
    <Dialog open={deletingLoanId !== null} onOpenChange={(open) => { if(!open) setDeletingLoanId(null) }}>
      <DialogContent className="sm:max-w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-red-600 text-center">Delete Loan Record?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 text-center">
            Are you sure you want to delete this loan record? If this is an active or overdue loan, inventory stock will be restored.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDeletingLoanId(null)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={() => deletingLoanId && handleDeleteLoan(deletingLoanId)} className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white">
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* DELETE GYM ENTRY CONFIRMATION */}
    <Dialog open={deletingGymEntryId !== null} onOpenChange={(open) => { if(!open) setDeletingGymEntryId(null) }}>
      <DialogContent className="sm:max-w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-6 text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-red-600 text-center">Delete Gym Entry Record?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 text-center">
            Are you sure you want to delete this gym entry? This record will be permanently purged.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setDeletingGymEntryId(null)} className="h-9 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={() => deletingGymEntryId && handleDeleteGymEntry(deletingGymEntryId)} className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white">
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}
