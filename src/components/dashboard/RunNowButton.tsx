'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Play, Loader2 } from 'lucide-react'

interface Props { brandId: string }

export default function RunNowButton({ brandId }: Props) {
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    if (running) return
    setRunning(true)
    toast.info('Pipeline started…', { description: 'Fetching products from Shopify' })

    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Post published!', {
          description: `Instagram post ID: ${data.instagramPostId || 'published'}`,
        })
      } else {
        toast.error('Pipeline failed', { description: data.error || 'Unknown error' })
      }
    } catch {
      toast.error('Request failed', { description: 'Could not reach the server' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <button
      onClick={handleRun}
      disabled={running}
      className="btn btn-primary gap-2 disabled:opacity-60"
    >
      {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
      {running ? 'Running…' : 'Run now'}
    </button>
  )
}
