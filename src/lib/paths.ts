/** getStaticPaths for the dynamic pages, shared by the Hindi (/) and English (/en/) route files. */
import { getArticles, getSeriesArticles, getSeriesList, slugOf } from './content';
import { ERAS } from './eras';
import type { Lang } from '../i18n';

export async function articlePaths(lang: Lang) {
  const articles = await getArticles(lang);
  return articles.map((article) => ({ params: { slug: slugOf(article) }, props: { article, articles } }));
}

export function eraPaths() {
  return ERAS.map((era) => ({ params: { era: era.id }, props: { era } }));
}

export async function seriesPaths(lang: Lang) {
  const list = await getSeriesList(lang);
  return Promise.all(
    list.map(async (series) => {
      const id = series.id.replace(/^[a-z]{2}\//, '');
      return { params: { id }, props: { series, id, items: await getSeriesArticles(id, lang) } };
    }),
  );
}
