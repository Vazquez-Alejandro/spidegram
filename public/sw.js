const CACHE = "spidegram-v1"

const STATIC_ASSETS = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  )
})

self.addEventListener("activate", () => {
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) return
  if (request.method !== "GET") return
  if (url.pathname.startsWith("/api/")) return

  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      return cached || fetched
    }),
  )
})

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "Spidegram" }

  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
