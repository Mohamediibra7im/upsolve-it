import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Upsolve.it - Training Tracker',
    short_name: 'Upsolve.it',
    description: 'Master Codeforces virtual contests and track your CP progress with elite diagnostics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0B',
    theme_color: '#007F5F',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://d3moma7wl9.ufs.sh/f/xRZhVxWEJbFMus29DenxT5WwkRzQNM4V8v2dhSnslabDi1c0',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
