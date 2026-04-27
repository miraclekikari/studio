import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'LibreShare - Social Library',
  description: 'Partagez, découvrez et discutez de documents dans un espace social sécurisé.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LibreShare',
  },
  applicationName: 'LibreShare',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: 'https://picsum.photos/seed/libreshare192/192/192', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#63A5DE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen pb-20 md:pb-0">
        {children}
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
