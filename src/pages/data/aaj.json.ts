import type { APIRoute } from 'astro';
import { getArticles, slugOf } from '../../lib/content';
import type { DayEvent } from '../../lib/onThisDay';
import { findImage } from '../../lib/images';

export const GET: APIRoute = async () => {
  const events: DayEvent[] = (await getArticles())
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
