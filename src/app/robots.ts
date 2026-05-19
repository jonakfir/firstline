import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/dashboard/', '/login/', '/signup/'],
      },
    ],
    sitemap: 'https://firstline.io/sitemap.xml',
    host: 'https://firstline.io',
  };
}
