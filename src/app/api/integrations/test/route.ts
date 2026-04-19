import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { testShopifyConnection } from '@/lib/shopify/client'
import { testGeminiConnection } from '@/lib/gemini/client'
import axios from 'axios'

async function testZernioConnection(
  apiKey: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Zernio uses GET on accounts endpoint
    const response = await axios.get(
      `https://api.zernio.com/v1/accounts`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )
    if (response.status === 200) return { ok: true }
    return { ok: false, error: `Unexpected status ${response.status}` }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status
      // 401 means key is wrong
      if (status === 401) return { ok: false, error: 'Invalid API key' }
      // 403 means key works but no permission
      if (status === 403) return { ok: false, error: 'API key has no permission' }
      // If we get any other response it means the server exists and key format is ok
      return { ok: false, error: e.response?.data?.message || e.message }
    }
    const msg = e instanceof Error ? e.message : 'Connection failed'
    return { ok: false, error: msg }
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type } = body

  let result: { ok: boolean; error?: string }

  switch (type) {
    case 'shopify':
      result = await testShopifyConnection(body.storeDomain, body.accessToken)
      break
    case 'gemini':
      result = await testGeminiConnection(body.apiKey)
      break
    case 'zernio':
      result = await testZernioConnection(body.apiKey, body.accountId)
      break
    default:
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  return NextResponse.json(result)
}