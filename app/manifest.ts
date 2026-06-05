import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Upsolve.it - Practice, Track and Dominate',
    short_name: 'Upsolve.it',
    description: 'The ultimate command center for competitive programmers. Master Codeforces with intelligent practice sessions, track your evolution, and dominate the competitive programming ladder.',
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
