interface Relatable {
  id: string;
  era: string;
  tags?: string[];
  series?: { id: string };
}

/** Score: +3 same series, +2 per shared tag, +1 same era. Zero-score items are dropped. */
export function relatedArticles<A extends Relatable>(current: A, all: A[], n = 3): A[] {
  const tags = new Set(current.tags ?? []);
  return all
    .filter((a) => a.id !== current.id)
    .map((a) => {
      let score = 0;
      if (current.series && a.series?.id === current.series.id) score += 3;
      score += 2 * (a.tags ?? []).filter((t) => tags.has(t)).length;
      if (a.era === current.era) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.id.localeCompare(y.a.id))
    .slice(0, n)
    .map((x) => x.a);
}
