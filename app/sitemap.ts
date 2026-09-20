import type { MetadataRoute } from 'next'

const categories = ['travel-tourism','food-restaurants','real-estate','local-services','shopping','learning','agriculture','shipping-logistics','bookings','ai-digital-services']

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://market.gbkai.com'
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: base + '/discover', changeFrequency: 'daily', priority: 0.9 },
    ...categories.map(slug => ({ url: base + '/discover/' + slug, changeFrequency: 'daily' as const, priority: 0.8 }))
  ]
}
