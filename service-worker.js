// constants
const CACHE_NAME = 'sb-cache-v1.3'
const FILES_TO_CACHE = [
  '/index.html',
  '/icons/launcher-icon-48.png',
  '/icons/launcher-icon-96.png',
  '/icons/launcher-icon-144.png',
  '/icons/launcher-icon-192.png',
  '/icons/launcher-icon-256.png',
  '/libs/face-api.min.js',
  '/libs/faceDetectionControls.js',
  '/face_expression_model-shard1',
  '/tiny_face_detector_model-shard1',
  '/face_expression_model-weights_manifest.json',
  '/tiny_face_detector_model-weights_manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page')
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keyList => Promise.all(keyList.map((key) => {
      if (key !== CACHE_NAME) {
        console.log('[ServiceWorker] Removing old cache', key)
        return caches.delete(key)
      }
    })))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.open(CACHE_NAME)
          .then(cache => cache.match('index.html')))
    )
  }
})