import React, { useMemo } from 'react';
import { C } from '../tokens';
import { fontFamily } from '../stage';

import C_ from '../../public/map/HG.C.json'; import D_ from '../../public/map/HG.D.json'; import E_ from '../../public/map/HG.E.json';
import F_ from '../../public/map/HG.F.json'; import G_ from '../../public/map/HG.G.json'; import H_ from '../../public/map/HG.H.json';
import J_ from '../../public/map/HG.J.json';

type Level = { rooms: { name: string; kind: string; rings: number[][][] }[]; lines: { wall?: number[][] } };
export const FLOORS: { letter: string; data: Level }[] = [
  { letter: 'C', data: C_ as Level }, { letter: 'D', data: D_ as Level }, { letter: 'E', data: E_ as Level }, { letter: 'F', data: F_ as Level },
  { letter: 'G', data: G_ as Level }, { letter: 'H', data: H_ as Level }, { letter: 'J', data: J_ as Level },
];

/* Level data is in micro-degrees from the building's origin: stretch to metres so the plan has its real shape. */
const X = (x: number) => (x * 0.753).toFixed(1);
const Y = (y: number) => ((1500 - y) * 1.11).toFixed(1);
const ring = (r: number[]) => { let d = ''; for (let i = 0; i < r.length; i += 2) d += `${i ? 'L' : 'M'}${X(r[i])} ${Y(r[i + 1])}`; return d + 'Z'; };
const SIZE = { w: 1500, h: 1665 };

/** Rooms the booking system knows about, drawn the way the app's map does: green while seats are free. */
export const BOOKABLE: Record<string, string> = { 'HG D 3.1': C.free, 'HG F 5': C.free };

type Built = { fill: string; study: string; library: string; walls: string; bookable: Record<string, string> };
const built: Record<string, Built> = {};
for (const { letter, data } of FLOORS) {
  const b: Built = { fill: '', study: '', library: '', walls: '', bookable: {} };
  for (const r of data.rooms) {
    const d = r.rings.map((poly) => poly.map(ring).join('')).join('');
    if (BOOKABLE[r.name]) { b.bookable[r.name] = (b.bookable[r.name] ?? '') + d; continue; }
    if (r.kind === 'study') b.study += d; else if (r.kind === 'library') b.library += d; else b.fill += d;
  }
  b.walls = (data.lines.wall ?? []).map((w) => { let d = ''; for (let i = 0; i < w.length; i += 2) d += `${i ? 'L' : 'M'}${X(w[i])} ${Y(w[i + 1])}`; return d; }).join('');
  built[letter] = b;
}

/** The building as stacked floor plans in 3D. `detail` is how much of each floor's plan is drawn (0 outline only, 1 full). */
export const FloorStack: React.FC<{
  gap: number; rx: number; rz: number; scale: number; active: number; lights: number; labelIn: number;
}> = ({ gap, rx, rz, scale, active, lights, labelIn }) => {
  const paths = useMemo(() => built, []);
  return (
    <div style={{ width: SIZE.w, height: SIZE.h, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateZ(${rz}deg) scale(${scale})` }}>
      {FLOORS.map(({ letter }, i) => {
        const near = Math.max(0, 1 - Math.abs(i - active));       // 1 on the selected floor, fading to its neighbours
        const b = paths[letter];
        const body = near;
        return (
          <div key={letter} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${i * gap}px)` }}>
            <svg width={SIZE.w} height={SIZE.h} viewBox={`0 0 ${SIZE.w} ${SIZE.h}`} style={{ overflow: 'visible' }}>
              {/* the floor slab, like the app's "levels" part */}
              <rect x={20} y={20} width={SIZE.w - 40} height={SIZE.h - 40} rx={30} fill="#1e232c" fillOpacity={0.08 + body * 0.5} stroke="#8792a5" strokeOpacity={0.25 + body * 0.5} strokeWidth={5} />
              <path d={b.fill} fill="#2b323d" fillOpacity={0.12 + body * 0.75} stroke="#8792a5" strokeOpacity={0.12 + body * 0.8} strokeWidth={1.4} />
              <path d={b.library} fill="#4c8dff" fillOpacity={0.1 + body * 0.35} stroke="#4c8dff" strokeOpacity={0.15 + body * 0.8} strokeWidth={2} />
              <path d={b.study} fill="#4c8dff" fillOpacity={0.1 + body * 0.38 + lights * 0.15} stroke="#4c8dff" strokeOpacity={0.2 + body * 0.8} strokeWidth={2.5} />
              <path d={b.walls} fill="none" stroke="#aab3c2" strokeOpacity={0.05 + body * 0.4} strokeWidth={1.2} />
              {Object.entries(b.bookable).map(([name, d]) => (
                <path key={name} d={d} fill={BOOKABLE[name]} fillOpacity={0.35 + lights * 0.55} stroke={BOOKABLE[name]} strokeWidth={4 + lights * 6} strokeOpacity={1} />
              ))}
            </svg>
            <div style={{ position: 'absolute', left: 30, top: SIZE.h - 260, fontFamily, fontSize: 210, fontWeight: 700, color: i === Math.round(active) ? C.accent : C.muted, opacity: labelIn * (0.25 + 0.75 * near), lineHeight: 1 }}>{letter}</div>
          </div>
        );
      })}
    </div>
  );
};
