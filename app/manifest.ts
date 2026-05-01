import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Upsolve.it | CP Training Tracker',
    short_name: 'Upsolve.it',
    description: 'The ultimate command center for competitive programmers. Master Codeforces with precision and track your evolution.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#007F5F',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
