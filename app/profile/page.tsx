import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { DashboardHeader } from '@/components/dashboard/header'
import {
  ArrowLeft, Mail, Phone, User, Home,
  Hash, Shield, Calendar, Terminal,
  Wifi, BadgeCheck, Building2, KeyRound,
} from 'lucide-react'
import Link from 'next/link'

async function getUserProfile(userId: string) {
  try {
    const [userResult] = await pool.query(
      `SELECT ua.user_id, ua.email, ur.role, ua.created_at
       FROM USER_ACCOUNT ua
       LEFT JOIN USER_ROLES ur ON ua.user_id = ur.user_id
       WHERE ua.user_id = ?`,
      [userId]
    ) as any

    if (!userResult || userResult.length === 0) return null

    const user = userResult[0]

    let profile = null
    if (user.role === 'STUDENT') {
      const [studentData] = await pool.query(
        'SELECT * FROM STUDENT WHERE user_id = ?',
        [user.user_id]
      ) as any
      profile = studentData?.[0] || null
    } else if (user.role === 'STAFF') {
      const [staffData] = await pool.query(
        'SELECT * FROM STAFF WHERE user_id = ?',
        [user.user_id]
      ) as any
      profile = staffData?.[0] || null
    } else if (user.role === 'ADMIN') {
      profile = { name: 'System Administrator', email: user.email }
    }

    return { user, profile }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

function TerminalRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
  highlight?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 group">
      <div className="w-7 h-7 rounded-md border border-border bg-background flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
        <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
        <span className="text-xs text-muted-foreground flex-shrink-0 font-medium capitalize">{label.replace('_', ' ')}</span>
        <span className={`text-xs truncate text-right ${highlight ? 'text-foreground font-bold bg-foreground/10 px-2 py-0.5 rounded-md' : 'text-foreground font-medium'}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

function SectionShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card/50 backdrop-blur space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const data = await getUserProfile(session.user_id)
  if (!data || !data.profile) redirect('/auth/login')

  const { user, profile } = data
  const firstName = profile.name?.split(' ')[0] || 'User'
  const lastName  = profile.name?.split(' ').slice(1).join(' ') || ''

  const dashboardLink =
    user.role === 'STUDENT' ? '/student'
    : user.role === 'STAFF'  ? '/staff'
    : '/admin'

  const isHosteler =
    profile.is_hosteler === 1 || profile.is_hosteler === true

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background relative">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <DashboardHeader firstName={firstName} lastName={lastName} role={user.role} />

      <main className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto space-y-6 w-full overflow-x-hidden min-w-0">

        {/* ── Page header ── */}
        <div className="space-y-2">
          <Link
            href={dashboardLink}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h2 className="text-2xl font-bold text-foreground">
            User Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Account and system records for <span className="text-foreground font-medium">{profile.name}</span>
          </p>
        </div>

        {/* ── Hero identity card ── */}
        <div className="border border-border rounded-xl p-5 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
            </div>

            {/* Name & role */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground truncate">{profile.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">
                  {user.role}
                </span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>

            {/* Status badge */}
            <div className="hidden sm:flex flex-col items-end gap-1.5 text-xs text-muted-foreground/80 font-medium">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-foreground" />
                <span className="text-foreground">Verified Account</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>Active Session</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
            <span>ID: {user.user_id}</span>
            <span>Joined: {memberSince}</span>
            <span>Access Level: {user.role}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* ── Personal Info ── */}
          <SectionShell title="Personal Information">
            <TerminalRow icon={User}  label="name"  value={profile.name}  />
            <TerminalRow icon={Mail}  label="email" value={profile.email} />
            {profile.phone && (
              <TerminalRow icon={Phone} label="phone" value={profile.phone} />
            )}
          </SectionShell>

          {/* ── Account Info ── */}
          <SectionShell title="Account Details">
            <TerminalRow icon={Shield}   label="role"    value={user.role}    highlight />
            <TerminalRow icon={Calendar} label="joined"  value={memberSince} />
            <TerminalRow icon={KeyRound} label="user_id" value={user.user_id} />
          </SectionShell>

          {/* ── Student Details ── */}
          {user.role === 'STUDENT' && (
            <SectionShell title="Student Information">
              <TerminalRow icon={Hash}       label="roll_no"    value={profile.roll_no}    />
              <TerminalRow icon={Building2}  label="hosteler"   value={isHosteler ? 'YES' : 'NO'} highlight={isHosteler} />
              {isHosteler && profile.room_no   && profile.room_no   !== '0' && (
                <TerminalRow icon={Home} label="room_no"     value={profile.room_no}    />
              )}
              {isHosteler && profile.hostel_name && profile.hostel_name !== '0' && (
                <TerminalRow icon={Home} label="hostel"      value={profile.hostel_name} />
              )}
            </SectionShell>
          )}

          {/* ── Staff Details ── */}
          {user.role === 'STAFF' && (
            <SectionShell title="Staff Information">
              <TerminalRow icon={Terminal} label="staff_id" value={profile.staff_id} />
            </SectionShell>
          )}

        </div>

      </main>

    </div>
  )
}

// import { redirect } from 'next/navigation'
// import { getSession } from '@/lib/auth/session'
// import { pool } from '@/lib/db/mysql'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { DashboardHeader } from '@/components/dashboard/header'
// import { ArrowLeft, Mail, Phone, User, Home } from 'lucide-react'
// import Link from 'next/link'

// async function getUserProfile(userId: string) {
//   try {
//     // Get user account info
//     const [userResult] = await pool.query(
//       `SELECT ua.user_id, ua.email, ur.role, ua.created_at
//        FROM USER_ACCOUNT ua
//        LEFT JOIN USER_ROLES ur ON ua.user_id = ur.user_id
//        WHERE ua.user_id = ?`,
//       [userId]
//     ) as any

//     if (!userResult || userResult.length === 0) {
//       return null
//     }

//     const user = userResult[0]

//     // Get profile based on role
//     let profile = null
//     if (user.role === 'STUDENT') {
//       const [studentData] = await pool.query(
//         'SELECT * FROM STUDENT WHERE user_id = ?',
//         [user.user_id]
//       ) as any
//       profile = studentData?.[0] || null
//     } else if (user.role === 'STAFF') {
//       const [staffData] = await pool.query(
//         'SELECT * FROM STAFF WHERE user_id = ?',
//         [user.user_id]
//       ) as any
//       profile = staffData?.[0] || null
//     } else if (user.role === 'ADMIN') {
//       profile = {
//         name: 'System Administrator',
//         email: user.email
//       }
//     }

//     return { user, profile }
//   } catch (error) {
//     console.error('Error fetching profile:', error)
//     return null
//   }
// }

// export default async function ProfilePage() {
//   const session = await getSession()
  
//   if (!session) {
//     redirect('/auth/login')
//   }

//   const data = await getUserProfile(session.user_id)
  
//   if (!data || !data.profile) {
//     redirect('/auth/login')
//   }

//   const { user, profile } = data
//   const firstName = profile.name?.split(' ')[0] || 'User'
//   const lastName = profile.name?.split(' ').slice(1).join(' ') || ''

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardHeader 
//         firstName={firstName}
//         lastName={lastName}
//         role={user.role}
//       />
//       <main className="p-6">
//         <Link href={user.role === 'STUDENT' ? '/student' : user.role === 'STAFF' ? '/staff' : '/admin'}>
//           <Button variant="outline" className="mb-6">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>
//         </Link>

//         <div className="max-w-2xl">
//           <Card>
//             <CardHeader>
//               <CardTitle>User Profile</CardTitle>
//               <CardDescription>Your account information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Personal Information */}
//               <div className="space-y-4">
//                 <h3 className="font-semibold text-lg">Personal Information</h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-muted-foreground">Full Name</label>
//                     <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//                       <User className="h-4 w-4 text-muted-foreground" />
//                       <p className="font-medium">{profile.name}</p>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-muted-foreground">Email</label>
//                     <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//                       <Mail className="h-4 w-4 text-muted-foreground" />
//                       <p className="font-medium">{profile.email}</p>
//                     </div>
//                   </div>

//                   {profile.phone && (
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-muted-foreground">Phone</label>
//                       <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//                         <Phone className="h-4 w-4 text-muted-foreground" />
//                         <p className="font-medium">{profile.phone || 'Not provided'}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Role-Specific Information */}
//               {user.role === 'STUDENT' && (
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-lg">Student Information</h3>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
//                       <div className="p-3 bg-muted rounded-lg font-medium">{profile.roll_no}</div>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-muted-foreground">Hosteler Status</label>
//                       <div className="p-3 bg-muted rounded-lg font-medium">
//                         {profile.is_hosteler === 1 || profile.is_hosteler === true ? 'Yes, Hosteler' : 'No, Day Scholar'}
//                       </div>
//                     </div>

//                     {(profile.is_hosteler === 1 || profile.is_hosteler === true) && profile.room_no && profile.room_no !== '0' && (
//                       <div className="space-y-2">
//                         <label className="text-sm font-medium text-muted-foreground">Room Number</label>
//                         <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//                           <Home className="h-4 w-4 text-muted-foreground" />
//                           <p className="font-medium">{profile.room_no}</p>
//                         </div>
//                       </div>
//                     )}

//                     {(profile.is_hosteler === 1 || profile.is_hosteler === true) && profile.hostel_name && profile.hostel_name !== '0' && (
//                       <div className="space-y-2">
//                         <label className="text-sm font-medium text-muted-foreground">Hostel Name</label>
//                         <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//                           <Home className="h-4 w-4 text-muted-foreground" />
//                           <p className="font-medium">{profile.hostel_name}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {user.role === 'STAFF' && (
//                 <div className="space-y-4">
//                   <h3 className="font-semibold text-lg">Staff Information</h3>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-muted-foreground">Staff ID</label>
//                       <div className="p-3 bg-muted rounded-lg font-medium">{profile.staff_id}</div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Account Information */}
//               <div className="space-y-4 pt-4 border-t">
//                 <h3 className="font-semibold text-lg">Account Information</h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-muted-foreground">Role</label>
//                     <div className="p-3 bg-muted rounded-lg font-medium">{user.role}</div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-muted-foreground">Member Since</label>
//                     <div className="p-3 bg-muted rounded-lg font-medium">
//                       {new Date(user.created_at).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   )
// }
