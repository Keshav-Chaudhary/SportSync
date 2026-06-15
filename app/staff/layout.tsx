import React from 'react'
import { StaffSidebar } from '@/components/staff/staff-sidebar'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen bg-background overflow-x-hidden">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-[65px] md:pb-0 md:ml-[72px] peer-hover:md:ml-[260px] transition-all duration-300 relative z-0">
        {children}
      </div>
    </div>
  )
}
