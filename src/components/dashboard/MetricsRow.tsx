import { Schedule } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getNextPostDay(schedule: Schedule | null): string {
  if (!schedule || !schedule.is_active) return 'Not scheduled'
  const today = new Date().getDay()
  const days = schedule.days_of_week.sort((a, b) => a - b)
  const next = days.find((d) => d > today) ?? days[0]
  const dayName = DAY_NAMES[next]
  return `${dayName} ${schedule.post_time}`
}

interface Props {
  postsThisMonth: number
  postsTotal: number
  schedule: Schedule | null
}

export default function MetricsRow({ postsThisMonth, postsTotal, schedule }: Props) {
  const nextPost = getNextPostDay(schedule)
  const postsPerWeek = schedule ? schedule.days_of_week.length : 0

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="metric-card">
        <div className="text-[11px] text-ink-3 tracking-wide mb-2">Posts this month</div>
        <div className="font-serif italic text-3xl text-ink font-light">{postsThisMonth}</div>
      </div>
      <div className="metric-card">
        <div className="text-[11px] text-ink-3 tracking-wide mb-2">Posts per week</div>
        <div className="font-serif italic text-3xl text-ink font-light">{postsPerWeek}×</div>
      </div>
      <div className="metric-card">
        <div className="text-[11px] text-ink-3 tracking-wide mb-2">Total published</div>
        <div className="font-serif italic text-3xl text-ink font-light">{postsTotal}</div>
      </div>
      <div className="metric-card">
        <div className="text-[11px] text-ink-3 tracking-wide mb-2">Next post</div>
        <div className="text-base font-medium text-ink mt-1">{nextPost}</div>
      </div>
    </div>
  )
}
