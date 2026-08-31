'use client';

import { useEffect } from 'react';
import { Serwist } from '@serwist/window';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

      serwist.addEventListener('installed', () => {
        console.log('Serwist installed');
      });

      serwist.addEventListener('activated', (event) => {
        console.log(`Service Worker active! (${event.isUpdate ? 'Update' : 'New'})`);
      });

      // When a new service worker is waiting, skip waiting and reload once it
      // takes control. This avoids requiring users to manually unregister the
      // old service worker in DevTools.
      serwist.addEventListener('waiting', () => {
        serwist.addEventListener('controlling', () => {
          window.location.reload();
        });
        serwist.messageSkipWaiting();
      });

      serwist.register().catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  return null;
}
