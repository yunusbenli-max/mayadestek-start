import { NextRequest, NextResponse } from 'next/server'

const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  process.env.GIT_COMMIT_SHA?.slice(0, 7) ||
  'local'

/**
 * Server-side proxy to MayaDestek backend.
 * This route also normalizes the client payload to match backend required fields.
 * IMPORTANT: We never expose the secret to the browser.
 */
export async function POST(request: NextRequest) {
  try {
    // Secret token/key (server-only)
    const apiKey = process.env.MAYADESTEK_API_KEY
    const apiBase =
      process.env.MAYADESTEK_API_BASE ||
      'https://mayadestek-api-355l5o2k7q7q-uc.a.run.app'

    if (!apiKey) {
      return NextResponse.json(
        {
          build: BUILD_ID,
          error:
            'MAYADESTEK_API_KEY is missing. Put your backend secret into .env.local (local) or Vercel Environment Variables (production), then restart the dev server.',
        },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        {
          build: BUILD_ID,
          error: 'Body is null (request.json failed)',
          hint: 'Check Content-Type and JSON payload',
        },
        { status: 400 }
      )
    }

    // Normalize payload coming from the landing page.
    // We accept multiple key styles to avoid production 400s.
    const student_name =
      body?.student_name || body?.studentName || body?.student || body?.name

    const parent_name =
      body?.parent_name || body?.parentName || body?.parent || 'Veli'

    const student_phone =
      body?.student_phone || body?.studentPhone || body?.phone || body?.mobile

    const parent_phone =
      body?.parent_phone || body?.parentPhone || body?.guardian_phone

    // Always provide MVP defaults expected by backend.
    const grade_code = body?.grade_code || body?.gradeCode || 'G8'
    const goal = body?.goal || 'LGS'

    // Optional: allow referral code passthrough
    const referral_code = body?.referral_code || body?.ref || body?.referral

    // Minimum required for onboarding.
    if (!student_name || !student_phone) {
      return NextResponse.json(
        {
          build: BUILD_ID,
          error: 'Missing required fields: student_name, student_phone',
          received: body,
          normalized: {
            parent_name,
            student_name,
            grade_code,
            student_phone,
            parent_phone,
            goal,
            referral_code,
          },
        },
        { status: 400 }
      )
    }

    const apiUrl = `${apiBase}/public/onboarding/start`

    // Header strategy:
    // - If the secret looks like an API key (long hex / no dots), send ONLY `x-api-key`.
    // - If it looks like a JWT (three dot-separated parts) or already starts with Bearer, send Authorization.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const trimmed = apiKey.trim()
    const looksLikeJwt = trimmed.split('.').length === 3
    const looksLikeBearer = trimmed.toLowerCase().startsWith('bearer ')

    if (looksLikeJwt || looksLikeBearer) {
      headers['Authorization'] = looksLikeBearer ? trimmed : `Bearer ${trimmed}`
    } else {
      headers['x-api-key'] = trimmed
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent_name,
        student_name,
        grade_code,
        student_phone,
        goal,
        // Keep parent_phone if provided by the UI (backend may use it for WhatsApp flows)
        ...(parent_phone ? { parent_phone } : {}),
        ...(referral_code ? { referral_code } : {}),
      }),
    })

    // If backend rejects, surface the exact backend response for debugging.
    if (!apiResponse.ok) {
      const contentType = apiResponse.headers.get('content-type') || ''
      const raw = await apiResponse.text()
      let details: any = raw

      if (contentType.includes('application/json')) {
        try {
          details = JSON.parse(raw)
        } catch {
          details = raw
        }
      }

      return NextResponse.json(
        {
          build: BUILD_ID,
          error: `Backend rejected request (${apiResponse.status})`,
          backend: {
            url: apiUrl,
            status: apiResponse.status,
            body: details,
          },
        },
        { status: apiResponse.status }
      )
    }

    const apiData = await apiResponse.json().catch(() => ({}))

    return NextResponse.json({
      build: BUILD_ID,
      ...apiData,
      base_url: apiBase,
    })
  } catch (error) {
    return NextResponse.json(
      { build: BUILD_ID, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
