import { describe, expect, it } from 'vitest';
import { createProgress } from '../src/lib/progress';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial));
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

describe('createProgress', () => {
  it('never throws when storage access throws', () => {
    const p = createProgress(() => { throw new Error('blocked'); });
    expect(p.getRead()).toEqual([]);
    expect(() => p.markRead('x')).not.toThrow();
    expect(p.isRead('x')).toBe(false);
  });
  it('treats missing storage as empty', () => {
    expect(createProgress(() => null).isRead('x')).toBe(false);
  });
  it('records each slug once', () => {
    const s = memoryStorage();
    const p = createProgress(() => s);
    p.markRead('a'); p.markRead('a'); p.markRead('b');
    expect(p.getRead()).toEqual(['a', 'b']);
    expect(p.isRead('b')).toBe(true);
  });
  it('ignores corrupted values', () => {
    const p = createProgress(() => memoryStorage({ 'kaunkab:read': 'not json' }));
    expect(p.getRead()).toEqual([]);
    const q = createProgress(() => memoryStorage({ 'kaunkab:read': '{"a":1}' }));
    expect(q.getRead()).toEqual([]);
  });
  it('survives setItem throwing (quota)', () => {
    const s = memoryStorage();
    s.setItem = () => { throw new Error('quota'); };
    expect(() => createProgress(() => s).markRead('a')).not.toThrow();
  });
});
