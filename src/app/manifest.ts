import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LibreShare Studio',
    short_name: 'LibreShare',
    description: 'Une bibliothèque sociale propulsée par l\'IA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#63A5DE',
    icons: [
      {
        src: 'https://picsum.photos/seed/libreshare192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://picsum.photos/seed/libreshare512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}