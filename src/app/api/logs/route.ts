import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brandId = req.nextUrl.searchParams.get('brandId')
  const postId = req.nextUrl.searchParams.get('postId')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100')

  let query = supabase
    .from('run_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (brandId) query = query.eq('brand_id', brandId)
  if (postId) query = query.eq('post_id', postId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
