/// <reference lib="webworker" />
/// <reference types="@serwist/next/typings" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching: [
    // Don't cache Next.js image optimization requests or RSC flight requests.
    // These are dynamic and can fail when intercepted by a generic cache strategy.
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/_next/image") || url.searchParams.has("_rsc"),
      handler: new NetworkOnly(),
    },
    // Keep API routes uncached.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Clean up caches left behind by the old next-pwa / Workbox service worker.
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !name.includes("serwist"))
          .map((name) => caches.delete(name))
      )
    )
  );
});

// Keep the legacy push/notification handlers from the old custom service worker.
self.addEventListener("push", (event: PushEvent) => {
  console.log("Push received", event);
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("Notification clicked", event);
});
