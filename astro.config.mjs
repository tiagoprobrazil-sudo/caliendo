import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://caliendopsi.com.br',
  output: 'server',
  trailingSlash: 'always',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  compressHTML: true,
  build: { inlineStylesheets: 'never' },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
    },
  },
  devToolbar: { enabled: false },
});
