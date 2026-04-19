import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createAdminClient } from '@/lib/supabase/client'
import { runPipeline } from '@/lib/pipeline/engine'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { brandId } = await req.json()
    if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

    // Fetch brand (verify ownership)
    const admin = createAdminClient()
    const { data: brand, error } = await admin
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Run pipeline async (returns immediately, runs in background)
    const result = await runPipeline(brand, 'manual')
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
