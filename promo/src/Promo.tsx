import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS } from './tokens';
import { LEAD, scenes, totalFrames, voiceOf, type SceneId } from './timeline';
import { Backdrop } from './stage';
import { sfxCues } from './sfx';
import * as S from './scenes';
import { OpeningLayer } from './scenes/opening';
import { sceneOf } from './timeline';

const VIEW: Record<SceneId, React.FC<{ total: number }>> = {
  hook: S.Hook, problem: S.Problem, title: S.Title, find: S.Find, seat: S.Seat, checkin: S.CheckIn, break: S.Break,
  fair: S.Fair, map: S.CampusMap, friends: S.Friends, live: S.Live, install: S.Install, outro: S.Outro,
};

/** Music sits low under the narration and rises in the gaps. */
const duck = (frame: number) => {
  let v = 0.5;
  for (const s of scenes) {
    const a = s.from + LEAD, b = a + Math.round(voiceOf(s.id).seconds * FPS);
    if (frame >= a - 6 && frame <= b + 12) v = Math.min(v, 0.2 + 0.3 * Math.max(Math.min((a - frame) / 6, 1), Math.min((frame - b) / 12, 1), 0));
  }
  return v;
};

export const Promo: React.FC<{ voice?: boolean }> = ({ voice = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#121212' }}>
      <Backdrop />
      <Sequence from={sceneOf('hook').from} durationInFrames={sceneOf('hook').frames + sceneOf('problem').frames + sceneOf('title').frames} name="opening-field"><OpeningLayer /></Sequence>
      {scenes.map((s) => {
        const View = VIEW[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
            <View total={s.frames} />
            {voice && <Sequence from={LEAD}><Audio src={staticFile(`vo/${s.id}.mp3`)} volume={1} /></Sequence>}
          </Sequence>
        );
      })}
      {voice && <Audio src={staticFile('audio/music-bed.mp3')} volume={(fr) => duck(fr) * interpolate(fr, [totalFrames - 90, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })} />}
      {voice && sfxCues().map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={Math.ceil(c.len * FPS)}>
          <Audio src={staticFile(`audio/sfx/${c.name}.mp3`)} volume={c.volume ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { totalFrames, scenes };
