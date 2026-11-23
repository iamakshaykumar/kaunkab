import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kaunkab.com',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
