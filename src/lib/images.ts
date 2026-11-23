import { existsSync } from 'node:fs';
import { join } from 'node:path';

const EXTS = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

/**
 * Build-time lookup of an optional image under public/images/.
 * `base` is a path without extension, e.g. "lekh/maurya-samrajya".
 * Returns the public URL ("/images/lekh/maurya-samrajya.webp") or undefined.
 */
export function findImage(base: string, root = join(process.cwd(), 'public')): string | undefined {
  for (const ext of EXTS) {
    const rel = `images/${base}${ext}`;
    if (existsSync(join(root, rel))) return `/${rel}`;
  }
  return undefined;
}
