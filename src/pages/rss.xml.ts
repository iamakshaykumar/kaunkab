import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { articleUrl, byPublishedDesc, getArticles } from '../lib/content';
import { langFromUrl, ui } from '../i18n';

export async function GET(context: APIContext) {
  const lang = langFromUrl(context.url);
  const t = ui(lang);
  const articles = (await getArticles(lang)).sort(byPublishedDesc);
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
    customData: `<language>${lang}</language>`,
  });
}
