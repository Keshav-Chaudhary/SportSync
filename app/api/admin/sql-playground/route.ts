import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db/mysql'
import { getSession } from '@/lib/auth/session'

const QUERIES = {
  'basic-commit': {
    name: 'Basic Commit (Successful Loan)',
    sql: `
    START TRANSACTION;

    SELECT available_quantity
    FROM EQUIPMENT
    WHERE equipment_id = 1
    FOR UPDATE;

    INSERT INTO EQUIPMENT_LOAN (
        equipment_id, student_id, quantity, issued_by,
        issued_at, due_date, status
    )
    VALUES (
        1, '005', 1, 3,
        NOW(), DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), 'ISSUED'
    );

    COMMIT;
    `,
    description: 'Demonstrates a successful transaction with SELECT FOR UPDATE and INSERT; stock is updated by the DB trigger'
  },
  'rollback-demo': {
    name: 'Rollback Demo',
    sql: `
START TRANSACTION;

UPDATE EQUIPMENT
SET available_quantity = available_quantity - 2
WHERE equipment_id = 1;

ROLLBACK;
    `,
    description: 'Shows how ROLLBACK undoes changes'
  },
  'trigger-failure': {
    name: 'Trigger Failure (Insufficient Stock)',
    sql: `
START TRANSACTION;

INSERT INTO EQUIPMENT_LOAN (
    equipment_id, student_id, quantity, issued_by,
    issued_at, due_date, status
)
VALUES (
    1, '005', 100, 3,
    NOW(), DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), 'ISSUED'
);

ROLLBACK;
    `,
    description: 'Attempts to loan more than available stock (should fail due to check constraint)'
  },
  'row-lock': {
    name: 'Row Lock Demo',
    sql: `
START TRANSACTION;

SELECT * FROM EQUIPMENT
WHERE equipment_id = 1
FOR UPDATE;

-- Keep this open and try another transaction
    `,
    description: 'Locks a row for update - use in simulation mode'
  },
  'return-equipment': {
    name: 'Return Equipment (Trigger Test)',
    sql: `
START TRANSACTION;

UPDATE EQUIPMENT_LOAN
SET status = 'RETURNED',
    returned_at = NOW(),
    returned_by = 3
WHERE loan_id = 2; // change it to your actual loan_id that is currently ISSUED

COMMIT;
    `,
    description: 'Updates loan status to returned'
  },
  'non-repeatable-read': {
    name: 'Non-repeatable Read Demo',
    sql: `
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

START TRANSACTION;

SELECT available_quantity FROM EQUIPMENT WHERE equipment_id = 1;

-- Update same row in another session

SELECT available_quantity FROM EQUIPMENT WHERE equipment_id = 1;

COMMIT;
    `,
    description: 'Demonstrates non-repeatable read anomaly'
  },
  'phantom-read': {
    name: 'Phantom Read Demo',
    sql: `
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

START TRANSACTION;

SELECT COUNT(*) FROM EQUIPMENT_LOAN WHERE status = 'ISSUED';

-- Insert new loan in another session

SELECT COUNT(*) FROM EQUIPMENT_LOAN WHERE status = 'ISSUED';

COMMIT;
    `,
    description: 'Demonstrates phantom read anomaly'
  },
  'foreign-key-failure': {
    name: 'Foreign Key Failure',
    sql: `
START TRANSACTION;

INSERT INTO EQUIPMENT_LOAN (
    equipment_id, student_id, quantity, issued_by,
    issued_at, due_date, status
)
VALUES (
    1, '005', 1, 999, -- invalid staff
    NOW(), DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), 'ISSUED'
);

ROLLBACK;
    `,
    description: 'Attempts to insert with invalid foreign key reference'
  },
  'multiple-operations': {
    name: 'Multiple Operations Transaction',
    sql: `
START TRANSACTION;

SELECT available_quantity
FROM EQUIPMENT
WHERE equipment_id = 1
FOR UPDATE;

INSERT INTO EQUIPMENT_LOAN (
    equipment_id, student_id, quantity, issued_by,
    issued_at, due_date, status
)
VALUES (
    1, '005', 1, 3,
    NOW(), DATE(DATE_ADD(NOW(), INTERVAL 7 DAY)), 'ISSUED'
);

COMMIT;
    `,
    description: 'Demonstrates SELECT FOR UPDATE and INSERT in a transaction; stock is updated by the DB trigger'
  },
  'deadlock-demo': {
    name: 'Deadlock Demo (Advanced)',
    sql: `
-- Terminal 1:
START TRANSACTION;
UPDATE EQUIPMENT SET available_quantity = 5 WHERE equipment_id = 1;

-- Terminal 2:
START TRANSACTION;
UPDATE EQUIPMENT SET available_quantity = 6 WHERE equipment_id = 2;

-- Then cross update → 💥 deadlock
    `,
    description: 'Setup for deadlock demonstration (requires multiple sessions)'
  },
  'check-triggers': {
    name: 'Check Database Triggers',
    sql: `
SELECT 
    TRIGGER_NAME,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    EVENT_MANIPULATION,
    ACTION_STATEMENT
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = DATABASE()
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;
    `,
    description: 'List all database triggers to verify they exist'
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let connection = null
  try {
    const { queryId, customSql } = await request.json()

    let sql: string
    let queryName: string
    let description: string

    if (queryId && QUERIES[queryId as keyof typeof QUERIES]) {
      const query = QUERIES[queryId as keyof typeof QUERIES]
      sql = query.sql
      queryName = query.name
      description = query.description
    } else if (customSql) {
      if (!customSql.trim().toUpperCase().startsWith('SELECT')) {
        return NextResponse.json(
          { error: 'Custom SQL queries are limited to SELECT statements for security' },
          { status: 400 }
        )
      }
      sql = customSql
      queryName = 'Custom Query'
      description = 'User-defined SELECT query'
    } else {
      return NextResponse.json(
        { error: 'Either queryId or customSql must be provided' },
        { status: 400 }
      )
    }

    // Get a connection for transaction support
    connection = await pool.getConnection()

    // Split SQL into individual statements (basic splitting by semicolon)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let results: any[] = []
    let lastResult: any = null

    // Execute each statement
    for (const statement of statements) {
      if (statement.toUpperCase().includes('START TRANSACTION')) {
        await connection.beginTransaction()
      } else if (statement.toUpperCase().includes('COMMIT')) {
        await connection.commit()
      } else if (statement.toUpperCase().includes('ROLLBACK')) {
        await connection.rollback()
      } else {
        // Execute the statement
        const [rows] = await connection.query(statement) as any
        lastResult = rows
        results.push({ statement, result: rows })
      }
    }

    return NextResponse.json({
      success: true,
      queryName,
      description,
      sql: sql.trim(),
      results,
      lastResult,
      affectedRows: Array.isArray(lastResult) ? lastResult.length : (lastResult?.affectedRows || 0)
    })

  } catch (error: any) {
    // If we have a connection and transaction is active, rollback
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    console.error('SQL execution error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Query execution failed',
        sqlState: error.sqlState,
        errno: error.errno
      },
      { status: 500 }
    )
  } finally {
    if (connection) {
      connection.release()
    }
  }
}