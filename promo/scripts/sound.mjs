// Sound effects and music beds from ElevenLabs sound generation (music API needs a paid plan, so the beds are generated as long clips).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { headers } from './eleven.mjs';
mkdirSync('public/audio', { recursive: true });

const sfx = {
  whoosh: ['smooth modern UI whoosh transition, short, clean, airy', 1.2],
  swish: ['soft airy swish, subtle, short', 0.8],
  tap: ['soft UI tap click, subtle, clean, phone touch', 0.5],
  pop: ['bubbly UI pop, short, friendly', 0.5],
  chime: ['bright success chime, two ascending notes, glassy UI confirmation', 1.4],
  ping: ['gentle glassy notification ping, single note, phone', 1.2],
  scan: ['friendly digital scanner beep, short, success', 0.7],
  riser: ['soft cinematic riser swell building up, minimal, 3 seconds, ends clean', 3.0],
  impact: ['deep soft cinematic impact hit with short reverb tail, clean', 2.0],
  tick: ['tiny soft mechanical tick, clean', 0.5],
  key: ['single soft keyboard key press, clean', 0.5],
};
const music = {
  moody: ['dark minimal tension underscore, low pulsing synth bass, sparse ticking percussion, cinematic, 85 BPM, instrumental, no vocals', 22],
  upbeat: ['modern optimistic tech product promo music, 110 BPM, warm plucky synth arpeggio, soft kick drum, light claps, airy pads, uplifting, instrumental, no vocals, loopable', 30],
};
const want = process.argv.slice(2);
for (const [group, defs, dir] of [['sfx', sfx, 'sfx'], ['music', music, 'music']]) {
  mkdirSync(`public/audio/${dir}`, { recursive: true });
  for (const [name, [text, seconds]] of Object.entries(defs)) {
    const f = `public/audio/${dir}/${name}.mp3`;
    if (existsSync(f) && !want.includes(name)) continue;
    const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, duration_seconds: seconds, prompt_influence: 0.5, model_id: 'eleven_text_to_sound_v2' }),
    });
    if (!r.ok) { console.log(name, r.status, (await r.text()).slice(0, 160)); continue; }
    writeFileSync(f, Buffer.from(await r.arrayBuffer())); console.log('made', f);
  }
}
