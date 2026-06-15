import { pool } from "@/lib/db/mysql";
import { NextResponse } from "next/server";

/**
 * CREATE USER_ACCOUNT
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password_hash } = body;

    if (!email || !password_hash) {
      return NextResponse.json(
        { error: "email and password_hash required" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query(
      "INSERT INTO USER_ACCOUNT (email, password_hash) VALUES (?, ?)",
      [email, password_hash]
    );

    return NextResponse.json({
      success: true,
      user_id: result.insertId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * READ ALL USERS
 */
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, email, created_at FROM USER_ACCOUNT"
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
