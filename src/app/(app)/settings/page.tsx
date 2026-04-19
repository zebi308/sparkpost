'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { toast } from 'sonner'

const DEFAULT_CAPTION = `Write a bold 3-sentence Instagram caption for a fashion product. Include emojis, a strong CTA, and close with the brand hashtags. Keep the tone confident and aspirational.`

const DEFAULT_IMAGE = `Edit this product image into a premium fashion advertisement.
STRICT RULES:
- Keep the original product unchanged without distortion
- Ensure no glitches, visual errors, or unnatural distortions
- Use the second input image as the brand logo, placed at top-right corner
- Logo should be small (6-8% of image width), professional, with 3-4% padding from edges
SCENE: Place the product in a natural setting matching its type.
STYLE: Cinematic lighting, realistic shadows, premium fashion-campaign look.
TEXT: Add the headline as overlay text using a clean sans-serif font.
OUTPUT: One realistic square 1:1 Instagram-ready image, no collage or duplication.`

export default function SettingsPage() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [captionPrompt, setCaptionPrompt] = useState(DEFAULT_CAPTION)
  const [imagePrompt, setImagePrompt] = useState(DEFAULT_IMAGE)
  const [fixedHashtags, setFixedHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(brands => {
      if (brands[0]) {
        setBrandId(brands[0].id)
        setCaptionPrompt(brands[0].caption_prompt || DEFAULT_CAPTION)
        setImagePrompt(brands[0].image_prompt || DEFAULT_IMAGE)
        setFixedHashtags(brands[0].fixed_hashtags || [])
      }
    })
  }, [])

  const save = async () => {
    if (!brandId) return
    setSaving(true)
    const res = await fetch(`/api/brands/${brandId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption_prompt: captionPrompt, image_prompt: imagePrompt, fixed_hashtags: fixedHashtags }),
    })
    if (res.ok) toast.success('Settings saved')
    else toast.error('Failed to save')
    setSaving(false)
  }

  const addHashtag = () => {
    let tag = newHashtag.trim()
    if (!tag) return
    if (!tag.startsWith('#')) tag = '#' + tag
    if (!fixedHashtags.includes(tag)) setFixedHashtags([...fixedHashtags, tag])
    setNewHashtag('')
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Settings" actions={
        <div className="flex gap-2">
          <button onClick={() => { setCaptionPrompt(DEFAULT_CAPTION); setImagePrompt(DEFAULT_IMAGE) }}
            className="btn btn-ghost">Reset to defaults</button>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      } />
      <div className="p-7 space-y-5 max-w-2xl">

        <div className="card">
          <div className="card-header"><span className="text-sm font-medium text-ink">Caption AI prompt</span></div>
          <div className="card-body">
            <p className="text-xs text-ink-3 mb-3">This prompt is sent to Gemini to generate Instagram captions. The product name, description and hashtags are appended automatically.</p>
            <textarea
              className="input min-h-[120px] resize-y"
              value={captionPrompt}
              onChange={e => setCaptionPrompt(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="text-sm font-medium text-ink">Image edit prompt</span></div>
          <div className="card-body">
            <p className="text-xs text-ink-3 mb-3">Sent to Gemini image model along with the product image and brand logo. The headline and scene are appended per-run.</p>
            <textarea
              className="input min-h-[200px] resize-y font-mono text-xs"
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="text-sm font-medium text-ink">Fixed hashtags</span></div>
          <div className="card-body">
            <p className="text-xs text-ink-3 mb-3">These hashtags are always appended to every caption. Gemini will add 4–5 additional dynamic ones per post.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {fixedHashtags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-surface-2 border border-border rounded-full px-3 py-1 text-xs">
                  {tag}
                  <button onClick={() => setFixedHashtags(fixedHashtags.filter(t => t !== tag))}
                    className="text-ink-3 hover:text-brand-red">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input" placeholder="#yourbrand" value={newHashtag}
                onChange={e => setNewHashtag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHashtag()} />
              <button onClick={addHashtag} className="btn btn-ghost flex-shrink-0">Add</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
