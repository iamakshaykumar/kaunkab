import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Series = CollectionEntry<'series'>;

const LANG = 'hi';

export const slugOf = (entry: { id: string }): string => entry.id.replace(/^[a-z]{2}\//, '');

export const articleUrl = (entry: { id: string }): string => `/lekh/${slugOf(entry)}`;

export const editUrl = (entry: { id: string }): string =>
  `https://github.com/iamakshaykumar/kaunkab/edit/main/src/content/articles/${entry.id}.md`;

/** All Hindi articles, chronological by kab.start. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('articles', (e) => e.id.startsWith(`${LANG}/`));
  return all.sort((a, b) => a.data.kab.start - b.data.kab.start || a.id.localeCompare(b.id));
}

export async function getSeriesList(): Promise<Series[]> {
  const all = await getCollection('series', (e) => e.id.startsWith(`${LANG}/`));
  return all.sort((a, b) => a.data.title.localeCompare(b.data.title, 'hi'));
}

export async function getSeriesArticles(id: string): Promise<Article[]> {
  return (await getArticles())
    .filter((a) => a.data.series?.id === id)
    .sort((a, b) => a.data.series!.order - b.data.series!.order);
}

export const byPublishedDesc = (a: Article, b: Article) =>
  b.data.published.getTime() - a.data.published.getTime() || a.id.localeCompare(b.id);
