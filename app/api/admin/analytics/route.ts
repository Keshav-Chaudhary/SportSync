  import { NextResponse } from 'next/server'
  import { pool } from '@/lib/db/mysql'
  import { getSession } from '@/lib/auth/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
    try {
      const session = await getSession()
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      // =========================
      // 1. DAILY TREND
      // =========================
      const [dailyGym] = await pool.execute(`
        SELECT 
          DATE(entry_time) as date,
          COUNT(*) as visits,
          COUNT(DISTINCT student_id) as users
        FROM GYM_ENTRY
        WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(entry_time)
        ORDER BY date
      `) as any

      const [dailyLoans] = await pool.execute(`
        SELECT 
          DATE(issued_at) as date,
          COUNT(*) as loans,
          SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue
        FROM EQUIPMENT_LOAN
        WHERE issued_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(issued_at)
        ORDER BY date
      `) as any

      const dailyMap: Record<string, any> = {}

      ;(dailyGym as any[]).forEach(r => {
        dailyMap[r.date] = {
          gymVisits: r.visits,
          gymUsers: r.users
        }
      })

      ;(dailyLoans as any[]).forEach(r => {
        dailyMap[r.date] = {
          ...dailyMap[r.date],
          loans: r.loans,
          overdue: r.overdue
        }
      })

      const dailyTrend = Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({ date, ...data }))

      // =========================
      // 2. WEEKLY TREND
      // =========================
      const [weekly] = await pool.execute(`
        SELECT 
          YEARWEEK(entry_time, 1) as week,
          COUNT(*) as gymVisits,
          COUNT(DISTINCT student_id) as gymUsers
        FROM GYM_ENTRY
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
        GROUP BY YEARWEEK(entry_time, 1)
        ORDER BY week
      `) as any

      const weeklyTrend = (weekly as any[]).map((row, index, arr) => {
        const prev = arr[index - 1]
        const growth = prev?.gymVisits
          ? ((row.gymVisits - prev.gymVisits) / prev.gymVisits) * 100
          : 0

        return {
          week: row.week,
          gymVisits: row.gymVisits,
          gymUsers: row.gymUsers,
          gymGrowth: Number(growth.toFixed(1))
        }
      })

      // =========================
      // 3. MONTHLY TREND
      // =========================
      const [monthly] = await pool.execute(`
        SELECT 
          DATE_FORMAT(entry_time, '%Y-%m') as month,
          COUNT(*) as gymVisits,
          COUNT(DISTINCT student_id) as gymUsers
        FROM GYM_ENTRY
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month
      `) as any

      const [monthlyLoans] = await pool.execute(`
        SELECT 
          DATE_FORMAT(issued_at, '%Y-%m') as month,
          COUNT(*) as loans
        FROM EQUIPMENT_LOAN
        WHERE issued_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month
      `) as any

      const loanMap = new Map(
        (monthlyLoans as any[]).map(r => [r.month, r.loans])
      )

      const monthlyTrend = (monthly as any[]).map(r => ({
        month: r.month,
        gymVisits: r.gymVisits,
        loans: loanMap.get(r.month) || 0,
        growth: 0
      }))

      // =========================
      // 4. PEAK HOURS
      // =========================
      const [peakGym] = await pool.execute(`
        SELECT 
          HOUR(entry_time) as hour,
          COUNT(*) as avg_visits
        FROM GYM_ENTRY
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY HOUR(entry_time)
        ORDER BY avg_visits DESC
      `) as any

      const [peakLoans] = await pool.execute(`
        SELECT 
          HOUR(issued_at) as hour,
          COUNT(*) as avg_loans
        FROM EQUIPMENT_LOAN
        WHERE issued_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY HOUR(issued_at)
        ORDER BY avg_loans DESC
      `) as any

      // =========================
      // 5. HEATMAPS
      // =========================
      const [gymHeatmap] = await pool.execute(`
        SELECT DATE(entry_time) as date, COUNT(*) as visits
        FROM GYM_ENTRY
        WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        GROUP BY date
        ORDER BY date
      `) as any

      const gymHeatArray = (gymHeatmap as any[]).map(r => ({
        date: r.date,
        visits: r.visits,
        heat: Math.min(100, (r.visits / 50) * 100)
      }))

      const [loanHeatmap] = await pool.execute(`
        SELECT DATE(issued_at) as date, COUNT(*) as loans
        FROM EQUIPMENT_LOAN
        WHERE issued_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
        GROUP BY date
        ORDER BY date
      `) as any

      const loanHeatArray = (loanHeatmap as any[]).map(r => ({
        date: r.date,
        loans: r.loans,
        heat: Math.min(100, (r.loans / 10) * 100)
      }))

      // =========================
      // 6. GROWTH SUMMARY
      // =========================
      const [growth] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM GYM_ENTRY 
          WHERE YEARWEEK(entry_time,1) = YEARWEEK(NOW(),1)-1) as prevGym,
          (SELECT COUNT(*) FROM GYM_ENTRY 
          WHERE YEARWEEK(entry_time,1) = YEARWEEK(NOW(),1)) as currGym,
          (SELECT COUNT(*) FROM EQUIPMENT_LOAN 
          WHERE YEARWEEK(issued_at,1) = YEARWEEK(NOW(),1)-1) as prevLoans,
          (SELECT COUNT(*) FROM EQUIPMENT_LOAN 
          WHERE YEARWEEK(issued_at,1) = YEARWEEK(NOW(),1)) as currLoans
      `) as any

      const g = growth[0]

      const gymWeekly = g.prevGym ? ((g.currGym - g.prevGym) / g.prevGym) * 100 : 0
      const loanWeekly = g.prevLoans ? ((g.currLoans - g.prevLoans) / g.prevLoans) * 100 : 0

      // =========================
      // 7. TOTALS
      // =========================
      const [totals] = await pool.execute(`
        SELECT 
          COUNT(DISTINCT student_id) as totalGymUsers,
          COUNT(*) as totalGymVisits30d,
          (SELECT COUNT(*) FROM EQUIPMENT_LOAN 
          WHERE issued_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalLoans30d
        FROM GYM_ENTRY 
        WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `) as any

      const totalsData = totals[0]

      // =========================
      // 8. RECENT ACTIVITY
      // =========================
      const [recentGym] = await pool.execute(`
        SELECT 
          entry_id as id,
          student_id as studentRollNo,
          'Gym Entry' as type,
          CONCAT(HOUR(entry_time), 'h') as category,
          'N/A' as price,
          CASE 
            WHEN exit_time IS NULL THEN 'Pending'
            ELSE 'Delivered' 
          END as status,
          DATE(entry_time) as date
        FROM GYM_ENTRY 
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY entry_time DESC 
        LIMIT 5
      `) as any

      const [recentLoans] = await pool.execute(`
        SELECT 
          el.loan_id as id,
          el.student_id as studentRollNo,
          'Loan' as type,
          e.name as category,
          CONCAT('Qty: ', el.quantity) as price,
          CASE el.status
            WHEN 'ISSUED' THEN 'Pending'
            WHEN 'OVERDUE' THEN 'Canceled'
            WHEN 'RETURNED' THEN 'Delivered'
          END as status,
          DATE(el.issued_at) as date
        FROM equipment_loan el
        LEFT JOIN equipment e ON e.equipment_id = el.equipment_id
        WHERE el.issued_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY el.issued_at DESC
        LIMIT 5
      `) as any

      const recentOrders = [...recentGym, ...recentLoans]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      // Recent Gym Entries - Past 30 days
      const gymLimit = searchParams.get('gymLimit') || '2';
      const [recentGymEntriesRaw] = await pool.execute(`
        SELECT entry_id, student_id, recorded_by, entry_time, exit_time, created_at
        FROM GYM_ENTRY 
        WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY entry_time DESC 
        LIMIT ?
      `, [gymLimit]) as any;

      const recentGymEntries = recentGymEntriesRaw || [];

      // Recent Loans - Past 30 days  
      const loanLimit = searchParams.get('loanLimit') || '2';
      const [recentLoansRaw] = await pool.execute(`
        SELECT loan_id, equipment_id, student_id, quantity, issued_by, issued_at, due_date, returned_at, returned_by, status, created_at
        FROM EQUIPMENT_LOAN
        WHERE issued_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY issued_at DESC 
        LIMIT ?
      `, [loanLimit]) as any;

      const recentLoansData = recentLoansRaw || [];

      return NextResponse.json({
        dailyTrend,
        weeklyTrend,
        monthlyTrend,
        peakGymHours: peakGym,
        peakLoanHours: peakLoans,
        gymHeatmap: gymHeatArray,
        loanHeatmap: loanHeatArray,
        growthSummary: {
          gymWeekly: Number(gymWeekly.toFixed(1)),
          loanWeekly: Number(loanWeekly.toFixed(1))
        },
        totals: totalsData,
        recentOrders,
        recentGymEntries,
        recentLoans: recentLoansData
      })

    } catch (error: any) {
      console.error('Analytics error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }