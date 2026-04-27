
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LibreShare Studio',
    short_name: 'LibreShare',
    description: 'Partage social de documents et connaissances',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#63A5DE',
    icons: [
      {
        src: 'https://picsum.photos/seed/icon192/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/icon512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
