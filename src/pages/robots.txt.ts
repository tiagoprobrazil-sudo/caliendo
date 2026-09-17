import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = ({ url }) => {
  const isProduction = url.hostname === new URL(site.url).hostname;
  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
