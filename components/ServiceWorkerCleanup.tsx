'use client';

import { useEffect } from 'react';

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // One-time cleanup: unregister any legacy service workers and clear
    // their caches so users migrate away from the old PWA setup.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      )
      .then(() => {
        if ('caches' in window) {
          return caches.keys().then((names) =>
            Promise.all(names.map((name) => caches.delete(name)))
          );
        }
      })
      .then(() => {
        console.log('Legacy service workers and caches cleaned up');
      })
      .catch((err) => {
        console.error('Service worker cleanup failed:', err);
      });
  }, []);

  return null;
}
