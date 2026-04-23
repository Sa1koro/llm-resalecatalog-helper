import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasAdminSession } from '@/lib/server/admin-auth'

type Params = { params: { id: string } | Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await Promise.resolve(params)
    const updates = await request.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await Promise.resolve(params)
    const supabase = createAdminClient()
    const { error } = await supabase.from('items').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
