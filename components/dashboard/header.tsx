'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dumbbell, LogOut, User } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'

interface HeaderProps {
  firstName: string
  lastName: string
  role: string
}

export function DashboardHeader({ firstName, lastName, role }: HeaderProps) {
  const router = useRouter()
  const initials = (
      (firstName?.[0] || '') +
      (lastName?.[0] || '')
    ).toUpperCase()

  async function handleSignOut() {
    await signOut()
  }

  function handleProfileClick() {
    router.push('/profile')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl dark:bg-accent dark:text-accent-foreground bg-foreground text-background shadow-sm">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">SportSync</h1>
            <p className="text-xs text-muted-foreground font-medium">{role} Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" suppressHydrationWarning>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{firstName} {lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
