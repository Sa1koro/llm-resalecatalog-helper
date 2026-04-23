import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/server/admin-auth'

export async function GET() {
  try {
    const authenticated = await hasAdminSession()
    return NextResponse.json({ authenticated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check admin session'
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 })
  }
}
