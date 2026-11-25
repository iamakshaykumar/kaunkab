import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface StoryAudio {
  src: string;
  seconds: number;
}

let cache: Record<string, { sec: number }> | undefined;
function manifest(root: string): Record<string, { sec: number }> {
  if (cache) return cache;
  const p = join(root, 'audio', 'manifest.json');
  cache = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  return cache!;
}

/** Build-time lookup of an article's narrated story (public/audio/<slug>.mp3), made by scripts/make-audio.py. */
export function findAudio(slug: string, root = join(process.cwd(), 'public')): StoryAudio | undefined {
  const m = manifest(root)[slug];
  if (!m || !existsSync(join(root, 'audio', `${slug}.mp3`))) return undefined;
  return { src: `/audio/${slug}.mp3`, seconds: m.sec };
}

export function formatDuration(sec: number): string {
  const m = Math.round(sec / 60);
  return `${Math.max(1, m)} मिनट`;
}

export const MUSIC_CREDIT = {
  text: 'पृष्ठभूमि संगीत: बाँसुरी — MayankSingh33, CC BY-SA 4.0',
  url: 'https://commons.wikimedia.org/wiki/File:Indian_Folk_Classical_Flute_Music_(1).wav',
};
