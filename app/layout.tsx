import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { Providers } from './providers';
import { Toaster } from '../components/ui/toaster';
import LenisProvider from '../components/LenisProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-onest',
});

// 2. Pisahkan konfigurasi Viewport (themeColor, width, scale, dll)
export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// 3. Konfigurasi Metadata (Judul, Deskripsi, Ikon, Manifest)
export const metadata: Metadata = {
  title: 'CATU | Catatan Keuangan',
  description: 'Track income, expenses, and cash flow for your UMKM business with CATU',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'CATU',
    description: 'Track income, expenses, and cash flow for your UMKM business with CATU',
    type: 'website',
    images: [
      { url: '/og-image.png', width: 1200, height: 438, alt: 'CATU' }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CATU'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${onest.variable} font-sans antialiased`} suppressHydrationWarning>
        <ServiceWorkerRegister />
        <LenisProvider>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}