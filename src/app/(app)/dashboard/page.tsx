import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Topbar from '@/components/layout/Topbar'
import MetricsRow from '@/components/dashboard/MetricsRow'
import PipelineCard from '@/components/dashboard/PipelineCard'
import ScheduleCard from '@/components/dashboard/ScheduleCard'
import RecentPostsCard from '@/components/dashboard/RecentPostsCard'
import IntegrationStatusCard from '@/components/dashboard/IntegrationStatusCard'
import RunNowButton from '@/components/dashboard/RunNowButton'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at')
    .limit(1)

  const brand = brands?.[0] || null

  const { data: posts } = brand
    ? await supabase
        .from('posts')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const { data: schedule } = brand
    ? await supabase
        .from('schedules')
        .select('*')
        .eq('brand_id', brand.id)
        .single()
    : { data: null }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: monthlyCount } = brand
    ? await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id)
        .eq('status', 'published')
        .gte('created_at', monthStart)
    : { count: 0 }

  const isActive = brand?.status === 'active'

  // Check how complete the setup is
  const hasShopify = !!(brand?.shopify_store_domain && brand?.shopify_access_token)
  const hasGemini = !!brand?.gemini_api_key
  const hasZernio = !!(brand?.zernio_api_key && brand?.zernio_account_id)
  const setupComplete = hasShopify && hasGemini && hasZernio

  const setupSteps = [
    {
      num: 1,
      label: 'Create a brand',
      description: 'Give your store an identity in the app',
      done: !!brand,
      href: '/brands',
      cta: 'Go to Brands',
    },
    {
      num: 2,
      label: 'Connect Shopify',
      description: 'Link your store so we can fetch your products',
      done: hasShopify,
      href: '/integrations',
      cta: 'Connect Shopify',
    },
    {
      num: 3,
      label: 'Add Gemini API key',
      description: 'Powers caption writing and AI image generation',
      done: hasGemini,
      href: '/integrations',
      cta: 'Add API key',
    },
    {
      num: 4,
      label: 'Connect Zernio',
      description: 'Publishes your posts to Instagram automatically',
      done: hasZernio,
      href: '/integrations',
      cta: 'Connect Zernio',
    },
    {
      num: 5,
      label: 'Set your posting schedule',
      description: 'Choose which days and time to auto-post',
      done: !!(schedule?.days_of_week?.length),
      href: '/schedule',
      cta: 'Set schedule',
    },
  ]

  const completedSteps = setupSteps.filter(s => s.done).length

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Dashboard"
        statusLabel={
          !brand ? 'No brand' :
          !setupComplete ? 'Setup incomplete' :
          isActive ? 'Workflow active' : 'Workflow paused'
        }
        statusType={
          !brand ? 'gray' :
          !setupComplete ? 'amber' :
          isActive ? 'green' : 'amber'
        }
        actions={brand && setupComplete ? <RunNowButton brandId={brand.id} /> : null}
      />

      <div className="p-7 space-y-6 flex-1 overflow-y-auto">

        {/* ── Getting started checklist (shown until setup is complete) ── */}
        {!setupComplete && (
          <div className="card">
            <div className="card-header">
              <div>
                <span className="text-sm font-medium text-ink">Getting started</span>
                <span className="ml-2 text-xs text-ink-3">{completedSteps} of {setupSteps.length} steps done</span>
              </div>
              {/* Progress bar */}
              <div className="w-32 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ink rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-border">
              {setupSteps.map((step) => (
                <div key={step.num} className="flex items-center gap-4 px-4 py-3.5">
                  {/* Step indicator */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
                    step.done
                      ? 'bg-brand-green text-white'
                      : 'bg-surface-2 text-ink-3 border border-border'
                  }`}>
                    {step.done ? '✓' : step.num}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${step.done ? 'text-ink-3 line-through' : 'text-ink'}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-ink-3 mt-0.5">{step.description}</div>
                  </div>

                  {/* CTA */}
                  {!step.done && (
                    <a href={step.href} className="btn btn-ghost text-xs py-1.5 flex-shrink-0">
                      {step.cta} →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Big CTA when no brand exists */}
            {!brand && (
              <div className="px-4 pb-4 pt-1">
                <div className="bg-surface-2 rounded-md p-4 flex items-start gap-3">
                  <div className="text-2xl">👋</div>
                  <div>
                    <div className="text-sm font-medium text-ink mb-0.5">Welcome to Sheeen Auto Publish</div>
                    <div className="text-xs text-ink-3 mb-3">
                      Start by creating a brand — this represents your Shopify store. Then connect your integrations and you will be posting to Instagram automatically.
                    </div>
                    <a href="/brands" className="btn btn-primary text-xs">
                      Create your first brand →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Next step hint when brand exists but setup incomplete */}
            {brand && !setupComplete && (
              <div className="px-4 pb-4 pt-1">
                <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-800">
                  <strong>Next step:</strong>{' '}
                  {!hasShopify
                    ? <>Go to <a href="/integrations" className="underline font-medium">Integrations</a> and connect your Shopify store.</>
                    : !hasGemini
                    ? <>Go to <a href="/integrations" className="underline font-medium">Integrations</a> and add your Gemini API key.</>
                    : !hasZernio
                    ? <>Go to <a href="/integrations" className="underline font-medium">Integrations</a> and connect Zernio for Instagram publishing.</>
                    : <>Go to <a href="/schedule" className="underline font-medium">Schedule</a> and set your posting days.</>
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Full dashboard (only shown when setup is complete) ── */}
        {brand && setupComplete && (
          <>
            <MetricsRow
              postsThisMonth={monthlyCount || 0}
              schedule={schedule}
              postsTotal={posts?.length || 0}
            />
            <div className="grid grid-cols-2 gap-5">
              <PipelineCard />
              <ScheduleCard schedule={schedule} brandId={brand.id} />
              <RecentPostsCard posts={posts || []} />
              <IntegrationStatusCard brand={brand} />
            </div>
          </>
        )}

      </div>
    </div>
  )
}