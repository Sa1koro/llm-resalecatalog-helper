import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasAdminSession } from '@/lib/server/admin-auth'

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('contact_methods').insert([payload]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create contact method'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
