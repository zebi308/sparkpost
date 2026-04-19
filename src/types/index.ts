export type BrandStatus = 'draft' | 'active' | 'paused'
export type PostStatus = 'pending' | 'running' | 'published' | 'failed'
export type LogLevel = 'info' | 'success' | 'error' | 'warn'

export interface Brand {
  id: string
  user_id: string
  name: string
  slug: string
  status: BrandStatus
  logo_url: string | null
  logo_drive_file_id: string | null
  shopify_store_domain: string | null
  shopify_access_token: string | null
  gemini_api_key: string | null
  gemini_caption_model: string
  gemini_image_model: string
  zernio_api_key: string | null
  zernio_account_id: string | null
  excluded_product_types: string[]
  fixed_hashtags: string[]
  caption_prompt: string
  image_prompt: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  brand_id: string
  days_of_week: number[]
  post_time: string
  timezone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  brand_id: string
  product_id: string | null
  product_title: string | null
  product_image_url: string | null
  headline: string | null
  scene: string | null
  caption: string | null
  generated_image_url: string | null
  instagram_post_id: string | null
  instagram_permalink: string | null
  likes_count: number | null
  status: PostStatus
  error_message: string | null
  triggered_by: string
  scheduled_for: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface RunLog {
  id: string
  post_id: string | null
  brand_id: string
  level: LogLevel
  stage: string | null
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ShopifyProduct {
  id: number
  title: string
  body_html: string
  product_type: string
  status: string
  images: Array<{ id: number; src: string; position: number }>
  variants: Array<{ id: number; title: string; price: string }>
}

export interface PipelineResult {
  success: boolean
  postId?: string
  instagramPostId?: string
  error?: string
}
