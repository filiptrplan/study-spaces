// Builds one continuous music bed: the tense underscore for the opening, crossfading into the upbeat loop at the title.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const tl = JSON.parse(readFileSync('src/timeline.json', 'utf8'));
const total = tl.scenes.reduce((n, s) => n + s.seconds, 0);
const titleAt = tl.scenes.slice(0, tl.scenes.findIndex((s) => s.id === 'title')).reduce((n, s) => n + s.seconds, 0);
const m = 'public/audio/music/';
const loops = 5;                       // upbeat is 30 s; chain with 1 s crossfades
const chain = Array.from({ length: loops }, (_, i) => `[${i + 1}:a]`).join('');
let g = '';
let prev = '[1:a]';
for (let i = 1; i < loops; i++) { g += `${prev}[${i + 1}:a]acrossfade=d=1:c1=tri:c2=tri[u${i}];`; prev = `[u${i}]`; }
g += `${prev}atrim=0:${total - titleAt + 1},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.5,afade=t=out:st=${total - titleAt - 3}:d=4,adelay=${Math.round((titleAt - 0.8) * 1000)}|${Math.round((titleAt - 0.8) * 1000)}[up];`;
g += `[0:a]atrim=0:${titleAt + 1.2},asetpts=PTS-STARTPTS,afade=t=out:st=${titleAt - 1.2}:d=2.4[mo];[mo][up]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-20:TP=-2[out]`;
const args = ['-loglevel', 'error', '-y', '-i', m + 'moody.mp3', ...Array.from({ length: loops }, () => ['-i', m + 'upbeat.mp3']).flat(), '-filter_complex', g, '-map', '[out]', '-t', String(total), '-b:a', '192k', 'public/audio/music-bed.mp3'];
execFileSync('ffmpeg', args);
console.log('music bed', total.toFixed(1) + 's, upbeat enters at', (titleAt - 0.8).toFixed(1) + 's');
