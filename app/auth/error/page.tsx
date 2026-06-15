import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-card/70 border border-destructive/30 shadow-2xl">
        <CardHeader className="text-center">

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 text-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.4)]">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Terminal Style Title */}
          <CardTitle className="text-xl font-mono">
            <span className="text-destructive">$</span> auth_failure
          </CardTitle>

          <CardDescription className="font-mono text-xs text-muted-foreground">
            {'>'} Invalid session or expired authentication token
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-sm font-mono text-muted-foreground space-y-2">
          <p>[SYSTEM] Unable to verify your credentials.</p>
          <p>[HINT] Try logging in again or regenerate access.</p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">

          <Link href="/auth/login" className="w-full">
            <Button className="w-full font-mono group relative overflow-hidden">
              <span className="relative z-10">RETRY_AUTH</span>
              <div className="absolute inset-0 bg-destructive/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full font-mono">
              EXIT_TO_HOME
            </Button>
          </Link>

        </CardFooter>
      </Card>
    </div>
  )
}

// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { AlertCircle } from 'lucide-react'

// export default function AuthErrorPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive">
//               <AlertCircle className="h-6 w-6" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
//           <CardDescription>
//             Something went wrong during authentication. This could be due to an expired or invalid link.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="text-center text-sm text-muted-foreground">
//           <p>Please try signing in again or contact support if the problem persists.</p>
//         </CardContent>
//         <CardFooter className="flex flex-col gap-2">
//           <Link href="/auth/login" className="w-full">
//             <Button className="w-full">Try Again</Button>
//           </Link>
//           <Link href="/" className="w-full">
//             <Button variant="outline" className="w-full bg-transparent">Back to Home</Button>
//           </Link>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }
