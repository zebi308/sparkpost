'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { toast } from 'sonner'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_OPTIONS = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '15:00', '18:00', '20:00']

export default function SchedulePage() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 4])
  const [postTime, setPostTime] = useState('08:00')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [excludedTypes, setExcludedTypes] = useState<string[]>(['hoodie', 'sweatshirt'])
  const [newType, setNewType] = useState('')

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(brands => {
      if (brands[0]) {
        setBrandId(brands[0].id)
        setExcludedTypes(brands[0].excluded_product_types || [])
        fetch(`/api/brands/${brands[0].id}/schedule`).then(r => r.json()).then(s => {
          if (s && !s.error) {
            setScheduleId(s.id)
            setActiveDays(s.days_of_week || [0,1,2,4])
            setPostTime(s.post_time || '08:00')
            setIsActive(s.is_active ?? true)
          }
        })
      }
    })
  }, [])

  const toggleDay = (day: number) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a,b)=>a-b)
    )
  }

  const save = async () => {
    if (!brandId) return
    setSaving(true)
    try {
      await fetch(scheduleId ? `/api/brands/${brandId}/schedule` : `/api/brands/${brandId}/schedule`, {
        method: scheduleId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_of_week: activeDays, post_time: postTime, is_active: isActive }),
      })
      await fetch(`/api/brands/${brandId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excluded_product_types: excludedTypes }),
      })
      toast.success('Schedule saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const addType = () => {
    const t = newType.trim().toLowerCase()
    if (t && !excludedTypes.includes(t)) {
      setExcludedTypes([...excludedTypes, t])
      setNewType('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar
        title="Schedule"
        actions={
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />
      <div className="p-7 grid grid-cols-2 gap-5">
        {/* Posting days */}
        <div className="card">
          <div className="card-header"><span className="text-sm font-medium text-ink">Posting days</span></div>
          <div className="card-body space-y-2">
            {DAY_NAMES.map((name, i) => (
              <label key={i} className="flex items-center justify-between p-2.5 bg-surface-2 rounded-md cursor-pointer">
                <span className="text-sm text-ink-2">{name}</span>
                <input
                  type="checkbox"
                  checked={activeDays.includes(i)}
                  onChange={() => toggleDay(i)}
                  className="w-4 h-4 accent-ink cursor-pointer"
                />
              </label>
            ))}
            <div className="pt-2 border-t border-border">
              <label className="label">Post time (UTC)</label>
              <select
                value={postTime}
                onChange={e => setPostTime(e.target.value)}
                className="input"
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-ink"
              />
              <span className="text-sm text-ink-2">Schedule active</span>
            </label>
          </div>
        </div>

        {/* Product filters */}
        <div className="card">
          <div className="card-header"><span className="text-sm font-medium text-ink">Product filters</span></div>
          <div className="card-body">
            <label className="label">Excluded product types</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {excludedTypes.map(t => (
                <span key={t} className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-full px-3 py-1 text-xs">
                  {t}
                  <button onClick={() => setExcludedTypes(excludedTypes.filter(x => x !== t))}
                    className="text-ink-3 hover:text-brand-red leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="e.g. hoodie"
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addType()}
              />
              <button onClick={addType} className="btn btn-ghost flex-shrink-0">Add</button>
            </div>
            <p className="text-xs text-ink-3 mt-3">
              Products whose title contains any of these words will be skipped during pipeline execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
