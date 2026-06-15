'use client'

import React, { useState } from "react"
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    const result = await signIn(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      const redirectUrl = result.role === 'ADMIN' ? '/admin' : result.role === 'STAFF' ? '/staff' : '/student'
      router.push(redirectUrl)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left side: Premium Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground relative overflow-hidden">
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
              "Managing campus sports has never been easier. We transformed our entire equipment checkout workflow in a single weekend."
            </p>
            <footer className="text-background/70">
              <p className="text-background font-semibold text-lg">David Reynolds</p>
              <p className="text-sm">Head of Athletics Operations</p>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile background only */}
        <div className="absolute inset-0 lg:hidden dark:bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_60%)] bg-[radial-gradient(ellipse_at_center,_var(--foreground)_0%,_transparent_60%)] opacity-[0.03] dark:opacity-[0.05]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">SportSync</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              {/* Error */}
              {error && (
                <div className="p-3 text-sm text-foreground bg-foreground/5 border border-foreground/10 rounded-lg font-medium">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <Link href="#" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 focus-visible:ring-foreground/20 bg-background/50 border-border"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center pt-6">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="text-foreground font-bold hover:underline">
                Create one
              </Link>
            </p>
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
// import { signIn } from '@/lib/actions/auth'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Dumbbell, Loader2 } from 'lucide-react'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)

//     const formData = new FormData()
//     formData.append('email', email)
//     formData.append('password', password)

//     const result = await signIn(formData)
    
//     if (result?.error) {
//       setError(result.error)
//       setLoading(false)
//     } else if (result?.success) {
//       // Redirect based on role
//       const redirectUrl = result.role === 'ADMIN' ? '/admin' : result.role === 'STAFF' ? '/staff' : '/student'
//       router.push(redirectUrl)
//     }
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
//           <CardTitle className="text-2xl font-bold">Welcome to SportSync</CardTitle>
//           <CardDescription>Sign in to manage gym access and equipment</CardDescription>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && (
//               <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
//                 {error}
//               </div>
//             )}
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
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//           </CardContent>
//           <CardFooter className="flex flex-col gap-4">
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </Button>
//             <p className="text-sm text-muted-foreground text-center">
//               {"Don't have an account? "}
//               <Link href="/auth/sign-up" className="text-primary hover:underline">
//                 Sign up
//               </Link>
//             </p>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   )
// }
