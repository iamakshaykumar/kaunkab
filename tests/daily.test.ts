import { describe, expect, it } from 'vitest';
import { pickDaily } from '../src/lib/daily';

describe('pickDaily', () => {
  it('is deterministic for the same date', () => {
    const items = ['x', 'y', 'z', 'w', 'v'];
    expect(pickDaily(items, new Date(2026, 0, 1))).toBe(pickDaily(items, new Date(2026, 0, 1, 23, 59)));
  });
  it('varies across days', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const picks = new Set(Array.from({ length: 10 }, (_, d) => pickDaily(items, new Date(2026, 0, d + 1))));
    expect(picks.size).toBeGreaterThan(1);
  });
  it('returns undefined for an empty list', () => {
    expect(pickDaily([], new Date())).toBeUndefined();
  });
});
