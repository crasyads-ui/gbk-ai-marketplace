import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GBK AI Marketplace',
  description: 'Discover local stores, services and digital offers with GBK AI.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
