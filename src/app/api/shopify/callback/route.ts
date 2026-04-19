import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import crypto from 'crypto'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const shop = searchParams.get('shop')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/integrations?shopify=denied`, req.url))
  }

  if (!code || !state || !shop) {
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=missing_params`, req.url))
  }

  const savedState = req.cookies.get('shopify_oauth_state')?.value
  const brandId = req.cookies.get('shopify_oauth_brand_id')?.value
  const savedShop = req.cookies.get('shopify_oauth_shop')?.value

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=invalid_state`, req.url))
  }

  if (!brandId) {
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=missing_brand`, req.url))
  }

  const cleanShop = shop.replace(/https?:\/\//, '').replace(/\/$/, '').trim()

  if (savedShop && savedShop !== cleanShop) {
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=shop_mismatch`, req.url))
  }

  // Verify HMAC
  const hmac = searchParams.get('hmac')
  if (hmac) {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'hmac') params[key] = value
    })
    const message = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
    const expectedHmac = crypto
      .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!)
      .update(message)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=invalid_hmac`, req.url))
    }
  }

  // Exchange code for access token
  let accessToken: string
  try {
    const tokenRes = await axios.post(
      `https://${cleanShop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }
    )
    accessToken = tokenRes.data.access_token
  } catch (e) {
    console.error('Token exchange failed:', e)
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=token_exchange_failed`, req.url))
  }

  // Save to database
  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('brands')
    .update({
      shopify_store_domain: cleanShop,
      shopify_access_token: accessToken,
    })
    .eq('id', brandId)

  if (dbError) {
    return NextResponse.redirect(new URL(`/integrations?shopify=error&msg=db_save_failed`, req.url))
  }

  const response = NextResponse.redirect(
    new URL(`/integrations?shopify=success&shop=${cleanShop}`, req.url)
  )
  response.cookies.delete('shopify_oauth_state')
  response.cookies.delete('shopify_oauth_brand_id')
  response.cookies.delete('shopify_oauth_shop')

  return response
}