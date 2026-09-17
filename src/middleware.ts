import { defineMiddleware } from 'astro:middleware';
import { site } from './data/site';

const canonicalHost = new URL(site.url).hostname;

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;

  if (url.hostname === `www.${canonicalHost}`) {
    const target = new URL(url.pathname + url.search, `https://${canonicalHost}`);
    return context.redirect(target.toString(), 308);
  }

  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  return response;
});
