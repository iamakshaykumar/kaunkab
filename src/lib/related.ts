interface Relatable {
  id: string;
  era: string;
  tags?: string[];
  kaun?: string[];
  kahan?: string[];
  series?: { id: string };
}

/**
 * Related articles outside the current article's series (series siblings are
 * already linked by the series navigation, so repeating them adds nothing).
 * Score: +2 per shared tag, +2 per shared person (kaun), +1 per shared place
 * (kahan), +1 same era. Zero-score items are dropped.
 */
export function relatedArticles<A extends Relatable>(current: A, all: A[], n = 3): A[] {
  const tags = new Set(current.tags ?? []);
  const kaun = new Set(current.kaun ?? []);
  const kahan = new Set(current.kahan ?? []);
  return all
    .filter((a) => a.id !== current.id)
    .filter((a) => !current.series || a.series?.id !== current.series.id)
    .map((a) => {
      let score = 0;
      score += 2 * (a.tags ?? []).filter((t) => tags.has(t)).length;
      score += 2 * (a.kaun ?? []).filter((p) => kaun.has(p)).length;
      score += (a.kahan ?? []).filter((p) => kahan.has(p)).length;
      if (a.era === current.era) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.id.localeCompare(y.a.id))
    .slice(0, n)
    .map((x) => x.a);
}
