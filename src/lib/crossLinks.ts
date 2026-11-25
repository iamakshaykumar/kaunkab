/**
 * Hand-picked links between closely related articles that sit in different
 * series (so neither the series navigation nor the in-text auto-links connect
 * them). Each pair is linked both ways. Source: SEO audit, findings/cluster.md.
 */
const GROUPS: [string, string[]][] = [
  ['maharana-pratap', ['haldighati-ka-yuddh']],
  ['panipat-ki-pehli-ladai', ['panipat-ki-teesri-ladai']],
  ['tarain-ka-yuddh', ['dilli-saltanat', 'iltutmish']],
  ['buddh-aur-jain-dharm', ['mahabodhi-mandir', 'sanchi-stup', 'sarnath-singhshirsh', 'nalanda-mahavihar']],
  ['ashok-aur-kalinga-yuddh', ['sanchi-stup', 'sarnath-singhshirsh', 'bharhut-stup']],
  ['shivaji-ka-rajyabhishek', ['aurangzeb-ka-shasan', 'malik-ambar']],
  ['pratapgarh-ka-yuddh', ['aurangzeb-ka-shasan', 'malik-ambar']],
  ['hadap-niti', ['1857-ka-sangram', 'rani-lakshmibai']],
  ['sahayak-sandhi', ['1857-ka-sangram', 'rani-lakshmibai']],
  ['jallianwala-bagh', ['udham-singh']],
  ['simon-commission-wapas-jao', ['bhagat-singh-aur-kranti']],
  ['bharat-chhodo-aur-ina', ['rashbehari-bose', 'nausena-vidroh-1946']],
  ['ina-mukadma', ['rashbehari-bose', 'nausena-vidroh-1946']],
  ['tipu-sultan', ['anglo-maratha-yuddh', 'sahayak-sandhi']],
  ['hyder-ali', ['anglo-maratha-yuddh', 'sahayak-sandhi']],
  ['bang-bhang-aur-swadeshi', ['khudiram-bose', 'chittagong-shastragar-kand']],
  ['chola-samrajya', ['sangam-kaal', 'chera-vansh', 'pandya-vansh']],
  ['riyasaton-ka-ekikaran', ['bardoli-satyagraha']],
  ['mahad-satyagraha-ambedkar', ['poona-pact', 'samvidhan-nirman']],
  ['bhakti-andolan', ['guru-nanak-dev', 'sant-kabir']],
  ['colachal-ka-yuddh', ['vasco-da-gama-ka-aagman']],
];

const MAP = new Map<string, Set<string>>();
const link = (a: string, b: string) => {
  if (!MAP.has(a)) MAP.set(a, new Set());
  MAP.get(a)!.add(b);
};
for (const [from, tos] of GROUPS) for (const to of tos) { link(from, to); link(to, from); }

/** Slugs to show as "यह भी पढ़ें" for an article (both directions of every pair). */
export const crossLinksFor = (slug: string): string[] => [...(MAP.get(slug) ?? [])];

export const allCrossLinkSlugs = (): string[] => [...MAP.keys()];
