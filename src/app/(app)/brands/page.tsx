'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface Brand { id: string; name: string; slug: string; status: string; created_at: string }

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => fetch('/api/brands').then(r => r.json()).then(setBrands)
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), status: 'draft' }),
    })
    if (res.ok) {
      toast.success('Brand created')
      setNewName('')
      setShowNew(false)
      load()
    } else toast.error('Failed to create brand')
    setCreating(false)
  }

  const deleteBrand = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all posts and logs.`)) return
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    toast.success('Brand deleted')
    load()
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/brands/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Brands" actions={
        <button onClick={() => setShowNew(true)} className="btn btn-primary gap-1.5">
          <Plus size={14} /> Add brand
        </button>
      } />
      <div className="p-7 space-y-3 max-w-2xl">
        {showNew && (
          <div className="card card-body flex items-center gap-3">
            <input
              className="input flex-1"
              placeholder="Brand name (e.g. Nova Collective)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              autoFocus
            />
            <button onClick={create} disabled={creating} className="btn btn-primary flex-shrink-0">
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShowNew(false)} className="btn btn-ghost flex-shrink-0">Cancel</button>
          </div>
        )}

        {brands.map(b => (
          <div key={b.id} className={`card ${b.status === 'active' ? 'border-l-2 border-l-brand-green' : ''}`}>
            <div className="card-body flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-medium text-ink flex-shrink-0">
                {initials(b.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">{b.name}</div>
                <div className="text-xs text-ink-3 mt-0.5">/{b.slug}</div>
              </div>
              <select
                value={b.status}
                onChange={e => updateStatus(b.id, e.target.value)}
                className="text-xs border border-border rounded-md px-2 py-1.5 bg-surface-2 text-ink cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
              <button onClick={() => deleteBrand(b.id, b.name)} className="btn btn-ghost text-ink-3 hover:text-brand-red p-2">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {!brands.length && !showNew && (
          <div className="card card-body text-center py-12 text-sm text-ink-3">
            No brands yet. <button onClick={() => setShowNew(true)} className="underline">Add your first brand</button>
          </div>
        )}
      </div>
    </div>
  )
}
