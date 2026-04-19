import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { runPipeline } from '@/lib/pipeline/engine'

// Called by Vercel Cron (set in vercel.json) or any external cron service
// Vercel Cron hits this every hour; we check which brands should post now
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const currentDay = now.getDay()       // 0-6
  const currentHour = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()

  // Fetch all active schedules
  const { data: schedules } = await admin
    .from('schedules')
    .select('*, brands(*)')
    .eq('is_active', true)

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ message: 'No active schedules', ran: 0 })
  }

  const results = []

  for (const schedule of schedules) {
    const brand = schedule.brands
    if (!brand || brand.status !== 'active') continue

    // Check if today is a posting day
    if (!schedule.days_of_week.includes(currentDay)) continue

    // Parse post time (HH:MM in UTC)
    const [h, m] = schedule.post_time.split(':').map(Number)
    if (currentHour !== h || Math.abs(currentMinute - m) > 5) continue

    // Check we haven't already posted in the last 30 min (prevent duplicates)
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brand.id)
      .gte('created_at', thirtyMinsAgo)

    if (count && count > 0) {
      results.push({ brand: brand.name, skipped: true, reason: 'Already posted recently' })
      continue
    }

    // Run the pipeline
    const result = await runPipeline(brand, 'schedule')
    results.push({ brand: brand.name, ...result })
  }

  return NextResponse.json({ message: 'Cron ran', ran: results.length, results })
}
