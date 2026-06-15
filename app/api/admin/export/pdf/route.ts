import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import PDFDocument from 'pdfkit'

const COLORS = {
  // ─── Base UI Theme (matches your Tailwind OKLCH system) ───
  primary:     '#0a0a0a',   // --primary (near-black in your theme)
  primaryDark: '#171717',   // stronger contrast border/footer

  headerText:  '#ffffff',

  // ─── Surfaces ───
  rowAlt:      '#f5f5f5',   // --muted / --secondary
  rowWhite:    '#ffffff',

  // ─── Borders ───
  border:      '#e5e5e5',   // --border

  // ─── Text ───
  sectionTitle:'#0a0a0a',   // primary text
  bodyText:    '#171717',   // foreground
  mutedText:   '#737373',   // --muted-foreground

  // ─── Cards / Highlights ───
  summaryBg:   '#f5f5f5',   // same as muted background
  summaryBorder:'#e5e5e5',

  // ─── Badges (kept semantic, slightly softened for UI consistency) ───
  badge: {
    blue:   { bg: '#dbeafe', text: '#1e3a8a' },
    green:  { bg: '#dcfce7', text: '#166534' },
    red:    { bg: '#fee2e2', text: '#991b1b' },
    yellow: { bg: '#fef9c3', text: '#854d0e' },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Draw a filled rounded-ish rectangle (PDFKit has no native border-radius, so we simulate with rect) */
function filledRect(doc: any, x: number, y: number, w: number, h: number, color: string) {
  doc.save().rect(x, y, w, h).fill(color).restore()
}

/** Draw a bordered rectangle */
function strokedRect(doc: any, x: number, y: number, w: number, h: number, color: string, lineWidth = 0.5) {
  doc.save().lineWidth(lineWidth).rect(x, y, w, h).stroke(color).restore()
}

/**
 * Draws a full table with a colored header row and alternating body rows.
 * Returns the final Y position after the table.
 */
function drawTable(
  doc: any,
  headers: string[],
  rows: any[],
  startX: number,
  startY: number,
  colWidths: number[],
  rowHeight = 20,
  headerHeight = 24
): number {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0)
  let y = startY

  // ── Header row ──
  filledRect(doc, startX, y, tableWidth, headerHeight, COLORS.primary)
  strokedRect(doc, startX, y, tableWidth, headerHeight, COLORS.primaryDark)

  let x = startX
  headers.forEach((h, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(COLORS.headerText)
      .text(h.toUpperCase(), x + 4, y + 7, { width: colWidths[i] - 8, align: 'left', lineBreak: false })
    x += colWidths[i]
  })
  y += headerHeight

  // ── Body rows ──
  rows.forEach((row, rowIdx) => {
    const bg = rowIdx % 2 === 0 ? COLORS.rowWhite : COLORS.rowAlt

    // check if we need a new page
    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage()
      y = 60
      // re-draw header on new page
      filledRect(doc, startX, y, tableWidth, headerHeight, COLORS.primary)
      strokedRect(doc, startX, y, tableWidth, headerHeight, COLORS.primaryDark)
      let hx = startX
      headers.forEach((h, i) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(COLORS.headerText)
          .text(h.toUpperCase(), hx + 4, y + 7, { width: colWidths[i] - 8, align: 'left', lineBreak: false })
        hx += colWidths[i]
      })
      y += headerHeight
    }

    filledRect(doc, startX, y, tableWidth, rowHeight, bg)
    strokedRect(doc, startX, y, tableWidth, rowHeight, COLORS.border, 0.3)

    let cx = startX
    headers.forEach((h, i) => {
      const rawVal = row[h]
      const val = rawVal == null ? '—' : String(rawVal)
      // Truncate long values
      const display = val.length > 28 ? val.slice(0, 26) + '…' : val
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.bodyText)
        .text(display, cx + 4, y + 5, { width: colWidths[i] - 8, align: 'left', lineBreak: false })
      cx += colWidths[i]
    })
    // vertical dividers
    let dvx = startX
    headers.forEach((_, i) => {
      dvx += colWidths[i]
      doc.save().lineWidth(0.3).moveTo(dvx, y).lineTo(dvx, y + rowHeight).stroke(COLORS.border).restore()
    })

    y += rowHeight
  })

  // bottom border of table
  doc.save().lineWidth(0.5).moveTo(startX, y).lineTo(startX + tableWidth, y).stroke(COLORS.border).restore()

  return y
}

