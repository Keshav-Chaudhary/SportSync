import React from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen bg-background overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-[65px] md:pb-0 md:ml-[72px] peer-hover:md:ml-[260px] transition-all duration-300 relative z-0">
        {children}
      </div>
    </div>
  )
}
