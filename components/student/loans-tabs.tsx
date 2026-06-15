'use client'

import { useState } from 'react'
import { ActiveLoans } from './active-loans'
import { HistoryLoans } from './history-loans'
import { GymHistory } from './gym-history'

export function LoansTabs({ userId }: { userId: string }) {
  const [tab, setTab] = useState('active')

  return (
    <div className="border border-border/40 rounded-2xl p-4 md:p-6 bg-card/20 backdrop-blur-sm">
      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b border-border/30 pb-3 sm:pb-4">
        {[
          { key: 'active', label: 'Active Loans' },
          { key: 'history', label: 'Loan History' },
          { key: 'gym', label: 'Gym History' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`
              whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all border shrink-0
              ${
                tab === item.key
                  ? 'bg-primary/10 border-primary/20 text-primary shadow-sm'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-[300px]">
        <div className={tab === 'active' ? 'block' : 'hidden'}>
          <ActiveLoans userId={userId} />
        </div>

        <div className={tab === 'history' ? 'block' : 'hidden'}>
          <HistoryLoans userId={userId} />
        </div>

        <div className={tab === 'gym' ? 'block' : 'hidden'}>
          <GymHistory userId={userId} />
        </div>
      </div>
    </div>
  )
}