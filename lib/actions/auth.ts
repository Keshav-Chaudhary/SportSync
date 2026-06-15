'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db/mysql'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { generateToken } from '@/lib/auth/jwt'
import { setSession, getSession, clearSession } from '@/lib/auth/session'

export async function signUp(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string
    const rollNo = formData.get('rollNo') as string
    const isHosteler = formData.get('isHosteler') === 'true'
    const roomNo = formData.get('roomNo') as string
    const hostelName = formData.get('hostelName') as string
    const department = formData.get('department') as string
    const position = formData.get('position') as string
    const adminCode = formData.get('adminCode') as string

    // Validate inputs
    if (!email || !password || !firstName || !lastName || !role) {
      return { error: 'Missing required fields' }
    }

    if (role === 'Student' && !rollNo) {
      return { error: 'Roll number is required for students' }
    }

    // If attempting to create an Admin via signup, validate admin code early
    if (role === 'Admin') {
      const expected = process.env.ADMIN_SIGNUP_CODE || ''
      if (!adminCode || adminCode !== expected) {
        return { error: 'Invalid admin signup code' }
      }
    }

    // Check if user already exists
    const [existingUser] = await pool.query(
      'SELECT user_id FROM USER_ACCOUNT WHERE email = ?',
      [email]
    ) as any

    if (existingUser && existingUser.length > 0) {
      return { error: 'User already exists' }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert user
    const [userResult] = await pool.query(
      'INSERT INTO USER_ACCOUNT (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    ) as any

    const userId = userResult.insertId

    // Insert role
    const roleEnum = role === 'Student' ? 'STUDENT' : role === 'Staff' ? 'STAFF' : 'ADMIN'
    await pool.query(
      'INSERT INTO USER_ROLES (user_id, role) VALUES (?, ?)',
      [userId, roleEnum]
    )

    // Create profile based on role
    if (role === 'Student') {
      await pool.query(
        'INSERT INTO STUDENT (roll_no, user_id, name, email, phone, is_hosteler, room_no, hostel_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [rollNo, userId, `${firstName} ${lastName}`, email, phone || null, isHosteler, roomNo || null, hostelName || null]
      )
    } else if (role === 'Staff' || role === 'Admin') {
      await pool.query(
        'INSERT INTO STAFF (user_id, name, email, phone) VALUES (?, ?, ?, ?)',
        [userId, `${firstName} ${lastName}`, email, '']
      )
    }

    return { success: true, message: 'Account created successfully. Please log in.' }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { error: error.message || 'Sign up failed' }
  }
}

export async function signIn(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    // Get user from database
    const [users] = await pool.query(
      `SELECT ua.user_id, ua.email, ua.password_hash, ur.role 
       FROM USER_ACCOUNT ua
       LEFT JOIN USER_ROLES ur ON ua.user_id = ur.user_id
       WHERE ua.email = ?`,
      [email]
    ) as any

    if (!users || users.length === 0) {
      return { error: 'Invalid email or password' }
    }

    const user = users[0]

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return { error: 'Invalid email or password' }
    }

    // Generate JWT token
    const token = generateToken({
      user_id: user.user_id.toString(),
      email: user.email,
      role: user.role || 'STUDENT',
    })

    // Set session
    await setSession(token)

    revalidatePath('/', 'layout')

    // Return success with role (client will redirect)
    const roleName = user.role || 'STUDENT'
    return { 
      success: true, 
      role: roleName,
      message: 'Sign in successful'
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { error: error.message || 'Sign in failed' }
  }
}

export async function signOut() {
  try {
    await clearSession()
    revalidatePath('/', 'layout')
    redirect('/auth/login')
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { error: error.message || 'Sign out failed' }
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
    
    if (!session) {
      return null
    }

    // Get user details from database
    const [users] = await pool.query(
      `SELECT ua.user_id, ua.email, ur.role, ua.created_at
       FROM USER_ACCOUNT ua
       LEFT JOIN USER_ROLES ur ON ua.user_id = ur.user_id
       WHERE ua.user_id = ?`,
      [session.user_id]
    ) as any

    if (!users || users.length === 0) {
      return null
    }

    const user = users[0]

    // Get profile based on role
    let profile = null
    if (user.role === 'STUDENT') {
      const [studentData] = await pool.query(
        'SELECT * FROM STUDENT WHERE user_id = ?',
        [user.user_id]
      ) as any
      if (studentData && studentData.length > 0) {
        profile = studentData[0]
      }
    } else if (user.role === 'STAFF' || user.role === 'ADMIN') {
      const [staffData] = await pool.query(
        'SELECT * FROM STAFF WHERE user_id = ?',
        [user.user_id]
      ) as any
      if (staffData && staffData.length > 0) {
        profile = staffData[0]
      }
    }

    return {
      user_id: user.user_id,
      email: user.email,
      role: user.role || 'STUDENT',
      created_at: user.created_at,
      profile,
    }
  } catch (error: any) {
    console.error('Get current user error:', error)
    return null
  }
}
