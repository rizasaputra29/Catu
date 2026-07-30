import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { Providers } from './providers';
import { Toaster } from '../components/ui/toaster';
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
  title: 'CATU | Catatan Aplikasi Keuangan',
    description: 'Catat pemasukan, pengeluaran, dan arus kas untuk bisnis UMKM Anda dengan CATU',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'CATU',
  description: 'Catat pemasukan, pengeluaran, dan arus kas untuk bisnis UMKM Anda dengan CATU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
    <html lang="id" suppressHydrationWarning>
      <body className={`${onest.variable} font-sans antialiased`} suppressHydrationWarning>
        <ServiceWorkerRegister />
        <AuthProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}