/** Section heading with a colored left bar */
function drawSectionHeading(doc: any, title: string, y: number): number {
  if (y > doc.page.height - 100) {
    doc.addPage()
    y = 50
  }
  filledRect(doc, 40, y, 4, 22, COLORS.primary)
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.sectionTitle).text(title, 52, y + 4)
  return y + 32
}

/** Summary stat card */
function drawStatCard(doc: any, label: string, value: string | number, x: number, y: number, w: number) {
  filledRect(doc, x, y, w, 48, COLORS.summaryBg)
  strokedRect(doc, x, y, w, 48, COLORS.summaryBorder)
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.mutedText).text(label, x + 8, y + 8, { width: w - 16, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.primary).text(String(value), x + 8, y + 20, { width: w - 16, align: 'center' })
}

// ─── Route ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const results = await Promise.all([
      pool.query(`SELECT 
        (SELECT COUNT(*) FROM user_account) as total_users,
        (SELECT COUNT(*) FROM student) as total_students,
        (SELECT COUNT(*) FROM staff) as total_staff,
        (SELECT COUNT(*) FROM equipment) as total_equipment,
        (SELECT COUNT(*) FROM equipment_loan WHERE status = 'ISSUED') as active_loans,
        (SELECT COUNT(*) FROM equipment_loan WHERE status = 'OVERDUE') as overdue_loans,
        (SELECT COUNT(*) FROM gym_entry) as total_gym_entries
      `),
      pool.query('SELECT * FROM user_account ORDER BY created_at DESC'),
      pool.query('SELECT * FROM user_roles ORDER BY id DESC'),
      pool.query(`SELECT s.*, u.email as user_email FROM student s LEFT JOIN user_account u ON s.user_id = u.user_id ORDER BY s.created_at DESC`),
      pool.query(`SELECT s.*, u.email as user_email FROM staff s LEFT JOIN user_account u ON s.user_id = u.user_id ORDER BY s.created_at DESC`),
      pool.query('SELECT * FROM equipment_category ORDER BY name'),
      pool.query(`SELECT e.*, ec.name as category_name FROM equipment e JOIN equipment_category ec ON e.category_id = ec.category_id ORDER BY e.name`),
      pool.query(`SELECT el.*, e.name as equipment_name, ec.name as category_name, s.name as student_name, st.name as issued_by_staff FROM equipment_loan el JOIN equipment e ON el.equipment_id = e.equipment_id JOIN equipment_category ec ON e.category_id = ec.category_id LEFT JOIN student s ON el.student_id = s.roll_no LEFT JOIN staff st ON el.issued_by = st.staff_id ORDER BY el.created_at DESC`),
      pool.query(`SELECT ge.*, s.name as student_name, st.name as recorded_by_staff FROM gym_entry ge LEFT JOIN student s ON ge.student_id = s.roll_no LEFT JOIN staff st ON ge.recorded_by = st.staff_id ORDER BY ge.entry_time DESC`)
    ])

    const summary     = (results[0] as any)[0][0]
    const userAccounts = (results[1] as any)[0] as any[]
    const userRoles   = (results[2] as any)[0] as any[]
    const students    = (results[3] as any)[0] as any[]
    const staff       = (results[4] as any)[0] as any[]
    const categories  = (results[5] as any)[0] as any[]
    const equipment   = (results[6] as any)[0] as any[]
    const loans       = (results[7] as any)[0] as any[]
    const gymEntries  = (results[8] as any)[0] as any[]

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const chunks: Buffer[] = []
      doc.on('data', (c: Buffer) => chunks.push(c))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageW = doc.page.width   // 595
      const marginL = 40
      const contentW = pageW - marginL * 2  // 515

      // ══════════════════════════════════════════
      //  COVER HEADER
      // ══════════════════════════════════════════
      filledRect(doc, 0, 0, pageW, 90, COLORS.primary)
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text('Gym & Sports System', marginL, 18)
      doc.font('Helvetica').fontSize(12).fillColor('#bfdbfe').text('Complete Admin Report', marginL, 46)
      doc.font('Helvetica').fontSize(9).fillColor('#93c5fd')
        .text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, marginL, 66)

      // right side: page count label
      doc.font('Helvetica').fontSize(9).fillColor('#bfdbfe')
        .text('CONFIDENTIAL — ADMIN ONLY', 0, 66, { align: 'right', width: pageW - marginL })

      let y = 110

      // ══════════════════════════════════════════
      //  1. SUMMARY STAT CARDS
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '1. System Summary', y)

      const stats = [
        { label: 'Total Users',   value: summary.total_users },
        { label: 'Students',      value: summary.total_students },
        { label: 'Staff',         value: summary.total_staff },
        { label: 'Equipment',     value: summary.total_equipment },
        { label: 'Active Loans',  value: summary.active_loans },
        { label: 'Overdue',       value: summary.overdue_loans },
        { label: 'Gym Entries',   value: summary.total_gym_entries },
      ]
      const cardW = Math.floor(contentW / 4) - 6
      stats.forEach((s, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        drawStatCard(doc, s.label, s.value, marginL + col * (cardW + 8), y + row * 58, cardW)
      })
      y += Math.ceil(stats.length / 4) * 58 + 20

      // ══════════════════════════════════════════
      //  2. USER ACCOUNTS
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '2. User Accounts', y)
      y = drawTable(doc,
        ['user_id', 'email', 'created_at'],
        userAccounts,
        marginL, y,
        [60, 280, 175]
      )
      y += 18

      // ══════════════════════════════════════════
      //  3. USER ROLES
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '3. User Roles', y)
      y = drawTable(doc,
        ['id', 'user_id', 'role'],
        userRoles,
        marginL, y,
        [80, 120, 315]
      )
      y += 18

      // ══════════════════════════════════════════
      //  4. STUDENTS
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '4. Students', y)
      y = drawTable(doc,
        ['roll_no', 'name', 'user_email', 'phone'],
        students,
        marginL, y,
        [80, 150, 195, 90]
      )
      y += 18

      // ══════════════════════════════════════════
      //  5. STAFF
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '5. Staff', y)
      y = drawTable(doc,
        ['staff_id', 'name', 'user_email', 'phone'],
        staff,
        marginL, y,
        [70, 150, 205, 90]
      )
      y += 18

      // ══════════════════════════════════════════
      //  6. EQUIPMENT CATEGORIES
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '6. Equipment Categories', y)
      y = drawTable(doc,
        ['category_id', 'name', 'max_loan_days'],
        categories,
        marginL, y,
        [100, 300, 115]
      )
      y += 18

      // ══════════════════════════════════════════
      //  7. EQUIPMENT INVENTORY
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '7. Equipment Inventory', y)
      y = drawTable(doc,
        ['equipment_id', 'name', 'category_name', 'total_quantity', 'available_quantity'],
        equipment,
        marginL, y,
        [80, 160, 140, 70, 65]
      )
      y += 18

      // ══════════════════════════════════════════
      //  8. EQUIPMENT LOANS
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '8. Equipment Loans', y)
      y = drawTable(doc,
        ['loan_id', 'student_name', 'equipment_name', 'quantity', 'status'],
        loans,
        marginL, y,
        [55, 145, 160, 60, 95]
      )
      y += 18

      // ══════════════════════════════════════════
      //  9. GYM ENTRIES
      // ══════════════════════════════════════════
      y = drawSectionHeading(doc, '9. Gym Entries', y)
      y = drawTable(doc,
        ['entry_id', 'student_name', 'entry_time', 'recorded_by_staff'],
        gymEntries,
        marginL, y,
        [65, 165, 165, 120]
      )

      // ══════════════════════════════════════════
      //  FOOTER on last page
      // ══════════════════════════════════════════
      const footerY = doc.page.height - 36
      filledRect(doc, 0, footerY, pageW, 36, COLORS.primaryDark)
      doc.font('Helvetica').fontSize(8).fillColor('#bfdbfe')
        .text('Gym & Sports Management System  •  Auto-generated admin report  •  Do not distribute', marginL, footerY + 12, { width: contentW, align: 'center' })

      doc.end()
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=admin-complete-report.pdf',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}