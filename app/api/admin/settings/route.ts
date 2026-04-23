import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasAdminSession } from '@/lib/server/admin-auth'

export async function PATCH(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const { id, ...updates } = payload ?? {}

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'settings id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('settings').update(updates).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
