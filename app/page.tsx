'use client'

export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>MayaDestek</h1>
      <p>7 Gün Ücretsiz Deneme</p>

      <a
        href="https://mayadestek-api-355l5o2k7q-uc.a.run.app/start"
        style={{
          display: 'inline-block',
          marginTop: 20,
          padding: '12px 20px',
          background: '#2563eb',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
        }}
      >
        Hemen Başla (Test)
      </a>
    </main>
  )
}