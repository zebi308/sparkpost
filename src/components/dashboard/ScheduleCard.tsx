import Link from 'next/link'
import { Schedule } from '@/types'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props { schedule: Schedule | null; brandId: string }

export default function ScheduleCard({ schedule, brandId }: Props) {
  const activeDays = schedule?.days_of_week || []

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-sm font-medium text-ink">Weekly schedule</span>
        <Link href="/schedule" className="btn btn-ghost text-xs py-1">Edit</Link>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-[10px] text-ink-3 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-[11px] font-medium ${
                activeDays.includes(i)
                  ? 'bg-ink text-white'
                  : 'bg-surface-2 text-ink-3'
              }`}
            >
              {activeDays.includes(i) ? '✓' : '—'}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-ink-3">
          <div>
            Post time:{' '}
            <strong className="text-ink">{schedule?.post_time || '—'}</strong>
            {' · '}
            <strong className="text-ink">{activeDays.length}×</strong> per week
          </div>
          <div>
            Active days:{' '}
            <strong className="text-ink">
              {activeDays.length ? activeDays.map((d) => DAY_NAMES[d]).join(', ') : 'None'}
            </strong>
          </div>
          {!schedule?.is_active && (
            <div className="text-amber-600 font-medium">Schedule paused</div>
          )}
        </div>
      </div>
    </div>
  )
}
