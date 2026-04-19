import Link from 'next/link'
import { Brand } from '@/types'

interface Props { brand: Brand }

export default function IntegrationStatusCard({ brand }: Props) {
  const integrations = [
    {
      name: 'Shopify',
      detail: brand.shopify_store_domain || 'Not configured',
      ok: !!(brand.shopify_store_domain && brand.shopify_access_token),
      emoji: '🛍️',
    },
    {
      name: 'Gemini AI',
      detail: brand.gemini_caption_model,
      ok: !!brand.gemini_api_key,
      emoji: '✦',
    },
    {
      name: 'Zernio',
      detail: brand.zernio_account_id ? `ID: ${brand.zernio_account_id.slice(0, 12)}…` : 'Not configured',
      ok: !!(brand.zernio_api_key && brand.zernio_account_id),
      emoji: '☁️',
    },
    {
      name: 'Brand logo',
      detail: brand.logo_url ? 'URL set' : brand.logo_drive_file_id ? 'Drive set' : 'Not configured',
      ok: !!(brand.logo_url || brand.logo_drive_file_id),
      emoji: '🖼️',
    },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-sm font-medium text-ink">Integrations</span>
        <Link href="/integrations" className="btn btn-ghost text-xs py-1">Manage</Link>
      </div>
      <div className="card-body grid grid-cols-2 gap-2">
        {integrations.map((int) => (
          <div key={int.name} className="flex items-center gap-2.5 p-2.5 bg-surface-2 border border-border rounded-md">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-sm flex-shrink-0">
              {int.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-ink">{int.name}</div>
              <div className="text-[11px] text-ink-3 truncate">{int.detail}</div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${int.ok ? 'bg-brand-green' : 'bg-amber-400'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
