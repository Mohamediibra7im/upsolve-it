import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://upsolve-it.hnuicpc.tech';

  // Public routes that should be indexed
  const routes = [
    '',
    '/help',
    '/help/quick-start',
    '/help/faq',
    '/help/support',
    '/privacy',
    '/terms',
    '/community',
    '/report',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
