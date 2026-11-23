import { eraRangeLabel, getEra, isYearInEra, type Era } from './eras';
import type { Kab } from './dates';

export interface Issue {
  path: (string | number)[];
  message: string;
}

interface ArticleLike {
  era: Era;
  kab: Kab;
  series?: { id: string };
}

/** Max days per month; February allows 29 (year is often BCE/approximate). */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Cross-field rules the plain schema cannot express. Empty array = valid. */
export function articleIssues(d: ArticleLike, seriesIds: string[]): Issue[] {
  const issues: Issue[] = [];
  if (!isYearInEra(d.era, d.kab.start)) {
    issues.push({
      path: ['era'],
      message: `kab.start (${d.kab.start}) '${getEra(d.era).label}' काल (${eraRangeLabel(d.era)}) में नहीं आता। सही era चुनें या तारीख़ जाँचें।`,
    });
  }
  if (d.kab.day && !d.kab.month) {
    issues.push({ path: ['kab', 'day'], message: 'kab.day के साथ kab.month भी ज़रूरी है' });
  }
  if (d.kab.day && d.kab.month && d.kab.day > DAYS_IN_MONTH[d.kab.month - 1]) {
    issues.push({
      path: ['kab', 'day'],
      message: `kab.day (${d.kab.day}) महीने ${d.kab.month} में संभव नहीं है`,
    });
  }
  if (d.kab.end !== undefined && d.kab.end < d.kab.start) {
    issues.push({ path: ['kab', 'end'], message: 'kab.end, kab.start से पहले का नहीं हो सकता' });
  }
  if (d.series && !seriesIds.includes(d.series.id)) {
    issues.push({
      path: ['series', 'id'],
      message: `series.id "${d.series.id}" नहीं मिली। उपलब्ध: ${seriesIds.join(', ') || '(कोई नहीं)'}`,
    });
  }
  return issues;
}
