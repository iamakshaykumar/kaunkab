export type Era = 'prachin' | 'madhyakaal' | 'adhunik';

export interface EraInfo {
  id: Era;
  label: string;
  /** inclusive start year; null = open-ended */
  from: number | null;
  /** inclusive end year; null = open-ended */
  to: number | null;
  blurb: string;
}

export const ERAS: EraInfo[] = [
  {
    id: 'prachin',
    label: 'प्राचीन',
    from: null,
    to: 699,
    blurb: 'सिंधु घाटी से लेकर मौर्य, गुप्त और हर्ष तक — भारत की सबसे पुरानी कहानियाँ।',
  },
  {
    id: 'madhyakaal',
    label: 'मध्यकाल',
    from: 700,
    to: 1756,
    blurb: 'राजपूत, चोल, दिल्ली सल्तनत, विजयनगर, मुग़ल और मराठा — बदलते साम्राज्यों का दौर।',
  },
  {
    id: 'adhunik',
    label: 'आधुनिक',
    from: 1757,
    to: null,
    blurb: 'प्लासी से स्वतंत्रता तक — औपनिवेशिक शासन, संघर्ष और नए भारत का निर्माण।',
  },
];

export const ERA_IDS = ERAS.map((e) => e.id) as [Era, ...Era[]];

export function getEra(id: Era): EraInfo {
  const e = ERAS.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown era: ${id}`);
  return e;
}

export function isYearInEra(era: Era, year: number): boolean {
  const e = getEra(era);
  return (e.from === null || year >= e.from) && (e.to === null || year <= e.to);
}

export function eraForYear(year: number): Era {
  const e = ERAS.find((x) => isYearInEra(x.id, year));
  return e!.id;
}

function yearText(y: number): string {
  return y < 0 ? `${-y} ई.पू.` : `${y} ई.`;
}

export function eraRangeLabel(era: Era): string {
  const e = getEra(era);
  const from = e.from === null ? 'आरंभ' : yearText(e.from);
  const to = e.to === null ? 'आज' : yearText(e.to);
  return `${from} – ${to}`;
}

/** Display title: "प्राचीन काल", but "मध्यकाल" (label already ends with काल). */
export function eraTitle(era: Era): string {
  const label = getEra(era).label;
  return label.endsWith('काल') ? label : `${label} काल`;
}
