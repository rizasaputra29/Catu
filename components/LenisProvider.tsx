'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import { ReactNode, useEffect, useState } from 'react';

function LenisProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Opsi untuk Lenis, bisa disesuaikan
  const options = {
    lerp: 0.15, // Linear Interpolation (0.0 - 1.0)
    duration: 1.2,
    smoothTouch: false,
  };

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}

export default LenisProvider;
