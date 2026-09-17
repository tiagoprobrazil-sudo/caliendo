import type { APIRoute } from 'astro';
import { site } from '../data/site';

const routes = ['/', '/privacidade/'];

export const GET: APIRoute = () => {
  const urlEntries = routes
    .map(
      (route) => `  <url>\n    <loc>${site.url}${route}</loc>\n  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
