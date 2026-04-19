import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.redirect(new URL('/login', req.url))

  const shop = req.nextUrl.searchParams.get('shop')
  const brandId = req.nextUrl.searchParams.get('brandId')

  if (!shop || !brandId) {
    return NextResponse.json({ error: 'Missing shop or brandId' }, { status: 400 })
  }

  const cleanShop = shop
    .replace(/https?:\/\//, '')
    .replace(/\/$/, '')
    .trim()

  const state = crypto.randomBytes(16).toString('hex')

  const response = NextResponse.redirect(
    `https://${cleanShop}/admin/oauth/authorize?` +
    new URLSearchParams({
      client_id: process.env.SHOPIFY_CLIENT_ID!,
      scope: 'read_products,read_product_listings',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`,
      state,
      'grant_options[]': 'per-user',
    }).toString()
  )

  response.cookies.set('shopify_oauth_state', state, {
    httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax',
  })
  response.cookies.set('shopify_oauth_brand_id', brandId, {
    httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax',
  })
  response.cookies.set('shopify_oauth_shop', cleanShop, {
    httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax',
  })

  return response
}