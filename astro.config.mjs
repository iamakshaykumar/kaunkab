import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { remarkAutolink } from './src/lib/remark-autolink.mjs';

const SITE = 'https://kaunkab.com';

/** slug -> last-modified date (frontmatter `updated`, else `published`), for sitemap <lastmod>. */
const articleDates = (() => {
  const dir = './src/content/articles/hi';
  const map = new Map();
  try {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
      const fm = readFileSync(`${dir}/${f}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
      const pick = (k) => fm.match(new RegExp(`^${k}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];
      const date = pick('updated') ?? pick('published');
      if (date) map.set(f.slice(0, -3), date);
    }
  } catch {}
  return map;
})();

/** Utility pages that should not be indexed (also marked noindex in the page). */
const NOINDEX = ['/khoj/', '/404/'];

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'hi',
    locales: ['hi', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    remarkPlugins: [remarkAutolink],
  },
  integrations: [
    sitemap({
      // hreflang pairs in the sitemap: /x/ (Hindi) <-> /en/x/ (English)
      i18n: { defaultLocale: 'hi', locales: { hi: 'hi-IN', en: 'en-IN' } },
      filter: (page) => !NOINDEX.some((p) => new URL(page).pathname === p),
      serialize(item) {
        const m = new URL(item.url).pathname.match(/^(?:\/en)?\/lekh\/([^/]+)\/$/);
        const date = m && articleDates.get(m[1]);
        if (date) item.lastmod = new Date(`${date}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
});
