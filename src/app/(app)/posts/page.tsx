import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Topbar from '@/components/layout/Topbar'
import { formatDistanceToNow } from 'date-fns'

export default async function PostsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: brands } = await supabase.from('brands').select('id').limit(1)
  const brandId = brands?.[0]?.id

  const { data: posts } = brandId
    ? await supabase
        .from('posts')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Post history" />
      <div className="p-7">
        <div className="card">
          <div className="card-header">
            <span className="text-sm font-medium text-ink">{posts?.length || 0} posts</span>
          </div>
          <div className="divide-y divide-border">
            {!posts?.length && (
              <div className="px-4 py-12 text-center text-sm text-ink-3">No posts yet. Run the pipeline to get started.</div>
            )}
            {posts?.map((post) => (
              <div key={post.id} className="flex items-start gap-4 px-4 py-4">
                <div className="w-12 h-12 rounded-md bg-surface-2 border border-border flex-shrink-0 overflow-hidden">
                  {post.product_image_url
                    ? <img src={post.product_image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{post.product_title || '—'}</span>
                    {post.headline && (
                      <span className="text-[10px] bg-surface-2 text-ink-3 px-2 py-0.5 rounded">{post.headline}</span>
                    )}
                  </div>
                  {post.caption && (
                    <p className="text-xs text-ink-3 mt-1 line-clamp-2">{post.caption}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-3">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    {post.likes_count != null && <span>· {post.likes_count} likes</span>}
                    {post.triggered_by && <span>· via {post.triggered_by}</span>}
                    {post.instagram_permalink && (
                      <a href={post.instagram_permalink} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline">View on Instagram ↗</a>
                    )}
                  </div>
                  {post.error_message && (
                    <div className="mt-1 text-xs text-brand-red">{post.error_message}</div>
                  )}
                </div>
                <span className={
                  post.status === 'published' ? 'badge-green' :
                  post.status === 'failed' ? 'badge-red' :
                  post.status === 'running' ? 'badge-amber' : 'badge-gray'
                }>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
