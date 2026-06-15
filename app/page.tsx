'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Package, Activity, ArrowRight, ShieldCheck, Zap, User, Users, BarChart3, Smartphone, Briefcase, ShieldAlert } from 'lucide-react'
import { Footer } from '@/components/layout/footer'
import { ModeToggle } from '@/components/mode-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl dark:bg-accent dark:text-accent-foreground bg-foreground text-background shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">SportSync</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <Link href="/auth/login" className="hidden sm:inline-block">
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="container mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/10 text-foreground font-medium text-sm mb-8 border border-border shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
              </span>
              Your Campus Sports Hub
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto text-balance drop-shadow-sm">
              Borrow equipment.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground to-foreground">Hit the gym.</span> 
              <br/>Seamlessly.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              SportSync makes it incredibly easy to borrow sports gear, check into the gym, and track your fitness activities. Built for students, designed for simplicity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="rounded-full h-14 px-8 text-base font-bold shadow-[0_0_20px_var(--muted)] hover:shadow-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm border-border w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Bento Box Role Section */}
        <section className="py-24 relative overflow-hidden bg-muted/20 border-y border-border/40">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Built for everyone</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Different roles, different tools. SportSync provides tailored experiences for students, staff, and administrators.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Student - Tall Card */}
              <Card className="md:row-span-2 md:col-span-1 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/30 transition-all duration-500 hover:shadow-[var(--shadow-lg)] overflow-hidden group flex flex-col relative md:min-h-[500px]">
                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-0">
                  <Smartphone className="w-48 h-48" />
                </div>
                <CardHeader className="p-6 md:p-8 pb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl mb-3 font-bold">Student Portal</CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    A frictionless experience designed for mobile. Browse the live equipment catalog, reserve gear with a tap, and check into the gym using your unique QR code. Your entire sports history, right in your pocket.
                  </CardDescription>
                </CardHeader>
                <div className="flex-1 p-6 md:p-8 pt-0 flex items-end relative z-10 mt-4 md:mt-0">
                  <div className="w-full h-40 rounded-xl bg-gradient-to-t from-muted/80 to-transparent border border-border/50 overflow-hidden relative">
                     {/* Decorative mobile UI mockup */}
                     <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[80%] h-36 bg-background rounded-t-2xl border border-border shadow-2xl p-4 flex flex-col gap-3">
                        <div className="w-1/2 h-2 bg-muted rounded-full"></div>
                        <div className="w-full h-10 bg-muted/50 rounded-lg"></div>
                        <div className="w-full h-10 bg-muted/50 rounded-lg"></div>
                     </div>
                  </div>
                </div>
              </Card>

              {/* Staff - Wide Card */}
              <Card className="md:col-span-2 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/30 transition-all duration-500 hover:shadow-[var(--shadow-lg)] overflow-hidden group flex flex-col md:flex-row relative md:min-h-[250px]">
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-0">
                  <Briefcase className="w-64 h-64" />
                </div>
                <CardHeader className="p-6 md:p-8 md:w-1/2 relative z-10 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl mb-3 font-bold">Staff Operations</CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    Streamline your daily workflows. Process equipment loans instantly, manage inventory levels, and monitor live gym capacity. Designed for speed behind the desk.
                  </CardDescription>
                </CardHeader>
                <div className="p-6 md:p-8 md:w-1/2 items-center justify-center relative z-10 hidden md:flex">
                  <div className="w-full h-full min-h-[150px] rounded-xl bg-gradient-to-r from-muted/80 to-transparent border border-border/50 flex flex-col gap-4 p-6 justify-center">
                     <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-foreground/80"></div><div className="h-2 w-24 bg-muted-foreground/30 rounded-full"></div></div>
                     <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-foreground/40"></div><div className="h-2 w-32 bg-muted-foreground/30 rounded-full"></div></div>
                     <div className="flex gap-3 items-center"><div className="w-3 h-3 rounded-full bg-foreground/80"></div><div className="h-2 w-20 bg-muted-foreground/30 rounded-full"></div></div>
                  </div>
                </div>
              </Card>

              {/* Admin - Wide Card */}
              <Card className="md:col-span-2 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/30 transition-all duration-500 hover:shadow-[var(--shadow-lg)] overflow-hidden group flex flex-col md:flex-row-reverse relative md:min-h-[250px]">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-0">
                  <ShieldAlert className="w-64 h-64" />
                </div>
                <CardHeader className="p-6 md:p-8 md:w-1/2 relative z-10 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl mb-3 font-bold">Admin Control</CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    Complete system oversight. View high-level analytics, manage staff and student accounts, and access deep database controls including a custom SQL playground.
                  </CardDescription>
                </CardHeader>
                <div className="p-6 md:p-8 md:w-1/2 items-center justify-center relative z-10 hidden md:flex">
                  <div className="w-full h-full min-h-[150px] rounded-xl bg-gradient-to-l from-muted/80 to-transparent border border-border/50 p-6 flex items-end gap-3 justify-center">
                     <div className="w-8 h-[40%] bg-foreground/40 rounded-t-sm"></div>
                     <div className="w-8 h-[70%] bg-foreground/60 rounded-t-sm"></div>
                     <div className="w-8 h-[30%] bg-foreground/30 rounded-t-sm"></div>
                     <div className="w-8 h-[90%] bg-foreground/80 rounded-t-sm"></div>
                     <div className="w-8 h-[50%] bg-foreground/50 rounded-t-sm"></div>
                  </div>
                </div>
              </Card>

            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Everything you need in one place</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">No more paperwork or waiting in lines. Manage your campus sports life directly from your phone or laptop.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/20 dark:hover:border-foreground/30 transition-all duration-300 hover:shadow-[var(--shadow-lg)] overflow-hidden group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2 font-bold">Instant Equipment Loans</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Browse available basketballs, rackets, and more. Reserve what you need and pick it up instantly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/20 dark:hover:border-foreground/30 transition-all duration-300 hover:shadow-[var(--shadow-lg)] overflow-hidden group">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2 font-bold">Easy Gym Check-ins</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Skip the desk. Use your phone to check into the campus gym and track how much time you spend working out.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border/50 hover:border-foreground/20 dark:hover:border-foreground/30 transition-all duration-300 hover:shadow-[var(--shadow-lg)] overflow-hidden group sm:col-span-2 lg:col-span-1">
                <CardHeader className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/10 text-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2 font-bold">Always Available</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    See what equipment is in stock before you walk to the sports center. Real-time updates mean no wasted trips.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_60%)] bg-[radial-gradient(ellipse_at_center,_var(--foreground)_0%,_transparent_60%)] opacity-[0.03] dark:opacity-[0.05]" />
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-extrabold tracking-tight mb-6">Ready to get moving?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Join hundreds of students already using SportSync to manage their fitness journey.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                <Zap className="mr-2 h-5 w-5 dark:text-accent-foreground text-background group-hover:animate-pulse" />
                Start Using SportSync
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
