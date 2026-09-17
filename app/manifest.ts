import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GBK AI Marketplace',
    short_name: 'GBK Marketplace',
    description: 'Discover local stores, services and digital offers with GBK AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6faf8',
    theme_color: '#19745c',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
  }
}
