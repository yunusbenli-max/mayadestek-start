'use client'

import { useState, FormEvent } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    student_name: '',
    parent_phone: '',
    student_phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Redirect to the onboarding URL from API response or construct it
      const redirectUrl = data.url || data.redirect_url || (data.sc ? `${data.base_url || 'https://mayadestek-api-355l5o2k7q-uc.a.run.app'}/start?sc=${data.sc}` : null)
      
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        throw new Error('No redirect URL or token received from API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
          MayaDestek Onboarding
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="student_name" style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Öğrenci Adı *
            </label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="parent_phone" style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Veli Telefonu *
            </label>
            <input
              type="tel"
              id="parent_phone"
              name="parent_phone"
              value={formData.parent_phone}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="student_phone" style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Öğrenci Telefonu *
            </label>
            <input
              type="tel"
              id="student_phone"
              name="student_phone"
              value={formData.student_phone}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Gönderiliyor...' : 'Başlat'}
          </button>
        </form>
      </div>
    </main>
  )
}

