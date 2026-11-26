import { t as hiT } from './hi';
import { t as enT } from './en';

export type Lang = 'hi' | 'en';
export const LANGS: Lang[] = ['hi', 'en'];
export const DEFAULT_LANG: Lang = 'hi';

/** Language of a page, from its path: everything under /en/ is English, the rest Hindi. */
export function langFromPath(pathname: string): Lang {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'hi';
}
export const langFromUrl = (url: URL): Lang => langFromPath(url.pathname);

/** UI dictionary for a language. */
export const ui = (lang: Lang) => (lang === 'en' ? enT : hiT);

/** Pick the Hindi or English variant of a one-off string. */
export const pick = (lang: Lang) => (hi: string, en: string) => (lang === 'en' ? en : hi);

/** Prefix a site path for a language: ("/timeline/", "en") -> "/en/timeline/". */
export function localize(path: string, lang: Lang): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const bare = p.replace(/^\/en(?=\/|$)/, '') || '/';
  return lang === 'en' ? (bare === '/' ? '/en/' : `/en${bare}`) : bare;
}

/** The same page in the other language. */
export const switchPath = (pathname: string, to: Lang): string => localize(pathname, to);

export const LANG_META: Record<Lang, { html: string; og: string; name: string; short: string }> = {
  hi: { html: 'hi', og: 'hi_IN', name: 'हिंदी', short: 'हिं' },
  en: { html: 'en', og: 'en_IN', name: 'English', short: 'EN' },
};
