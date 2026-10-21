// usage: node scripts/still.mjs <scene> <relative frame> [...]  -> out/stills/<scene>-<frame>.png and a contact sheet out/stills/<scene>-sheet.png
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [scene, ...offs] = process.argv.slice(2);
const tl = JSON.parse(readFileSync('src/timeline.json', 'utf8'));
let at = 0, from = 0, frames = 0;
for (const s of tl.scenes) { const n = Math.round(s.seconds * 30); if (s.id === scene) { from = at; frames = n; } at += n; }
const voice = JSON.parse(readFileSync(`src/voice/${scene}.json`, 'utf8'));
const LEAD = Math.round(tl.lead * 30);
const resolve = (o) => {
  const m = /^([A-Za-z']+)([+-]\d+)?$/.exec(o);
  if (!m || o === 'end') return o;
  const w = voice.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === m[1].toLowerCase());
  if (!w) throw new Error('no word ' + m[1]);
  return String(LEAD + Math.round(w.s * 30) + Number(m[2] ?? 0));
};
const files = [];
for (const o0 of offs) {
  const o = resolve(o0);
  const fr = o === 'end' ? frames - 2 : Math.min(frames - 1, Number(o));
  const out = `out/stills/${scene}-${o0}.png`;
  execFileSync('npx', ['remotion', 'still', 'src/index.ts', 'Promo', out, `--frame=${from + fr}`, '--browser-executable=/etc/profiles/per-user/filip/bin/chromium', '--log=error'], { stdio: 'ignore' });
  files.push(out);
}
const cols = Math.min(2, files.length), rows = Math.ceil(files.length / cols);
const inputs = files.flatMap((f) => ['-i', f]);
const scaled = files.map((_, i) => `[${i}]scale=960:540[s${i}]`).join(';');
const layout = files.map((_, i) => `${(i % cols) * 960}_${Math.floor(i / cols) * 540}`).join('|');
const filt = files.length === 1 ? scaled.replace('[s0]', '') : `${scaled};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}`;
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', filt, `out/stills/${scene}-sheet.png`]);
console.log(`out/stills/${scene}-sheet.png`, `(scene starts at frame ${from}, ${frames} frames)`);
