'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2, ShoppingBag, Unlink } from 'lucide-react'

interface IntegrationState {
  gemini_api_key: string
  gemini_caption_model: string
  gemini_image_model: string
  zernio_api_key: string
  zernio_account_id: string
  logo_url: string
  logo_drive_file_id: string
}

interface Brand {
  id: string
  name: string
  shopify_store_domain: string | null
  shopify_access_token: string | null
  gemini_api_key: string | null
  gemini_caption_model: string
  gemini_image_model: string
  zernio_api_key: string | null
  zernio_account_id: string | null
  logo_url: string | null
  logo_drive_file_id: string | null
}

type TestStatus = 'idle' | 'testing' | 'ok' | 'fail'

// ── Moved outside so it never causes parse issues ──────────────────────────
function TestIcon({ status }: { status: TestStatus | undefined }) {
  if (status === 'testing') return <Loader2 size={14} className="animate-spin text-ink-3" />
  if (status === 'ok') return <CheckCircle size={14} className="text-brand-green" />
  if (status === 'fail') return <XCircle size={14} className="text-brand-red" />
  return null
}

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<IntegrationState>({
    gemini_api_key: '',
    gemini_caption_model: 'gemini-2.0-flash',
    gemini_image_model: 'gemini-2.0-flash-exp',
    zernio_api_key: '',
    zernio_account_id: '',
    logo_url: '',
    logo_drive_file_id: '',
  })
  const [shopInput, setShopInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [tests, setTests] = useState<Record<string, TestStatus>>({})

  const loadBrand = () => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(brands => {
        setLoading(false)
        if (brands && brands.length > 0) {
          const b = brands[0]
          setBrand(b)
          setForm({
            gemini_api_key: b.gemini_api_key || '',
            gemini_caption_model: b.gemini_caption_model || 'gemini-2.0-flash',
            gemini_image_model: b.gemini_image_model || 'gemini-2.0-flash-exp',
            zernio_api_key: b.zernio_api_key || '',
            zernio_account_id: b.zernio_account_id || '',
            logo_url: b.logo_url || '',
            logo_drive_file_id: b.logo_drive_file_id || '',
          })
        } else {
          setBrand(null)
        }
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadBrand()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const shopifyStatus = searchParams.get('shopify')
    const shop = searchParams.get('shop')
    const msg = searchParams.get('msg')
    if (shopifyStatus === 'success' && shop) {
      toast.success('Shopify connected!', { description: `Connected to ${shop}` })
      loadBrand()
    } else if (shopifyStatus === 'denied') {
      toast.error('Shopify access denied', { description: 'You cancelled the connection.' })
    } else if (shopifyStatus === 'error') {
      toast.error('Shopify connection failed', { description: msg || 'Unknown error' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const set = (key: keyof IntegrationState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const save = async () => {
    if (!brand) return
    setSaving(true)
    const res = await fetch(`/api/brands/${brand.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) toast.success('Integrations saved')
    else toast.error('Failed to save')
    setSaving(false)
  }

  const connectShopify = () => {
    if (!brand) {
      toast.error('No brand found', { description: 'Please create a brand first.' })
      router.push('/brands')
      return
    }
    let shop = shopInput.trim()
    if (!shop) {
      toast.error('Enter your store domain first')
      return
    }
    shop = shop.replace(/https?:\/\//, '').replace(/\/$/, '').trim()
    if (!shop.includes('.')) shop = `${shop}.myshopify.com`
    window.location.href = `/api/shopify/connect?shop=${encodeURIComponent(shop)}&brandId=${brand.id}`
  }

  const disconnectShopify = async () => {
    if (!brand) return
    if (!confirm('Disconnect Shopify? The pipeline will stop working until you reconnect.')) return
    setDisconnecting(true)
    await fetch('/api/shopify/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandId: brand.id }),
    })
    toast.success('Shopify disconnected')
    loadBrand()
    setDisconnecting(false)
  }

  const testConnection = async (type: string, body: object) => {
    setTests(p => ({ ...p, [type]: 'testing' }))
    const res = await fetch('/api/integrations/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...body }),
    })
    const data = await res.json()
    setTests(p => ({ ...p, [type]: data.ok ? 'ok' : 'fail' }))
    if (data.ok) toast.success(`${type} connection OK`)
    else toast.error(`${type} failed`, { description: data.error })
  }

  const shopifyConnected = !!(brand?.shopify_store_domain && brand?.shopify_access_token)

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Integrations" />
        <div className="p-7 flex items-center gap-2 text-sm text-ink-3">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Integrations" />
        <div className="p-7 max-w-2xl">
          <div className="card">
            <div className="card-body">
              <div className="text-center py-10">
                <div className="text-4xl mb-4">🏪</div>
                <h2 className="text-base font-medium text-ink mb-2">No brand created yet</h2>
                <p className="text-sm text-ink-3 mb-6 max-w-sm mx-auto">
                  You need to create a brand before connecting your integrations. Head to Brands first, create your store, then come back here.
                </p>
                <a href="/brands" className="btn btn-primary">
                  Create your first brand →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Integrations"
        actions={
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save all'}
          </button>
        }
      />
      <div className="p-7 space-y-4 max-w-2xl overflow-y-auto">

        {/* Shopify */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-ink-2" />
              <span className="text-sm font-medium">Shopify</span>
            </div>
            {shopifyConnected && (
              <span className="badge-green">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Connected
              </span>
            )}
          </div>
          <div className="card-body">
            {shopifyConnected ? (
              <div className="flex items-center justify-between p-3 bg-brand-green-light rounded-md">
                <div>
                  <div className="text-sm font-medium text-brand-green">
                    ✓ {brand.shopify_store_domain}
                  </div>
                  <div className="text-xs text-green-700 mt-0.5">
                    OAuth connected · read_products access granted
                  </div>
                </div>
                <button
                  onClick={disconnectShopify}
                  disabled={disconnecting}
                  className="btn btn-ghost text-xs py-1 flex items-center gap-1 text-brand-red"
                >
                  <Unlink size={12} />
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-ink-3">
                  Connect your Shopify store with one click. You will be redirected to Shopify to approve access, then brought back here automatically.
                </p>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="yourstore.myshopify.com"
                    value={shopInput}
                    onChange={e => setShopInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && connectShopify()}
                  />
                  <button
                    onClick={connectShopify}
                    className="btn btn-primary flex-shrink-0 flex items-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    Connect Shopify
                  </button>
                </div>
                <p className="text-xs text-ink-3">
                  Enter just the domain e.g.{' '}
                  <code className="bg-surface-2 px-1 rounded">sheeen.myshopify.com</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gemini */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span className="text-base">✦</span>
              <span className="text-sm font-medium">Gemini AI</span>
            </div>
            <div className="flex items-center gap-2">
              <TestIcon status={tests['gemini']} />
              <button
                onClick={() => testConnection('gemini', { apiKey: form.gemini_api_key, model: form.gemini_caption_model })}
                className="btn btn-ghost text-xs py-1"
              >
                Test
              </button>
            </div>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">API key</label>
              <input
                className="input"
                type="password"
                placeholder="AIzaSy••••••"
                value={form.gemini_api_key}
                onChange={set('gemini_api_key')}
              />
              <p className="text-xs text-ink-3 mt-1">
                Get yours at{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                  aistudio.google.com
                </a>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Caption model</label>
                <input className="input" value={form.gemini_caption_model} onChange={set('gemini_caption_model')} />
              </div>
              <div>
                <label className="label">Image model</label>
                <input className="input" value={form.gemini_image_model} onChange={set('gemini_image_model')} />
              </div>
            </div>
          </div>
        </div>

        {/* Zernio */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span className="text-base">☁️</span>
              <span className="text-sm font-medium">Zernio (Instagram publishing)</span>
            </div>
            <div className="flex items-center gap-2">
              <TestIcon status={tests['zernio']} />
              <button
                onClick={() => testConnection('zernio', { apiKey: form.zernio_api_key, accountId: form.zernio_account_id })}
                className="btn btn-ghost text-xs py-1"
              >
                Test
              </button>
            </div>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">API key</label>
              <input
                className="input"
                type="password"
                placeholder="zernio_••••••"
                value={form.zernio_api_key}
                onChange={set('zernio_api_key')}
              />
            </div>
            <div>
              <label className="label">Account ID</label>
              <input
                className="input"
                placeholder="your_account_id"
                value={form.zernio_account_id}
                onChange={set('zernio_account_id')}
              />
            </div>
          </div>
        </div>

        {/* Brand Logo */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span className="text-base">🖼️</span>
              <span className="text-sm font-medium">Brand logo</span>
            </div>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">Logo URL (direct image link)</label>
              <input
                className="input"
                placeholder="https://example.com/logo.png"
                value={form.logo_url}
                onChange={set('logo_url')}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-3">
              <div className="flex-1 border-t border-border" />
              <span>or</span>
              <div className="flex-1 border-t border-border" />
            </div>
            <div>
              <label className="label">Google Drive file ID</label>
              <input
                className="input"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                value={form.logo_drive_file_id}
                onChange={set('logo_drive_file_id')}
              />
              <p className="text-xs text-ink-3 mt-1">
                Make the file publicly viewable in Drive, then paste the file ID from the share URL.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-border px-7 h-14 flex items-center">
          <span className="text-sm font-medium text-ink">Integrations</span>
        </div>
        <div className="p-7 flex items-center gap-2 text-sm text-ink-3">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  )
}