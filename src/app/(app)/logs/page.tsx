import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Topbar from '@/components/layout/Topbar'
import { formatDistanceToNow } from 'date-fns'

const LEVEL_STYLES: Record<string, string> = {
  success: 'bg-brand-green-light text-brand-green',
  error: 'bg-brand-red-light text-brand-red',
  warn: 'bg-gold-light text-gold',
  info: 'bg-blue-50 text-blue-700',
}

const LEVEL_ICON: Record<string, string> = {
  success: '✓', error: '✗', warn: '!', info: 'i',
}

export default async function LogsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: brands } = await supabase.from('brands').select('id').limit(1)
  const brandId = brands?.[0]?.id

  const { data: logs } = brandId
    ? await supabase
        .from('run_logs')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Run logs" />
      <div className="p-7">
        <div className="card">
          <div className="card-header">
            <span className="text-sm font-medium text-ink">{logs?.length || 0} log entries</span>
          </div>
          <div className="divide-y divide-border">
            {!logs?.length && (
              <div className="px-4 py-12 text-center text-sm text-ink-3">
                No logs yet. Run the pipeline to see activity.
              </div>
            )}
            {logs?.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${LEVEL_STYLES[log.level] || LEVEL_STYLES.info}`}>
                  {LEVEL_ICON[log.level] || 'i'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {log.stage && (
                      <span className="text-[10px] font-medium bg-surface-2 text-ink-3 px-2 py-0.5 rounded uppercase tracking-wide">
                        {log.stage}
                      </span>
                    )}
                    <span className="text-sm text-ink-2">{log.message}</span>
                  </div>
                  {log.metadata && (
                    <pre className="text-[11px] text-ink-3 mt-1 font-mono overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-[11px] text-ink-3 flex-shrink-0 tabular-nums">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
