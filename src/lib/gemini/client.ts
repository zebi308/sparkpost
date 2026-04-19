import axios from 'axios'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

function geminiHeaders(apiKey: string) {
  return {
    'x-goog-api-key': apiKey,
    'Content-Type': 'application/json',
  }
}

export async function generateCaption(
  apiKey: string,
  model: string,
  productTitle: string,
  productDescription: string,
  captionPrompt: string,
  fixedHashtags: string[]
): Promise<string> {
  const prompt = `${captionPrompt}

Product: ${productTitle}
Description: ${productDescription.slice(0, 300)}
Fixed hashtags to always include at the end: ${fixedHashtags.join(' ')}
Also add 4-5 dynamic relevant hashtags.

Return ONLY the caption text, no explanations.`

  const response = await axios.post(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.9 },
    },
    { headers: geminiHeaders(apiKey), timeout: 20000 }
  )

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return text.trim()
}

export async function suggestScene(
  apiKey: string,
  model: string,
  productTitle: string,
): Promise<string> {
  const title = productTitle.toLowerCase()

  const defaultScenes: Record<string, string> = {
    jacket: 'urban street setting with golden hour light',
    tee: 'minimal concrete wall with soft studio lighting',
    dress: 'rooftop terrace during sunset',
    denim: 'city sidewalk with motion blur',
    shorts: 'beach with bright natural light',
    default: 'modern indoor studio with soft diffused lighting',
  }

  const key = Object.keys(defaultScenes).find(k => title.includes(k)) || 'default'
  const fallback = defaultScenes[key]

  try {
    const prompt = `Suggest a realistic photoshoot scene for this fashion product.
Product: ${productTitle}
Respond with ONLY a scene description, maximum 8 words, no punctuation.`

    const response = await axios.post(
      `${GEMINI_BASE}/models/${model}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 30, temperature: 0.7 },
      },
      { headers: geminiHeaders(apiKey), timeout: 15000 }
    )

    const scene = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return scene || fallback
  } catch {
    return fallback
  }
}

export async function generateFashionAd(
  apiKey: string,
  model: string,
  productImageUrl: string,
  logoUrl: string | null,
  headline: string,
  scene: string,
  imagePrompt: string
): Promise<Buffer> {
  // Download product image
  const productImgResponse = await axios.get(productImageUrl, {
    responseType: 'arraybuffer',
    timeout: 20000,
  })
  const productImgBase64 = Buffer.from(productImgResponse.data).toString('base64')
  const productMimeType =
    (productImgResponse.headers['content-type'] as string) || 'image/jpeg'

  const parts: object[] = [
    {
      inline_data: {
        mime_type: productMimeType,
        data: productImgBase64,
      },
    },
  ]

  // Add logo if available
  if (logoUrl) {
    try {
      const logoResponse = await axios.get(logoUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      })
      const logoBase64 = Buffer.from(logoResponse.data).toString('base64')
      const logoMimeType =
        (logoResponse.headers['content-type'] as string) || 'image/png'
      parts.push({
        inline_data: { mime_type: logoMimeType, data: logoBase64 },
      })
    } catch {
      // Logo download failed, continue without it
    }
  }

  const fullPrompt = `${imagePrompt}

SCENE: ${scene}
HEADLINE TEXT: Add "${headline}" as overlay text on the image.
OUTPUT: One square 1:1 Instagram-ready fashion advertisement image. No collage, no duplication.`

  parts.push({ text: fullPrompt })

  const response = await axios.post(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    },
    { headers: geminiHeaders(apiKey), timeout: 120000 }
  )

  // Extract image from response
  const candidates = response.data?.candidates || []
  for (const candidate of candidates) {
    for (const part of candidate?.content?.parts || []) {
      if (part?.inline_data?.data) {
        return Buffer.from(part.inline_data.data, 'base64')
      }
      // Also handle inlineData (camelCase variant)
      if (part?.inlineData?.data) {
        return Buffer.from(part.inlineData.data, 'base64')
      }
    }
  }

  throw new Error('Gemini did not return an image — check model supports image output')
}

export async function testGeminiConnection(
  apiKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await axios.post(
      `${GEMINI_BASE}/models/gemini-2.5-flash:generateContent`,
      {
        contents: [{ parts: [{ text: 'Say OK' }] }],
        generationConfig: { maxOutputTokens: 5 },
      },
      { headers: geminiHeaders(apiKey), timeout: 10000 }
    )
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (text) return { ok: true }
    return { ok: false, error: 'No response from Gemini' }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status
      const msg = e.response?.data?.error?.message || e.message
      if (status === 400) return { ok: false, error: `Bad request: ${msg}` }
      if (status === 401 || status === 403) return { ok: false, error: 'Invalid API key' }
      if (status === 404) return { ok: false, error: 'Model not found' }
      return { ok: false, error: msg }
    }
    return { ok: false, error: 'Connection failed' }
  }
}