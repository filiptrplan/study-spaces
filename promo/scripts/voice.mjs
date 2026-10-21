// Narration: one ElevenLabs clip per scene, with word timings, then the timeline that sizes each scene to its clip.
// usage: node scripts/voice.mjs [sceneId ...]   (ELEVENLABS_API_KEY or /run/secrets/api_secrets)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { headers } from './eleven.mjs';

const script = JSON.parse(readFileSync('script.json', 'utf8'));
const want = process.argv.slice(2);
mkdirSync('public/vo', { recursive: true }); mkdirSync('src/voice', { recursive: true });
const LEAD = 0.45, TAIL = 0.75;               // seconds of room before and after the narration in a scene

/** Characters + per-character times -> words with start/end seconds. */
function words(text, al) {
  const out = []; let cur = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) out.push(cur); cur = null; return; }
    if (!cur) cur = { w: '', s: al.character_start_times_seconds[i] };
    cur.w += ch; cur.e = al.character_end_times_seconds[i];
  });
  if (cur) out.push(cur);
  return out;
}

for (const s of script.scenes) {
  if (want.length && !want.includes(s.id)) continue;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${script.voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: s.vo, model_id: script.model, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: s.speed ?? 1.0 } }),
  });
  if (!r.ok) throw new Error(`${s.id}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  writeFileSync(`public/vo/${s.id}.mp3`, Buffer.from(j.audio_base64, 'base64'));
  const seconds = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `public/vo/${s.id}.mp3`]).toString());
  writeFileSync(`src/voice/${s.id}.json`, JSON.stringify({ seconds, words: words(s.vo, j.alignment) }, null, 1));
  console.log(s.id, seconds.toFixed(1) + 's');
}

// Timeline: each scene = lead + narration + tail; the outro takes up the slack so the film is exactly totalSeconds.
const t = script.scenes.map((s) => {
  const d = JSON.parse(readFileSync(`src/voice/${s.id}.json`, 'utf8'));
  return { id: s.id, voiceSeconds: d.seconds, seconds: Math.round((LEAD + d.seconds + TAIL) * 30) / 30 };
});
const used = t.reduce((n, x) => n + x.seconds, 0);
t[t.length - 1].seconds += script.totalSeconds - used;
writeFileSync('src/timeline.json', JSON.stringify({ lead: LEAD, scenes: t }, null, 1));
console.log('scenes total', used.toFixed(1) + 's -> padded outro by', (script.totalSeconds - used).toFixed(1) + 's');
