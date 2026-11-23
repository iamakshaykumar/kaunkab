import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { articleUrl, byPublishedDesc, getArticles } from '../lib/content';
import { t } from '../i18n/hi';

export async function GET(context: APIContext) {
  const articles = (await getArticles()).sort(byPublishedDesc);
  return rss({
    title: t.siteName,
    description: t.tagline,
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.saar,
      pubDate: a.data.published,
      link: articleUrl(a),
    })),
    customData: '<language>hi</language>',
  });
}
