export type Era = 'prachin' | 'madhyakaal' | 'adhunik';

export interface EraInfo {
  id: Era;
  label: string;
  labelEn: string;
  /** inclusive start year; null = open-ended */
  from: number | null;
  /** inclusive end year; null = open-ended */
  to: number | null;
  blurb: string;
  blurbEn: string;
}

export const ERAS: EraInfo[] = [
  {
    id: 'prachin',
    label: 'प्राचीन',
    labelEn: 'Ancient',
    from: null,
    to: 699,
    blurb: 'सिंधु घाटी से लेकर मौर्य, गुप्त और हर्ष तक — भारत की सबसे पुरानी कहानियाँ।',
    blurbEn: 'From the Indus Valley to the Mauryas, the Guptas and Harsha — the oldest stories of India.',
  },
  {
    id: 'madhyakaal',
    label: 'मध्यकाल',
    labelEn: 'Medieval',
    from: 700,
    to: 1756,
    blurb: 'राजपूत, चोल, दिल्ली सल्तनत, विजयनगर, मुग़ल और मराठा — बदलते साम्राज्यों का दौर।',
    blurbEn: 'Rajputs, Cholas, the Delhi Sultanate, Vijayanagara, the Mughals and the Marathas — an age of changing empires.',
  },
  {
    id: 'adhunik',
    label: 'आधुनिक',
    labelEn: 'Modern',
    from: 1757,
    to: null,
    blurb: 'प्लासी से आज तक — औपनिवेशिक शासन, स्वतंत्रता संघर्ष और नए भारत का निर्माण।',
    blurbEn: 'From Plassey to the present — colonial rule, the freedom struggle and the making of a new India.',
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

export function eraRangeLabel(era: Era, lang: 'hi' | 'en' = 'hi'): string {
  const e = getEra(era);
  if (lang === 'en') {
    const y = (n: number) => (n < 0 ? `${-n} BCE` : `${n} CE`);
    return `${e.from === null ? 'Beginnings' : y(e.from)} – ${e.to === null ? 'today' : y(e.to)}`;
  }
  const from = e.from === null ? 'आरंभ' : yearText(e.from);
  const to = e.to === null ? 'आज' : yearText(e.to);
  return `${from} – ${to}`;
}

/** Display title: "प्राचीन काल", but "मध्यकाल" (label already ends with काल). English: "Ancient India". */
export function eraTitle(era: Era, lang: 'hi' | 'en' = 'hi'): string {
  if (lang === 'en') return `${getEra(era).labelEn} India`;
  const label = getEra(era).label;
  return label.endsWith('काल') ? label : `${label} काल`;
}

export const eraLabel = (era: Era, lang: 'hi' | 'en' = 'hi'): string => (lang === 'en' ? getEra(era).labelEn : getEra(era).label);
export const eraBlurb = (era: Era, lang: 'hi' | 'en' = 'hi'): string => (lang === 'en' ? getEra(era).blurbEn : getEra(era).blurb);
