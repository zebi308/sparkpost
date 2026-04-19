import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const STATUS_EMOJI: Record<string, string> = {
  published: '✓', failed: '✗', running: '…', pending: '·',
}

interface Props { posts: Post[] }

export default function RecentPostsCard({ posts }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="text-sm font-medium text-ink">Recent posts</span>
      </div>
      <div className="divide-y divide-border">
        {posts.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-ink-3">No posts yet</div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-md bg-surface-2 border border-border flex-shrink-0 overflow-hidden">
              {post.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.product_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">👕</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink truncate">
                {post.product_title || 'Unknown product'}
              </div>
              <div className="text-xs text-ink-3 mt-0.5">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                {post.likes_count ? ` · ${post.likes_count} likes` : ''}
              </div>
            </div>
            <span
              className={
                post.status === 'published' ? 'badge-green' :
                post.status === 'failed' ? 'badge-red' :
                post.status === 'running' ? 'badge-amber' : 'badge-gray'
              }
            >
              {STATUS_EMOJI[post.status]} {post.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
