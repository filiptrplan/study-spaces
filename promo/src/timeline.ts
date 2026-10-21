// Scene lengths come from the narration (scripts/voice.mjs); cues find spoken words so UI lands on them.
import timeline from './timeline.json';
import { FPS } from './tokens';

import hook from './voice/hook.json'; import problem from './voice/problem.json'; import title from './voice/title.json';
import find from './voice/find.json'; import seat from './voice/seat.json'; import checkin from './voice/checkin.json';
import brk from './voice/break.json'; import fair from './voice/fair.json'; import map from './voice/map.json';
import friends from './voice/friends.json'; import live from './voice/live.json'; import install from './voice/install.json';
import outro from './voice/outro.json';

type Voice = { seconds: number; words: { w: string; s: number; e: number }[] };
const voices: Record<string, Voice> = { hook, problem, title, find, seat, checkin, break: brk, fair, map, friends, live, install, outro };

export type SceneId = keyof typeof voices;
let at = 0;
export const scenes = timeline.scenes.map((s) => {
  const from = at; const frames = Math.round(s.seconds * FPS); at += frames;
  return { id: s.id as SceneId, from, frames, voiceSeconds: s.voiceSeconds };
});
export const totalFrames = at;
export const LEAD = Math.round(timeline.lead * FPS);
export const sceneOf = (id: SceneId) => scenes.find((s) => s.id === id)!;
export const voiceOf = (id: SceneId) => voices[id];

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
/** Frame (relative to the scene start) at which the narration says `word`; the n-th occurrence if `nth` is given. */
export function cue(id: SceneId, word: string, nth = 0, edge: 's' | 'e' = 's'): number {
  const hits = voices[id].words.filter((x) => clean(x.w) === clean(word));
  const hit = hits[nth];
  if (!hit) throw new Error(`cue: "${word}" (#${nth}) not in ${id}`);
  return LEAD + Math.round(hit[edge] * FPS);
}
