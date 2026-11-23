import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8');

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
function token(block: string, name: string): string {
  const m = block.match(new RegExp(`--${name}:[ ]*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} missing`);
  return m[1];
}

const light = css.slice(css.indexOf(':root {'), css.indexOf('@media'));
const dark = css.slice(css.indexOf(':root[data-theme="dark"]'));

describe('text on accent/era backgrounds meets WCAG AA (4.5:1)', () => {
  for (const [mode, block] of [['light', light], ['dark', dark]] as const) {
    for (const bg of ['accent', 'prachin', 'madhyakaal', 'adhunik']) {
      it(`${mode}: --on-accent on --${bg}`, () => {
        expect(ratio(token(block, 'on-accent'), token(block, bg))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
