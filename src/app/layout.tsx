import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'SparkPost — AI-powered Instagram automation',
description: 'Connect your Shopify store and SparkPost automatically generates and posts AI fashion ads to Instagram. Set it up once, post forever.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}