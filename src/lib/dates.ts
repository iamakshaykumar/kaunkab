export interface Kab {
  start: number;
  end?: number;
  month?: number;
  day?: number;
  circa?: boolean;
  label?: string;
}

export const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

export const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Lang = 'hi' | 'en';
const months = (lang: Lang) => (lang === 'en' ? ENGLISH_MONTHS : HINDI_MONTHS);

/** Negative years are BCE. */
export function formatYear(y: number, lang: Lang = 'hi'): string {
  if (lang === 'en') return y < 0 ? `${-y} BCE` : `${y} CE`;
  return y < 0 ? `${-y} ई.पू.` : `${y} ई.`;
}

export function formatDayMonth(month: number, day?: number, lang: Lang = 'hi'): string {
  const m = months(lang)[month - 1] ?? '';
  return day ? `${day} ${m}` : m;
}

export function formatKab(k: Kab, lang: Lang = 'hi'): string {
  if (k.label) return k.label;
  let s = formatYear(k.start, lang);
  if (k.month) s = `${formatDayMonth(k.month, k.day, lang)} ${s}`;
  if (k.end !== undefined && k.end !== k.start) s = `${s} – ${formatYear(k.end, lang)}`;
  return k.circa ? (lang === 'en' ? `c. ${s}` : `लगभग ${s}`) : s;
}

/** A calendar date (publish/update) as "25 नवंबर 2026". Uses UTC, since frontmatter dates are date-only. */
export function formatDate(d: Date, lang: Lang = 'hi'): string {
  return `${d.getUTCDate()} ${months(lang)[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
