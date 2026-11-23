import { describe, expect, it } from 'vitest';
import { articleIssues } from '../src/lib/validate';

const ok = { era: 'adhunik' as const, kab: { start: 1947, month: 8, day: 15 } };

describe('articleIssues', () => {
  it('accepts a valid article', () => {
    expect(articleIssues(ok, ['azadi-ki-raah'])).toEqual([]);
  });
  it('rejects a day that does not exist in the month', () => {
    const r = articleIssues({ ...ok, kab: { start: 1947, month: 2, day: 31 } }, []);
    expect(r.map((i) => i.path.join('.'))).toContain('kab.day');
  });
  it('allows 29 February', () => {
    expect(articleIssues({ ...ok, kab: { start: 1948, month: 2, day: 29 } }, [])).toEqual([]);
  });
  it('rejects end before start', () => {
    const r = articleIssues({ ...ok, kab: { start: 1950, end: 1900 } }, []);
    expect(r.map((i) => i.path.join('.'))).toContain('kab.end');
  });
  it('rejects an unknown series id', () => {
    const r = articleIssues({ ...ok, series: { id: 'nahi-hai' } }, ['azadi-ki-raah']);
    expect(r.map((i) => i.path.join('.'))).toContain('series.id');
  });
  it('still rejects a year outside the era', () => {
    const r = articleIssues({ era: 'adhunik', kab: { start: 1526 } }, []);
    expect(r.map((i) => i.path.join('.'))).toContain('era');
  });
});
