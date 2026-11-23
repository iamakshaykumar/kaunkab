import { describe, expect, it } from 'vitest';
import { pickOnThisDay, type DayEvent } from '../src/lib/onThisDay';

const ev: DayEvent[] = [
  { slug: 'a', title: 'A', year: 1947, month: 8, day: 15, saar: '' },
  { slug: 'b', title: 'B', year: 1950, month: 1, day: 26, saar: '' },
  { slug: 'c', title: 'C', year: 1972, month: 8, day: 15, saar: '' },
];

describe('pickOnThisDay', () => {
  it('returns all exact matches for today', () => {
    const r = pickOnThisDay(ev, new Date(2026, 7, 15));
    expect(r).toMatchObject({ exact: true, month: 8, day: 15 });
    expect(r!.events.map((e) => e.slug)).toEqual(['a', 'c']);
  });
  it('wraps into the next year when nothing is left this year', () => {
    expect(pickOnThisDay(ev, new Date(2026, 7, 16))).toMatchObject({ exact: false, month: 1, day: 26 });
  });
  it('handles Feb 29 by finding the next dated event', () => {
    expect(pickOnThisDay(ev, new Date(2028, 1, 29))).toMatchObject({ exact: false, month: 8, day: 15 });
  });
  it('returns null for an empty list', () => {
    expect(pickOnThisDay([], new Date())).toBeNull();
  });
});
