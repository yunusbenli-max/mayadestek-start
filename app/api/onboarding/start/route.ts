import { NextRequest, NextResponse } from 'next/server'

interface OnboardingRequest {
  parent_name: string
  student_name: string
  grade_code: string
  goal?: string
}

const DEFAULT_API_BASE = 'https://mayadestek-api-355l5o2k7q-uc.a.run.app'

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json()

    if (!body?.parent_name || !body?.student_name || !body?.grade_code) {
      return NextResponse.json(
        { error: 'Missing required fields: parent_name, student_name, grade_code' },
        { status: 400 }
      )
    }

    const apiKey = process.env.MAYADESTEK_API_KEY
    const apiBase = (process.env.MAYADESTEK_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '')

    if (!apiKey) {
      // Intentionally do not leak any sensitive info beyond "missing env var name".
      return NextResponse.json(
        { error: 'Server is not configured (missing MAYADESTEK_API_KEY).' },
        { status: 500 }
      )
    }

    const backendUrl = `${apiBase}/public/onboarding/start`
    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      // never cache onboarding
      cache: 'no-store',
      body: JSON.stringify({
        parent_name: body.parent_name,
        student_name: body.student_name,
        grade_code: body.grade_code,
        goal: body.goal,
      }),
    })

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || `Backend error: HTTP ${resp.status}` },
        { status: resp.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Onboarding proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}


