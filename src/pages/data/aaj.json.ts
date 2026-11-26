import type { APIRoute } from 'astro';
import { getArticles, slugOf } from '../../lib/content';
import type { DayEvent } from '../../lib/onThisDay';
import { findImage } from '../../lib/images';
import { langFromUrl } from '../../i18n';

export const GET: APIRoute = async ({ url }) => {
  const events: DayEvent[] = (await getArticles(langFromUrl(url)))
    .filter((a) => a.data.kab.month && a.data.kab.day)
    .map((a) => ({
      slug: slugOf(a),
      title: a.data.title,
      year: a.data.kab.start,
      month: a.data.kab.month!,
      day: a.data.kab.day!,
      saar: a.data.saar,
      img: findImage(`lekh/${slugOf(a)}-sm`) ?? findImage(`lekh/${slugOf(a)}`),
    }));
  return new Response(JSON.stringify(events), { headers: { 'Content-Type': 'application/json' } });
};
