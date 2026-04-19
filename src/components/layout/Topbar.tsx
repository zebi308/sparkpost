interface TopbarProps {
  title: string
  statusLabel?: string
  statusType?: 'green' | 'amber' | 'red' | 'gray'
  actions?: React.ReactNode
}

export default function Topbar({ title, statusLabel, statusType = 'green', actions }: TopbarProps) {
  const statusClass = {
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    gray: 'badge-gray',
  }[statusType]

  return (
    <div className="bg-white border-b border-border px-7 h-14 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink">{title}</span>
        {statusLabel && (
          <span className={statusClass}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusLabel}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
