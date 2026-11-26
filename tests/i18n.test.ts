import { describe, expect, it } from 'vitest';
import { langFromPath, localize, switchPath } from '../src/i18n';
import { formatKab, formatYear } from '../src/lib/dates';
import { eraRangeLabel, eraTitle } from '../src/lib/eras';

describe('i18n paths', () => {
  it('detects the language from the path', () => {
    expect(langFromPath('/')).toBe('hi');
    expect(langFromPath('/lekh/x/')).toBe('hi');
    expect(langFromPath('/en/')).toBe('en');
    expect(langFromPath('/en/lekh/x/')).toBe('en');
    expect(langFromPath('/english/')).toBe('hi');
  });
  it('localizes and switches paths both ways', () => {
    expect(localize('/', 'en')).toBe('/en/');
    expect(localize('/timeline/', 'en')).toBe('/en/timeline/');
    expect(localize('/en/timeline/', 'hi')).toBe('/timeline/');
    expect(localize('/en/', 'hi')).toBe('/');
    expect(switchPath('/lekh/dilli-saltanat/', 'en')).toBe('/en/lekh/dilli-saltanat/');
    expect(switchPath('/en/lekh/dilli-saltanat/', 'hi')).toBe('/lekh/dilli-saltanat/');
    expect(switchPath('/en/timeline/', 'en')).toBe('/en/timeline/');
  });
});

describe('English dates and eras', () => {
  it('formats years and ranges in English', () => {
    expect(formatYear(-322, 'en')).toBe('322 BCE');
    expect(formatYear(1857, 'en')).toBe('1857 CE');
    expect(formatKab({ start: 1857, month: 5, day: 10 }, 'en')).toBe('10 May 1857 CE');
    expect(formatKab({ start: -2600, end: -1900, circa: true }, 'en')).toBe('c. 2600 BCE – 1900 BCE');
  });
  it('keeps Hindi as the default', () => {
    expect(formatYear(-322)).toBe('322 ई.पू.');
    expect(eraTitle('prachin')).toBe('प्राचीन काल');
  });
  it('labels eras in English', () => {
    expect(eraTitle('madhyakaal', 'en')).toBe('Medieval India');
    expect(eraRangeLabel('adhunik', 'en')).toBe('1757 CE – today');
  });
});
