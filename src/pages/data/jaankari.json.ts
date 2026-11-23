import type { APIRoute } from 'astro';
import { getArticles, slugOf } from '../../lib/content';

export interface Fact {
  text: string;
  slug: string;
  title: string;
}

export const GET: APIRoute = async () => {
  const facts: Fact[] = (await getArticles()).flatMap((a) =>
    (a.data.didYouKnow ?? []).map((text) => ({ text, slug: slugOf(a), title: a.data.title })),
  );
  return new Response(JSON.stringify(facts), { headers: { 'Content-Type': 'application/json' } });
};
