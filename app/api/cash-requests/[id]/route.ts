import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updates = await req.json()

    const supabase = await createSupabaseServerClient()

    // Authenticate user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    const isFinance = profile?.role === 'FINANCE' || profile?.role === 'ADMIN'

    // Load existing record
    const { data: existing, error: loadError } = await supabase
      .from('cash_requests')
      .select('*')
      .eq('id', id)
      .single()
    if (loadError || !existing) {
      return NextResponse.json({ error: loadError?.message || 'Not found' }, { status: 404 })
    }

    // Authorization rules
    if (!isFinance) {
      // STAFF can only modify their own
      if (existing.created_by !== userData.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // STAFF cannot change status
      if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
        return NextResponse.json({ error: 'Forbidden: cannot change status' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('cash_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = await createSupabaseServerClient()

    // Authenticate user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    const isFinance = profile?.role === 'FINANCE' || profile?.role === 'ADMIN'

    // Load existing record
    const { data: existing, error: loadError } = await supabase
      .from('cash_requests')
      .select('id, created_by, status')
      .eq('id', id)
      .single()
    if (loadError || !existing) {
      return NextResponse.json({ error: loadError?.message || 'Not found' }, { status: 404 })
    }

    // STAFF can delete only their own PENDING requests
    if (!isFinance) {
      if (existing.created_by !== userData.user.id || existing.status !== 'PENDING') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const { error } = await supabase
      .from('cash_requests')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 })
  }
}