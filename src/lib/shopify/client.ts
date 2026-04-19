import axios from 'axios'
import type { ShopifyProduct } from '@/types'

export async function fetchShopifyProducts(
  storeDomain: string,
  accessToken: string
): Promise<ShopifyProduct[]> {
  const baseUrl = storeDomain.includes('.')
    ? `https://${storeDomain}`
    : `https://${storeDomain}.myshopify.com`

  const response = await axios.get(
    `${baseUrl}/admin/api/2024-01/products.json`,
    {
      params: { status: 'active', limit: 100 },
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  )
  return response.data.products as ShopifyProduct[]
}

export function filterProducts(
  products: ShopifyProduct[],
  excludedTypes: string[]
): ShopifyProduct[] {
  const excluded = excludedTypes.map((t) => t.toLowerCase())
  return products.filter((p) => {
    if (!p.images || p.images.length === 0) return false
    const title = p.title.toLowerCase()
    const type = (p.product_type || '').toLowerCase()
    return !excluded.some((kw) => title.includes(kw) || type.includes(kw))
  })
}

export function selectRandomProduct(products: ShopifyProduct[]): {
  product: ShopifyProduct
  imageUrl: string
  headline: string
} {
  const product = products[Math.floor(Math.random() * products.length)]
  const images = product.images
  const imageUrl = images[Math.floor(Math.random() * images.length)].src

  const title = product.title.toLowerCase()
  let headline = 'OWN YOUR STYLE'
  if (title.includes('t-shirt') || title.includes('tee')) headline = 'EVERYDAY ESSENTIAL'
  else if (title.includes('jacket')) headline = 'LAYER UP'
  else if (title.includes('summer') || title.includes('shorts')) headline = 'SUMMER READY'
  else if (title.includes('hoodie') || title.includes('sweatshirt')) headline = 'STAY COZY'
  else if (title.includes('dress')) headline = 'DRESS THE PART'
  else if (title.includes('denim') || title.includes('jeans')) headline = 'DENIM DAYS'

  return { product, imageUrl, headline }
}

export async function testShopifyConnection(
  storeDomain: string,
  accessToken: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = storeDomain.includes('.')
      ? `https://${storeDomain}`
      : `https://${storeDomain}.myshopify.com`

    await axios.get(`${baseUrl}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken },
      timeout: 8000,
    })
    return { ok: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Connection failed'
    return { ok: false, error: msg }
  }
}
