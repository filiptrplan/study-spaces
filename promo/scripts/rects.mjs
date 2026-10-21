// usage: node scripts/rects.mjs <scene> <word[+n] | frame>  -> prints where the buttons are inside the phone (content space, 390 wide)
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [scene, o] = process.argv.slice(2);
const tl = JSON.parse(readFileSync('src/timeline.json', 'utf8'));
let at = 0, from = 0;
for (const s of tl.scenes) { if (s.id === scene) from = at; at += Math.round(s.seconds * 30); }
const voice = JSON.parse(readFileSync(`src/voice/${scene}.json`, 'utf8'));
const m = /^([A-Za-z']+)([+-]\d+)?$/.exec(o);
const fr = m ? (() => { const w = voice.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === m[1].toLowerCase()); return Math.round(tl.lead * 30) + Math.round(w.s * 30) + Number(m[2] ?? 0); })() : Number(o);
const out = execFileSync('npx', ['remotion', 'still', 'src/index.ts', 'Promo', 'out/stills/_r.png', `--frame=${from + fr}`, '--browser-executable=/etc/profiles/per-user/filip/bin/chromium', '--log=verbose', '--props={"voice":false}'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PROMO_RECTS: '1' } });
for (const l of out.split('\n')) if (l.includes('RECTS')) console.log(l.slice(l.indexOf('RECTS') + 6));
