import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Decode JWT role (client-side, Edge Runtime)
  let role = null
  try {
    const base64Url = token.split('.')[1]
    if (base64Url) {
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const payload = JSON.parse(jsonPayload)
      role = payload.role
    }
  } catch (e) {
    console.error('JWT decode error in middleware:', e)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!role) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Role-based route mapping
  const rolePaths = {
    'ADMIN': ['/admin', '/staff', '/student', '/api', '/profile'],
    'STAFF': ['/staff', '/student', '/api', '/profile'],
    'STUDENT': ['/student', '/api', '/profile']
  }

  const allowedPaths = rolePaths[role as keyof typeof rolePaths] || []
  const isAllowed = allowedPaths.some(path => pathname.startsWith(path))

  if (!isAllowed) {
    // Redirect to role's home dashboard
    const roleDashboards = {
      'ADMIN': '/admin',
      'STAFF': '/staff',
      'STUDENT': '/student'
    }
    const dashboard = roleDashboards[role as keyof typeof roleDashboards] || '/auth/login'
    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  return NextResponse.next()
}
