import { describe, expect, it } from 'vitest';
import { formatYear, formatKab } from '../src/lib/dates';

describe('formatYear', () => {
  it('formats BCE and CE years', () => {
    expect(formatYear(-322)).toBe('322 ई.पू.');
    expect(formatYear(1857)).toBe('1857 ई.');
  });
});

describe('formatKab', () => {
  it('adds लगभग for circa dates', () => {
    expect(formatKab({ start: -322, circa: true })).toBe('लगभग 322 ई.पू.');
  });
  it('formats a full date with Hindi month', () => {
    expect(formatKab({ start: 1947, month: 8, day: 15 })).toBe('15 अगस्त 1947 ई.');
  });
  it('formats a range', () => {
    expect(formatKab({ start: 320, end: 550 })).toBe('320 ई. – 550 ई.');
  });
  it('uses label override', () => {
    expect(formatKab({ start: -600, label: 'छठी शताब्दी ई.पू.' })).toBe('छठी शताब्दी ई.पू.');
  });
  it('formats month without day', () => {
    expect(formatKab({ start: 1526, month: 4 })).toBe('अप्रैल 1526 ई.');
  });
});
