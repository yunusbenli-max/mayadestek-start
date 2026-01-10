import { NextRequest, NextResponse } from 'next/server'

const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  process.env.GIT_COMMIT_SHA?.slice(0, 7) ||
  process.env.VERCEL_GITHUB_COMMIT_SHA?.slice(0, 7) ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.VERCEL_DEPLOYMENT_ID?.slice(0, 7) ||
  process.env.VERCEL_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
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
      'https://mayadestek-api-89254173016.us-central1.run.app'

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

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const doFetch = async () =>
      fetch(apiUrl, {
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

    // Backend may return `schema_not_ready` briefly on cold start / migrations.
    // We'll retry a few times to avoid flaky 503s on Vercel.
    let apiResponse = await doFetch()

    for (let attempt = 1; attempt <= 6; attempt++) {
      if (apiResponse.ok) break

      if (apiResponse.status !== 503) break

      const ct = apiResponse.headers.get('content-type') || ''
      const raw = await apiResponse.text()
      let parsed: any = raw
      if (ct.includes('application/json')) {
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = raw
        }
      }

      // Only retry if backend explicitly says it's initializing.
      if (parsed?.error !== 'schema_not_ready') {
        // Re-create a response-like object by re-fetching once so later error handling has a body.
        apiResponse = await doFetch()
        break
      }

      // backoff: 500ms, 1000ms, 1500ms, 2000ms, 2500ms, 3000ms (caps total wait ~10.5s)
      await sleep(500 * attempt)
      apiResponse = await doFetch()
    }

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
          build_env: process.env.VERCEL_ENV || 'unknown',
          vercel_url:
            process.env.VERCEL_URL ||
            process.env.VERCEL_PROJECT_PRODUCTION_URL ||
            null,
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
      backend_url: apiUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { build: BUILD_ID, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
