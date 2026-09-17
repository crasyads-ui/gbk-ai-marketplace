const CACHE = 'gbk-marketplace-v2'
const APP_SHELL = ['/']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const request = event.request
  const isNavigation = request.mode === 'navigate' || request.destination === 'document'

  if (isNavigation) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone()
          caches.open(CACHE).then(cache => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const copy = response.clone()
      caches.open(CACHE).then(cache => cache.put(request, copy))
      return response
    }).catch(() => caches.match('/')))
  )
})
