import axios from 'axios'

const ZERNIO_BASE = 'https://zernio.com/api/v1'

function zernioHeaders(apiKey: string) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

export async function publishToInstagram(
  apiKey: string,
  accountId: string,
  imageUrl: string,
  caption: string
): Promise<{ postId: string; permalink?: string }> {
  const response = await axios.post(
    `${ZERNIO_BASE}/posts`,
    {
      content: caption,
      mediaItems: [{ type: 'image', url: imageUrl }],
      platforms: [{ platform: 'instagram', accountId }],
      publishNow: true,
    },
    { headers: zernioHeaders(apiKey), timeout: 60000 }
  )

  const post = response.data?.post || response.data
  return {
    postId: post?._id || post?.id || 'published',
    permalink: post?.platforms?.[0]?.platformPostUrl,
  }
}

export async function testZernioConnection(
  apiKey: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await axios.get(
      `${ZERNIO_BASE}/profiles`,
      { headers: zernioHeaders(apiKey), timeout: 10000 }
    )
    if (response.status === 200) return { ok: true }
    return { ok: false, error: `Unexpected status ${response.status}` }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status
      const msg = e.response?.data?.message || e.response?.data?.error || e.message
      if (status === 401) return { ok: false, error: 'Invalid API key' }
      return { ok: false, error: msg }
    }
    return { ok: false, error: 'Connection failed' }
  }
}

export async function uploadImageToZernio(
  _apiKey: string,
  _imageBuffer: Buffer,
  _filename: string
): Promise<string> {
  throw new Error('Use Supabase storage instead — pass publicUrl directly to publishToInstagram')
}

export async function getPresignedUploadUrl(
  _apiKey: string, _accountId: string, _filename: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  throw new Error('Not used')
}

export async function uploadImageToS3(
  _presignedUrl: string, _imageBuffer: Buffer
): Promise<void> {
  throw new Error('Not used')
}