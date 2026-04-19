import { createAdminClient } from '@/lib/supabase/client'
import { fetchShopifyProducts, filterProducts, selectRandomProduct } from '@/lib/shopify/client'
import { generateCaption, suggestScene, generateFashionAd } from '@/lib/gemini/client'
import { uploadImageToZernio, publishToInstagram } from '@/lib/zernio/client'
import type { Brand, PipelineResult } from '@/types'

type LogFn = (level: 'info' | 'success' | 'error' | 'warn', stage: string, message: string, metadata?: Record<string, unknown>) => Promise<void>

export async function runPipeline(
  brand: Brand,
  triggeredBy: 'schedule' | 'manual' = 'schedule'
): Promise<PipelineResult> {
  const supabase = createAdminClient()

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      brand_id: brand.id,
      status: 'running',
      triggered_by: triggeredBy,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (postError || !post) {
    return { success: false, error: 'Failed to create post record' }
  }

  const postId = post.id

  const log: LogFn = async (level, stage, message, metadata) => {
    await supabase.from('run_logs').insert({
      post_id: postId,
      brand_id: brand.id,
      level,
      stage,
      message,
      metadata: metadata || null,
    })
    console.log(`[${brand.name}] [${stage}] ${message}`)
  }

  const fail = async (stage: string, message: string, error?: unknown) => {
    const errMsg = error instanceof Error ? error.message : String(error || message)
    await log('error', stage, errMsg)
    await supabase
      .from('posts')
      .update({ status: 'failed', error_message: errMsg, completed_at: new Date().toISOString() })
      .eq('id', postId)
    return { success: false, postId, error: errMsg }
  }

  try {
    // ── Stage 1: Validate credentials ────────────────────────────────────────
    if (!brand.shopify_store_domain || !brand.shopify_access_token) {
      return await fail('validation', 'Shopify credentials not configured')
    }
    if (!brand.gemini_api_key) {
      return await fail('validation', 'Gemini API key not configured')
    }
    if (!brand.zernio_api_key || !brand.zernio_account_id) {
      return await fail('validation', 'Zernio credentials not configured')
    }

    // ── Stage 2: Fetch Shopify products ──────────────────────────────────────
    await log('info', 'shopify', `Fetching products from ${brand.shopify_store_domain}...`)
    let products
    try {
      products = await fetchShopifyProducts(brand.shopify_store_domain, brand.shopify_access_token)
    } catch (e) {
      return await fail('shopify', 'Failed to fetch Shopify products', e)
    }
    await log('info', 'shopify', `Fetched ${products.length} products`)

    // ── Stage 3: Filter & select product ─────────────────────────────────────
    const filtered = filterProducts(products, brand.excluded_product_types)
    if (filtered.length === 0) {
      return await fail('filter', 'No valid products after filtering')
    }
    await log('info', 'filter', `${filtered.length} products after filtering. Selecting random...`)

    const { product, imageUrl, headline } = selectRandomProduct(filtered)
    const description = product.body_html?.replace(/<[^>]*>/g, '') || ''

    await supabase.from('posts').update({
      product_id: String(product.id),
      product_title: product.title,
      product_image_url: imageUrl,
      headline,
    }).eq('id', postId)

    await log('success', 'filter', `Selected: "${product.title}" — ${headline}`)

    // ── Stage 4: Generate caption ─────────────────────────────────────────────
    await log('info', 'caption', 'Generating Instagram caption with Gemini...')
    let caption = ''
    try {
      const captionModel = brand.gemini_caption_model || 'gemini-2.5-flash'
      caption = await generateCaption(
        brand.gemini_api_key,
        captionModel,
        product.title,
        description,
        brand.caption_prompt,
        brand.fixed_hashtags
      )
    } catch (e) {
      return await fail('caption', 'Caption generation failed', e)
    }
    await supabase.from('posts').update({ caption }).eq('id', postId)
    await log('success', 'caption', `Caption generated (${caption.length} chars)`)

    // ── Stage 5: Scene suggestion ─────────────────────────────────────────────
    await log('info', 'scene', 'Getting AI scene suggestion...')
    let scene = 'modern indoor studio with soft diffused lighting'
    try {
      const captionModel = brand.gemini_caption_model || 'gemini-2.5-flash'
      scene = await suggestScene(
        brand.gemini_api_key,
        captionModel,
        product.title,
      )
    } catch {
      // fallback scene already set above
    }
    await supabase.from('posts').update({ scene }).eq('id', postId)
    await log('success', 'scene', `Scene: "${scene}"`)

    // ── Stage 6: Generate AI fashion ad image ────────────────────────────────
    await log('info', 'image_gen', 'Generating AI fashion ad with Gemini...')
    let imageBuffer: Buffer
    try {
      const logoUrl = brand.logo_url ||
        (brand.logo_drive_file_id
          ? `https://drive.google.com/uc?export=download&id=${brand.logo_drive_file_id}`
          : null)

      // Use the correct image generation model
      // gemini-2.0-flash-exp-image-generation supports native image output
      const imageModel = brand.gemini_image_model || 'gemini-2.0-flash-exp-image-generation'

      imageBuffer = await generateFashionAd(
        brand.gemini_api_key,
        imageModel,
        imageUrl,
        logoUrl,
        headline,
        scene,
        brand.image_prompt
      )
    } catch (e) {
      return await fail('image_gen', 'AI image generation failed', e)
    }
    await log('success', 'image_gen', `Image generated (${Math.round(imageBuffer.length / 1024)}KB)`)

    // ── Stage 7: Upload image to Supabase Storage → get public URL ────────────
    await log('info', 'upload', 'Uploading image to storage...')
    let publicUrl: string
    try {
      const filename = `${brand.slug}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filename, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(uploadData.path)

      publicUrl = urlData.publicUrl
    } catch (e) {
      return await fail('upload', 'Image upload to storage failed', e)
    }

    // ── Stage 8: Publish to Instagram ─────────────────────────────────────────
    await log('info', 'publish', 'Publishing post to Instagram via Zernio...')
    let instagramPostId: string
    let permalink: string | undefined
    try {
      const result = await publishToInstagram(
        brand.zernio_api_key,
        brand.zernio_account_id,
        publicUrl,
        caption
      )
      instagramPostId = result.postId
      permalink = result.permalink
    } catch (e) {
      return await fail('publish', 'Instagram publish failed', e)
    }

    await supabase.from('posts').update({
      status: 'published',
      instagram_post_id: instagramPostId,
      instagram_permalink: permalink,
      completed_at: new Date().toISOString(),
    }).eq('id', postId)

    await log('success', 'done', `Post published! Instagram ID: ${instagramPostId}`)

    return { success: true, postId, instagramPostId }

  } catch (e) {
    return await fail('unknown', 'Unexpected pipeline error', e)
  }
}