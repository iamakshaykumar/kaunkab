"""Build storytelling audio for articles from audio-scripts/hi/<slug>.txt.

Usage:
  python scripts/make-audio.py              # every new/changed script
  python scripts/make-audio.py slug1 slug2  # only these

Output: public/audio/<slug>.mp3 (mono, 32 kbps) + public/audio/manifest.json {slug: {sec, hash}}.
Script format: see audio-scripts/README.md.
"""
import asyncio, hashlib, json, os, subprocess, sys, time
import numpy as np
from scipy.io import wavfile
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, 'audio-scripts', 'hi')
OUT = os.path.join(ROOT, 'public', 'audio')
CACHE = os.path.join(ROOT, '.audio-cache')
MUSIC = os.path.join(ROOT, 'scripts', 'audio-assets', 'bansuri.mp3')
MANIFEST = os.path.join(OUT, 'manifest.json')
VOICE = 'hi-IN-MadhurNeural'
FAST, SLOW = '+6%', '-6%'
SR = 24000
VERSION = 'v1'  # bump to force a full rebuild after changing the mix

os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)


def parse(text):
    items = []
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            items.append(('gap', 1.2)); continue
        rate = FAST
        if line.startswith('>'):
            rate, line = SLOW, line[1:].strip()
        pieces = [p.strip() for p in line.split('...')]
        for j, p in enumerate(pieces):
            if p: items.append(('say', p, rate))
            if j < len(pieces) - 1: items.append(('gap', 0.55))
        items.append(('gap', 0.6 if rate == SLOW else 0.32))
    return items


async def synth(text, rate):
    h = hashlib.md5(f'{VOICE}|{rate}|{text}'.encode()).hexdigest()[:20]
    mp3, wav = os.path.join(CACHE, h + '.mp3'), os.path.join(CACHE, h + '.wav')
    if not os.path.exists(wav):
        for attempt in range(8):
            try:
                await edge_tts.Communicate(text, VOICE, rate=rate).save(mp3)
                if os.path.getsize(mp3) > 0: break
            except Exception as e:  # rate limits (429) and network hiccups
                if attempt == 7: raise
                wait = 20 * (attempt + 1)
                print(f'    retry in {wait}s ({type(e).__name__})', flush=True)
                await asyncio.sleep(wait)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), wav], check=True)
    x = wavfile.read(wav)[1].astype(np.float32) / 32768
    nz = np.where(np.abs(x) > 0.01)[0]  # trim engine silence; our gaps set the rhythm
    return x[max(0, nz[0] - 400): nz[-1] + 1200] if len(nz) else x


PARALLEL = 4  # concurrent TTS requests; lower it if the service keeps answering 429


async def build(slug, text):
    items = parse(text)
    sem = asyncio.Semaphore(PARALLEL)
    async def one(it):
        async with sem:
            return await synth(it[1], it[2])
    clips = await asyncio.gather(*(one(it) for it in items if it[0] == 'say'))
    clips = iter(clips)
    parts = [np.zeros(int(3.0 * SR), np.float32)]
    for it in items:
        parts.append(np.zeros(int(it[1] * SR), np.float32) if it[0] == 'gap' else next(clips))
    parts.append(np.zeros(int(5.0 * SR), np.float32))
    voice = np.concatenate(parts); dur = len(voice) / SR
    vw = os.path.join(CACHE, f'_voice_{slug}.wav')
    wavfile.write(vw, SR, (voice * 32767 * 0.95).astype(np.int16))
    final = os.path.join(OUT, f'{slug}.mp3'); tmp = final + '.part.mp3'
    flt = (f'[1:a]aloop=loop=-1:size=2e9,atrim=0:{dur:.2f},aresample={SR},pan=mono|c0=0.5*c0+0.5*c1,'
           'highpass=f=120,lowpass=f=6000,volume=0.4,'
           f'afade=t=in:d=1.5,afade=t=out:st={dur-4:.2f}:d=4[m];'
           '[0:a]asplit=2[v][sc];'
           '[m][sc]sidechaincompress=threshold=0.02:ratio=7:attack=60:release=700:makeup=1[md];'
           '[v][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vw, '-i', MUSIC, '-filter_complex', flt,
                    '-map', '[o]', '-ac', '1', '-ar', '22050', '-b:a', '32k', tmp], check=True)
    os.replace(tmp, final); os.remove(vw)
    return round(dur)


def main():
    manifest = json.load(open(MANIFEST, encoding='utf8')) if os.path.exists(MANIFEST) else {}
    wanted = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(SCRIPTS) if f.endswith('.txt'))
    todo = []
    for slug in wanted:
        text = open(os.path.join(SCRIPTS, slug + '.txt'), encoding='utf8').read()
        h = hashlib.md5(f'{VERSION}|{VOICE}|{text}'.encode()).hexdigest()[:12]
        if manifest.get(slug, {}).get('hash') != h or not os.path.exists(os.path.join(OUT, slug + '.mp3')):
            todo.append((slug, text, h))
    print(f'{len(todo)} to build', flush=True)
    for i, (slug, text, h) in enumerate(todo, 1):
        t0 = time.time()
        sec = asyncio.run(build(slug, text))
        manifest[slug] = {'sec': sec, 'hash': h}
        json.dump(dict(sorted(manifest.items())), open(MANIFEST, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
        print(f'[{i}/{len(todo)}] {slug}  {sec // 60}:{sec % 60:02d}  ({time.time() - t0:.0f}s)', flush=True)


if __name__ == '__main__':
    main()
