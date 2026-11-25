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

/** Negative years are BCE. */
export function formatYear(y: number): string {
  return y < 0 ? `${-y} ई.पू.` : `${y} ई.`;
}

export function formatDayMonth(month: number, day?: number): string {
  const m = HINDI_MONTHS[month - 1] ?? '';
  return day ? `${day} ${m}` : m;
}

export function formatKab(k: Kab): string {
  if (k.label) return k.label;
  let s = formatYear(k.start);
  if (k.month) s = `${formatDayMonth(k.month, k.day)} ${s}`;
  if (k.end !== undefined && k.end !== k.start) s = `${s} – ${formatYear(k.end)}`;
  return k.circa ? `लगभग ${s}` : s;
}

/** A calendar date (publish/update) as "25 नवंबर 2026". Uses UTC, since frontmatter dates are date-only. */
export function formatDate(d: Date): string {
  return `${d.getUTCDate()} ${HINDI_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
