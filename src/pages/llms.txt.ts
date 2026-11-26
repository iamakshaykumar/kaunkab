import type { APIContext } from 'astro';
import { articleUrl, getArticles, getSeriesArticles, getSeriesList } from '../lib/content';
import { ERAS, eraRangeLabel, eraTitle } from '../lib/eras';
import { t } from '../i18n/hi';

/** /llms.txt — a plain Markdown map of the site for AI agents (llmstxt.org format). */
export async function GET(context: APIContext) {
  const site = context.site!.href.replace(/\/$/, '');
  const articles = await getArticles();
  const series = await getSeriesList();
  const lines: string[] = [
    `# ${t.siteName} (Kaun Kab)`,
    '',
    `> ${t.tagline}। सिंधु घाटी से स्वतंत्रता तक भारतीय इतिहास के ${articles.length} लेख, सरल हिंदी में। हर लेख में स्रोत दिए गए हैं। सामग्री CC BY-SA 4.0 के तहत है।`,
    '',
    '## काल',
    '',
    ...ERAS.map((e) => `- [${eraTitle(e.id)}](${site}/kaal/${e.id}/): ${eraRangeLabel(e.id)}। ${e.blurb}`),
    '',
    '## शृंखलाएँ',
    '',
  ];
  for (const s of series) {
    const id = s.id.replace(/^hi\//, '');
    const n = (await getSeriesArticles(id)).length;
    lines.push(`- [${s.data.title}](${site}/series/${id}/): ${s.data.description} (${n} भाग)`);
  }
  lines.push(
    '',
    '## अन्य',
    '',
    `- [समयरेखा](${site}/timeline/): सभी लेख तारीख़ के क्रम में`,
    `- [परिचय और संपादकीय नीति](${site}/parichay/)`,
    `- [RSS फ़ीड](${site}/rss.xml)`,
    `- [English edition](${site}/en/): the same articles translated into English, under /en/ (e.g. ${site}/en/timeline/)`,
    `- [English RSS feed](${site}/en/rss.xml)`,
    '',
    '## Optional',
    '',
    ...articles.map((a) => `- [${a.data.title}](${site}${articleUrl(a)})`),
    '',
  );
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
