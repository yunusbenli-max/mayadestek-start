import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MayaDestek - Start Your 7-Day Free Trial',
  description: 'Onboarding for MayaDestek learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

