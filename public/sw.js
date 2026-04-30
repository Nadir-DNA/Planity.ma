/// <reference lib="webworker" />

const CACHE_NAME = "planity-v1";
const OFFLINE_URL = "/offline";

// Ressources à mettre en cache immédiatement
const PRECACHE_RESOURCES = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - pré-cache des ressources essentielles
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching resources");
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
  // Activer immédiatement
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate event - nettoyage des anciens caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prendre le contrôle immédiatement
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Fetch event - stratégie cache-first pour les assets, network-first pour l'API
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== "GET") {
    return;
  }

  // Ignorer les requêtes externes
  if (url.origin !== location.origin) {
    return;
  }

  // API: Network-first avec fallback offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Pages: Network-first avec fallback cache
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOfflinePage(request));
    return;
  }

  // Assets statiques: Cache-first
  event.respondWith(cacheFirst(request));
});

// Stratégie Cache-First
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Network request failed:", error);
    // Retourner une réponse d'erreur
    return new Response("Network error", { status: 408 });
  }
}

// Stratégie Network-First pour l'API
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(
      JSON.stringify({ error: "Offline", message: "Vous êtes hors ligne" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Stratégie Network-First avec page offline pour la navigation
async function networkFirstWithOfflinePage(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Page offline
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    return new Response("Offline", { status: 503 });
  }
}

// Types pour TypeScript
declare const self: ServiceWorkerGlobalScope;

interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<unknown>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface ServiceWorkerGlobalScope {
  skipWaiting(): Promise<void>;
  clients: {
    claim(): Promise<void>;
  };
}

declare const location: Location;