import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { setAdminSessionCookie } from '@/lib/server/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: settings, error } = await supabase
      .from('settings')
      .select('admin_password')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to validate admin password' }, { status: 500 })
    }

    if (!settings || password !== settings.admin_password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    setAdminSessionCookie(response)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
