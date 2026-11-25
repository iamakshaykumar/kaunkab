/** Helpers for meta descriptions and schema.org JSON-LD. */

export const ORG_NAME = 'कौन कब';
export const LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/';

const MAX = 160;

/**
 * A meta description of at most 160 characters: the text itself if it fits,
 * else as many whole sentences (ending in "।" or ".") as fit, else cut at a
 * word boundary with an ellipsis.
 */
export function metaDescription(text: string, max = MAX): string {
  const s = text.replace(/\s+/g, ' ').trim();
  if ([...s].length <= max) return s;
  const sentences = s.match(/[^।.!?]+[।.!?]+/g) ?? [];
  let out = '';
  for (const sentence of sentences) {
    const next = (out + sentence).trim();
    if ([...next].length > max) break;
    out = next;
  }
  if ([...out].length >= 70) return out;
  const cut = [...s].slice(0, max - 1).join('');
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]\s*$/, '')}…`;
}

/** YYYY-MM-DD, without timezone drift (dates are date-only in frontmatter). */
export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export const abs = (path: string, site: URL | string): string => new URL(path, site).href;

export function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export const orgRef = (site: string) => ({ '@id': `${site}/#organization` });
export const websiteRef = (site: string) => ({ '@id': `${site}/#website` });

/** Strip the trailing slash from Astro.site for building absolute URLs. */
export const siteBase = (site: URL | undefined): string => (site?.href ?? 'https://kaunkab.com/').replace(/\/$/, '');
