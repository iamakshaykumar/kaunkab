import { describe, expect, it } from 'vitest';
import { ERAS, eraForYear, isYearInEra, eraRangeLabel } from '../src/lib/eras';

describe('eraForYear', () => {
  it('classifies BCE and boundary years', () => {
    expect(eraForYear(-2600)).toBe('prachin');
    expect(eraForYear(699)).toBe('prachin');
    expect(eraForYear(700)).toBe('madhyakaal');
    expect(eraForYear(1756)).toBe('madhyakaal');
    expect(eraForYear(1757)).toBe('adhunik');
    expect(eraForYear(2026)).toBe('adhunik');
  });
});

describe('isYearInEra', () => {
  it('rejects years outside the era', () => {
    expect(isYearInEra('adhunik', 1526)).toBe(false);
    expect(isYearInEra('madhyakaal', 1526)).toBe(true);
    expect(isYearInEra('prachin', 700)).toBe(false);
  });
});

describe('ERAS', () => {
  it('is in chronological order', () => {
    expect(ERAS.map((e) => e.id)).toEqual(['prachin', 'madhyakaal', 'adhunik']);
  });
  it('has Hindi range labels', () => {
    expect(eraRangeLabel('madhyakaal')).toBe('700 ई. – 1756 ई.');
    expect(eraRangeLabel('prachin')).toBe('आरंभ – 699 ई.');
    expect(eraRangeLabel('adhunik')).toBe('1757 ई. – आज');
  });
});

import { eraTitle } from '../src/lib/eras';
describe('eraTitle', () => {
  it('adds काल only when the label does not already end with it', () => {
    expect(eraTitle('prachin')).toBe('प्राचीन काल');
    expect(eraTitle('madhyakaal')).toBe('मध्यकाल');
    expect(eraTitle('adhunik')).toBe('आधुनिक काल');
  });
});
