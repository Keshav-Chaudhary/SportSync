# Gym & Sports System - Project Structure (15 June)

```
SportSync/
├── .gitignore
├── components.json
├── middleware.ts                 # RBAC protection
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
├── PROJECT_STATUS_REPORT.md      # Status & fixes
├── README.md                     # Main Project Entry
├── README-ADMIN.md               # Admin features
├── README-STAFF.md               # Staff ops
├── README-STUDENT.md             # Student portal
├── TEAM_SETUP_GUIDE.md
├── TODO.md                       
│
├── app/                          # App Router (Next.js 14+)
│   ├── globals.css
│   ├── layout.tsx
│   ├── mode-toggle.tsx
│   ├── page.tsx                  # Landing page
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Admin dashboard 
│   │   ├── analytics/page.tsx
│   │   ├── equipment/page.tsx
│   │   ├── sql/page.tsx          # SQL Playground / Relational Algebra
│   │   ├── system/page.tsx
│   │   └── users/page.tsx
│   ├── api/                      # Secure APIs
│   │   ├── admin/
│   │   │   ├── analytics/route.ts
│   │   │   ├── equipment/route.ts
│   │   │   ├── export/           # Data & PDF Exports
│   │   │   │   ├── data/route.ts
│   │   │   │   └── pdf/route.ts
│   │   │   ├── loans/route.ts
│   │   │   ├── recent-activity/route.ts
│   │   │   ├── schema/route.ts
│   │   │   ├── sql-playground/route.ts
│   │   │   ├── system/route.ts
│   │   │   └── users/route.ts
│   │   ├── borrow/route.ts
│   │   ├── equipment/route.ts
│   │   ├── equipment-categories/route.ts
│   │   ├── gym/occupancy/route.ts
│   │   ├── gym-entries/route.ts
│   │   ├── loans/route.ts
│   │   ├── staff/equipment-analytics/route.ts
│   │   ├── stats/route.ts
│   │   ├── test-db/route.ts
│   │   └── auth/                 # Auth APIs
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── sign-up/page.tsx
│   ├── profile/page.tsx
│   ├── staff/                    # Staff portal
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── equipment/page.tsx
│   │   ├── gym/page.tsx
│   │   └── loans/page.tsx
│   └── student/                  # Student portal
│       ├── layout.tsx
│       ├── page.tsx
│       ├── equipment/page.tsx
│       ├── gym/page.tsx
│       └── loans/page.tsx
│
├── components/                   # Shadcn/UI + Custom
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   ├── admin/ 
│   │   ├── admin-analytics.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── download-admin-report.tsx
│   │   ├── sql-playground.tsx
│   │   └── user-management.tsx
│   ├── dashboard/
│   ├── layout/
│   ├── staff/ 
│   │   ├── equipment-analytics.tsx
│   │   ├── staff-sidebar.tsx
│   │   └── gym-activity-log.tsx
│   ├── student/ 
│   │   ├── download-report.tsx
│   │   ├── student-sidebar.tsx
│   │   └── gym-check-in.tsx
│   └── ui/                       # Shadcn components
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                          # Utils + Core
│   ├── types.ts
│   ├── utils.ts
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── session.ts           
│   └── db/
│       └── mysql.ts              # Local MySQL connection
│
├── scripts/                      # DB Setup
│   ├── 001_create_tables.sql
│   └── 002_seed_data.sql
└── styles/
```

**Total Files**: 200+ | **Security Hardened**: 15 June | **Production Ready**
