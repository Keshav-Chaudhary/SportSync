'use client'

import React, { useState } from "react"
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dumbbell, Loader2, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<string>('Student')
  const [rollNo, setRollNo] = useState('')
  const [isHosteler, setIsHosteler] = useState(false)
  const [roomNo, setRoomNo] = useState('')
  const [hostelName, setHostelName] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [adminCode, setAdminCode] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('phone', phone)
    formData.append('role', role)
    formData.append('rollNo', rollNo)
    formData.append('isHosteler', String(isHosteler))
    formData.append('roomNo', roomNo)
    formData.append('hostelName', hostelName)
    formData.append('department', department)
    formData.append('adminCode', adminCode)
    formData.append('position', position)

    const result = await signUp(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_60%)] bg-[radial-gradient(ellipse_at_center,_var(--foreground)_0%,_transparent_60%)] opacity-[0.03] dark:opacity-[0.05]" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md relative z-10">
          <Card className="text-center p-10 bg-card/80 backdrop-blur-sm border-border/50 shadow-[var(--shadow-lg)]">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Success!</CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-3">
              Account created successfully. Redirecting to login...
            </CardDescription>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left side: Premium Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground relative overflow-hidden sticky top-0 h-screen">
        {/* Subtle dark background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-foreground via-transparent to-foreground z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] z-0"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-background text-foreground shadow-lg">
            <Dumbbell className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-background">SportSync</span>
        </div>

        {/* Testimonial / Showcase */}
        <div className="relative z-10 max-w-lg mb-8">
          <blockquote className="space-y-6">
            <p className="text-3xl font-medium text-background leading-tight">
              "Joining the campus gym and borrowing equipment is now completely frictionless. Set up your account in seconds."
            </p>
            <footer className="text-background/70">
              <p className="text-background font-semibold text-lg">Sarah Jenkins</p>
              <p className="text-sm">Student President</p>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side: Sign-up form */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative min-h-screen">
        {/* Mobile background only */}
        <div className="absolute inset-0 lg:hidden dark:bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_60%)] bg-[radial-gradient(ellipse_at_center,_var(--foreground)_0%,_transparent_60%)] opacity-[0.03] dark:opacity-[0.05]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[450px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">SportSync</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
              <p className="text-muted-foreground">Join SportSync to access gym facilities and equipment</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {error && (
                <div className="p-3 text-sm text-foreground bg-foreground/5 border border-foreground/10 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                  <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                <Input id="phone" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'Student' && (
                <div className="space-y-5 border-t border-border/50 pt-5 mt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNo" className="text-sm font-semibold">Roll Number</Label>
                      <Input id="rollNo" placeholder="e.g., CSE001" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
                      <Input id="department" placeholder="e.g., Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer p-3 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
                    <input type="checkbox" checked={isHosteler} onChange={(e) => setIsHosteler(e.target.checked)} className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground/20" />
                    I am a hosteler
                  </label>

                  {isHosteler && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label htmlFor="roomNo" className="text-sm font-semibold">Room Number</Label>
                        <Input id="roomNo" placeholder="e.g., A-101" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hostelName" className="text-sm font-semibold">Hostel Name</Label>
                        <Input id="hostelName" placeholder="e.g., Boys Hostel" value={hostelName} onChange={(e) => setHostelName(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === 'Staff' && (
                <div className="space-y-2 border-t border-border/50 pt-5 mt-5">
                  <Label htmlFor="position" className="text-sm font-semibold">Position</Label>
                  <Input id="position" placeholder="e.g., Sports Coordinator" value={position} onChange={(e) => setPosition(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                </div>
              )}

              {role === 'Admin' && (
                <div className="space-y-2 border-t border-border/50 pt-5 mt-5">
                  <Label htmlFor="adminCode" className="text-sm font-semibold">Admin Authorization Code</Label>
                  <Input id="adminCode" type="password" placeholder="Enter admin code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border" />
                </div>
              )}

              <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all mt-6" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : 'Create Account'}
              </Button>

              <p className="text-sm text-muted-foreground text-center pt-4">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-foreground font-bold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// 'use client'

// import React from "react"

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { signUp } from '@/lib/actions/auth'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Dumbbell, Loader2, CheckCircle } from 'lucide-react'

// export default function SignUpPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [role, setRole] = useState<string>('Student')
//   const [rollNo, setRollNo] = useState('')
//   const [isHosteler, setIsHosteler] = useState(false)
//   const [roomNo, setRoomNo] = useState('')
//   const [hostelName, setHostelName] = useState('')
//   const [department, setDepartment] = useState('')
//   const [position, setPosition] = useState('')
//   const [adminCode, setAdminCode] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const [loading, setLoading] = useState(false)

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)

//     const formData = new FormData()
//     formData.append('email', email)
//     formData.append('password', password)
//     formData.append('firstName', firstName)
//     formData.append('lastName', lastName)
//     formData.append('phone', phone)
//     formData.append('role', role)
//     formData.append('rollNo', rollNo)
//     formData.append('isHosteler', String(isHosteler))
//     formData.append('roomNo', roomNo)
//     formData.append('hostelName', hostelName)
//     formData.append('department', department)
//     formData.append('adminCode', adminCode)
//     formData.append('position', position)

//     const result = await signUp(formData)
    
//     if (result?.error) {
//       setError(result.error)
//       setLoading(false)
//     } else if (result?.success) {
//       setSuccess(true)
//       // Redirect to login after 2 seconds
//       setTimeout(() => {
//         router.push('/auth/login')
//       }, 2000)
//     }
//   }

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className="flex justify-center mb-4">
//               <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground">
//                 <CheckCircle className="h-6 w-6" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
//             <CardDescription>
//               Your account has been created successfully. You can now sign in.
//             </CardDescription>
//           </CardHeader>
//           <CardFooter>
//             <Link href="/auth/login" className="w-full">
//               <Button className="w-full">
//                 Go to Login
//               </Button>
//             </Link>
//           </CardFooter>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
//               <Dumbbell className="h-6 w-6" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
//           <CardDescription>Join SportSync to access gym facilities and equipment</CardDescription>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && (
//               <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
//                 {error}
//               </div>
//             )}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">First Name</Label>
//                 <Input
//                   id="firstName"
//                   placeholder="John"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Last Name</Label>
//                 <Input
//                   id="lastName"
//                   placeholder="Doe"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="you@university.edu"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 placeholder="10-digit phone number"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Min. 6 characters"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 minLength={6}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="role">Role</Label>
//               <Select value={role} onValueChange={setRole}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select your role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Student">Student</SelectItem>
//                   <SelectItem value="Staff">Staff</SelectItem>
//                   <SelectItem value="Admin">Admin</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {role === 'Student' && (
//               <>
//                 <div className="space-y-2">
//                   <Label htmlFor="rollNo">Roll Number</Label>
//                   <Input
//                     id="rollNo"
//                     placeholder="e.g., CSE001"
//                     value={rollNo}
//                     onChange={(e) => setRollNo(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="department">Department</Label>
//                   <Input
//                     id="department"
//                     placeholder="e.g., Computer Science"
//                     value={department}
//                     onChange={(e) => setDepartment(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     id="isHosteler"
//                     type="checkbox"
//                     checked={isHosteler}
//                     onChange={(e) => setIsHosteler(e.target.checked)}
//                     className="w-4 h-4 rounded border-gray-300"
//                   />
//                   <Label htmlFor="isHosteler" className="font-normal cursor-pointer">
//                     I am a hosteler
//                   </Label>
//                 </div>
//                 {isHosteler && (
//                   <>
//                     <div className="space-y-2">
//                       <Label htmlFor="roomNo">Room Number</Label>
//                       <Input
//                         id="roomNo"
//                         placeholder="e.g., A-101"
//                         value={roomNo}
//                         onChange={(e) => setRoomNo(e.target.value)}
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="hostelName">Hostel Name</Label>
//                       <Input
//                         id="hostelName"
//                         placeholder="e.g., Boys Hostel A"
//                         value={hostelName}
//                         onChange={(e) => setHostelName(e.target.value)}
//                         required
//                       />
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//             {role === 'Staff' && (
//               <div className="space-y-2">
//                 <Label htmlFor="position">Position</Label>
//                 <Input
//                   id="position"
//                   placeholder="e.g., Sports Coordinator"
//                   value={position}
//                   onChange={(e) => setPosition(e.target.value)}
//                   required
//                 />
//               </div>
//             )}
//             {role === 'Admin' && (
//               <div className="space-y-2">
//                 <Label htmlFor="adminCode">Admin Code</Label>
//                 <Input
//                   id="adminCode"
//                   type="password"
//                   placeholder="Enter admin code"
//                   value={adminCode}
//                   onChange={(e) => setAdminCode(e.target.value)}
//                   required
//                 />
//               </div>
//             )}
//           </CardContent>
//           <CardFooter className="flex flex-col gap-4">
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Creating account...
//                 </>
//               ) : (
//                 'Create Account'
//               )}
//             </Button>
//             <p className="text-sm text-muted-foreground text-center">
//               Already have an account?{' '}
//               <Link href="/auth/login" className="text-primary hover:underline">
//                 Sign in
//               </Link>
//             </p>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }
