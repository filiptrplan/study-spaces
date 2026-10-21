import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Card, Text, Title as MTitle } from '@mantine/core';
import { SeatMarker } from '../../../frontend/src/components/seat-map/SeatMarker';
import { SeatChip } from '../../../frontend/src/components/SeatChip';
import { Icon } from '../../../frontend/src/components/Icon';
import type { SeatState } from '../../../frontend/src/domain/seat';
import { AppProviders } from '../app/Providers';
import { C, easeIn, easeOut } from '../tokens';
import { cue, sceneOf } from '../timeline';
import { prog, range } from '../motion';
import { Kinetic, Sub, Wordmark, Mark, fontFamily } from '../stage';

const COLS = 25, ROWS = 14, CELL = 78;
const hash = (i: number, salt = 1) => (((i + 1) * 2654435761 * salt) >>> 0) % 1000 / 1000;

/** One continuous layer for the opening: hook, problem and title share the seat field. Frames are relative to the hook's start. */
export const OpeningLayer: React.FC = () => {
  const f = useCurrentFrame();
  const hook = sceneOf('hook'), prob = sceneOf('problem'), title = sceneOf('title');
  const pStart = hook.frames, tStart = hook.frames + prob.frames;
  const fillAt = cue('hook', 'nine') - 6;                 // seats start filling as the narration begins
  const held = pStart + cue('problem', 'held') - 12;       // some turn purple on "held"
  const collapse = tStart + 4;                             // field gives way to the logo
  const drift = range(f, 0, tStart + 30, 0, 1, (t) => t);
  const fieldOut = prog(f, collapse, 22, easeIn);

  const stateOf = (i: number): SeatState => {
    const order = hash(i) * 120;                           // organic, not a sweep
    if (f < fillAt + order) return 'free';
    if (i % 5 === 2 && hash(i, 7) > 0.35 && f > held + hash(i, 3) * 70) return 'reserved';
    return 'occupied';
  };
  const centre = (COLS * CELL) / 2;
  return (
    <AbsoluteFill style={{ opacity: 1 - fieldOut * 0.98 }}>
      <AppProviders>
        <div className="promo-app" style={{ position: 'absolute', left: 960 - centre, top: 540 - (ROWS * CELL) / 2, width: COLS * CELL, height: ROWS * CELL, transform: `scale(${1.05 + drift * 0.16}) rotate(${-1.2 + drift * 1.2}deg)`, transformOrigin: '50% 50%' }}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const x = i % COLS, y = Math.floor(i / COLS);
            const letter = String.fromCharCode(65 + (y % 12)), n = x + 1;
            return <SeatMarker key={i} id={`o${i}`} label={`${letter}-${n}`} state={stateOf(i)} x={x * CELL + CELL / 2} y={y * CELL + CELL / 2} selected={false} onSelect={() => {}} />;
          })}
        </div>
      </AppProviders>
      <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(18,18,18,.88) 0%, rgba(18,18,18,.55) 55%, rgba(18,18,18,0) 100%)' }} />
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const a = cue('hook', 'nine'), b = cue('hook', 'finals'), c = cue('hook', 'nowhere') - 8;
  const clock = Math.min(1, prog(f, a - 4, 40));
  const hh = 8 + (clock > 0.5 ? 1 : 0), mm = clock > 0.5 ? 0 : Math.floor(55 + clock * 10);
  const tick = clock >= 1 ? '9:00' : `${hh}:${String(Math.min(59, mm)).padStart(2, '0')}`;
  const out = (frame: number, over: number) => prog(f, frame, 8, easeIn) * (f >= over ? 1 : 0);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', display: 'grid', placeItems: 'center', gap: 10 }}>
        {f < b - 6 && <div style={{ opacity: 1 - out(b - 14, b - 6) }}><Kinetic text={`${tick} a.m.`} at={a - 8} size={220} align="center" /></div>}
        {f >= b - 6 && f < c - 6 && <div><Kinetic text="Finals week." at={b - 6} size={200} align="center" gap={5} /></div>}
        {f >= c - 6 && <div><Kinetic text="Nowhere to sit." at={c - 6} size={200} align="center" gap={5} color={C.text} accentWords={[]} /></div>}
      </div>
    </AbsoluteFill>
  );
};

export const Problem: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const full = cue('problem', 'full'), held = cue('problem', 'held'), hall = cue('problem', 'hallway');
  const cardIn = prog(f, held + 6, 16, easeOut) * (1 - prog(f, hall - 12, 10, easeIn));
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'grid', placeItems: 'center' }}>
        {f < held - 10 && <Kinetic text="Every room looks full." at={full - 8} size={118} align="center" gap={4} out={held - 18} />}
        {f >= held - 10 && f < hall - 18 && <Kinetic text="Held. Not here." at={held - 8} size={150} align="center" gap={6} out={hall - 24} />}
        {f >= hall - 18 && <Kinetic text="You'd never know." at={hall - 16} size={150} align="center" gap={5} />}
      </div>
      <div className="promo-app" style={{ position: 'absolute', left: 960 - 360, top: 690, width: 540, opacity: cardIn, transformOrigin: '50% 0', transform: `translateY(${(1 - cardIn) * 40}px) scale(${1.33 * (0.94 + 0.06 * cardIn)})` }}>
        <AppProviders>
          <Card component="section" className="border-l-6 border-l-seat-reserved">
            <div className="flex items-center justify-between gap-2">
              <MTitle order={2} className="text-heading">Seat F-7</MTitle>
              <SeatChip state="reserved" />
            </div>
            <Text c="dimmed" className="flex items-center gap-2"><Icon name="pin" size="sm" /> Reserved, not checked in</Text>
          </Card>
        </AppProviders>
      </div>
    </AbsoluteFill>
  );
};

export const Title: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const meet = cue('title', 'meet'), spaces = cue('title', 'spaces'), live = cue('title', 'live');
  const markIn = prog(f, 14, 22, easeOut);
  const free = prog(f, 30, 14);
  const pulse = prog(f, 34, 34, easeOut);
  const word = prog(f, spaces - 20, 22, easeOut);
  const tagline = prog(f, live - 6, 18, easeOut);
  const lift = prog(f, spaces - 6, 26) * 38;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center', gap: 46, transform: `translateY(${-lift}px)` }}>
        <div style={{ opacity: markIn, transform: `scale(${0.7 + 0.3 * markIn})` }}>
          <Mark size={word > 0 ? 190 * (1 - word * 0.0) : 190} free={free > 0.5 ? C.free : C.occupied} pulse={pulse < 1 ? pulse : 0} />
        </div>
        <div style={{ height: 110, opacity: word, transform: `translateY(${(1 - word) * 30}px)`, filter: `blur(${(1 - word) * 10}px)` }}>
          <div style={{ fontFamily, fontSize: 130, color: C.text, letterSpacing: -2.6, lineHeight: 1, wordSpacing: '-0.1em', whiteSpace: 'nowrap' }}><b style={{ fontWeight: 700 }}>Study</b> <span style={{ fontWeight: 400 }}>Spaces</span></div>
        </div>
        <Sub at={live - 6} size={46} align="center">Every study room on campus. Live.</Sub>
      </div>
      <div style={{ display: 'none' }}>{meet}{tagline}</div>
    </AbsoluteFill>
  );
};
export { Wordmark };

export const openingCues = () => {
  const h = sceneOf('hook'), p = sceneOf('problem'), t = sceneOf('title');
  return [
    { name: 'riser', frame: h.from, len: 3, volume: 0.45 },
    { name: 'tick', frame: h.from + cue('hook', 'nine'), len: 0.5, volume: 0.5 },
    { name: 'impact', frame: h.from + cue('hook', 'nowhere') - 4, len: 2, volume: 0.6 },
    { name: 'pop', frame: p.from + cue('problem', 'held'), len: 0.5, volume: 0.5 },
    { name: 'swish', frame: p.from + cue('problem', 'hallway') - 6, len: 0.8, volume: 0.5 },
    { name: 'impact', frame: t.from + 10, len: 2, volume: 0.55 },
    { name: 'chime', frame: t.from + 32, len: 1.4, volume: 0.5 },
    { name: 'whoosh', frame: t.from + cue('title', 'spaces') - 16, len: 1.2, volume: 0.5 },
  ];
};
