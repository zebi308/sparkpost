const stages = [
  { num: 1, label: 'Fetch & filter Shopify products', badge: 'Shopify', color: 'bg-green-50 text-green-700' },
  { num: 2, label: 'Select random product & image', badge: 'Auto', color: 'bg-surface-2 text-ink-3' },
  { num: 3, label: 'Generate caption via Gemini', badge: 'AI', color: 'bg-purple-50 text-purple-700' },
  { num: 4, label: 'Suggest scene & edit fashion ad', badge: 'AI', color: 'bg-purple-50 text-purple-700' },
  { num: 5, label: 'Upload to S3 via Zernio', badge: 'Storage', color: 'bg-blue-50 text-blue-700' },
  { num: 6, label: 'Publish to Instagram', badge: 'Zernio', color: 'bg-pink-50 text-pink-700' },
]

export default function PipelineCard() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="text-sm font-medium text-ink">Pipeline stages</span>
        <span className="badge-green"><span className="w-1.5 h-1.5 rounded-full bg-current" />All systems go</span>
      </div>
      <div className="card-body space-y-2">
        {stages.map((s) => (
          <div key={s.num} className="flex items-center gap-3 px-3 py-2 bg-surface-2 rounded-md">
            <div className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0">
              {s.num}
            </div>
            <span className="flex-1 text-xs text-ink-2">{s.label}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.color}`}>
              {s.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
