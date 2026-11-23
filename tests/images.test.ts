import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findImage } from '../src/lib/images';

describe('findImage', () => {
  const root = mkdtempSync(join(tmpdir(), 'kk-img-'));
  mkdirSync(join(root, 'images', 'lekh'), { recursive: true });
  writeFileSync(join(root, 'images', 'lekh', 'a.jpg'), '');
  writeFileSync(join(root, 'images', 'lekh', 'b.webp'), '');
  writeFileSync(join(root, 'images', 'lekh', 'b.png'), '');

  it('finds an image with any supported extension', () => {
    expect(findImage('lekh/a', root)).toBe('/images/lekh/a.jpg');
  });
  it('prefers webp when several exist', () => {
    expect(findImage('lekh/b', root)).toBe('/images/lekh/b.webp');
  });
  it('returns undefined when missing', () => {
    expect(findImage('lekh/none', root)).toBeUndefined();
  });
});
