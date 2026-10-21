import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, D, ease, easeIn, easeOut } from '../tokens';
import { prog } from '../motion';

/** Finger tap: a dot that lands, a ring that spreads. Coordinates are in the phone's 390 x 844 space. */
export const Tap: React.FC<{ at: number; x: number; y: number; hold?: number }> = ({ at, x, y, hold = 6 }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < -10 || t > 34) return null;
  const down = prog(f, at - 8, 8, easeOut) * (1 - prog(f, at + hold, 8, easeIn));
  const ring = prog(f, at, 20, easeOut);
  const press = prog(f, at, 4) * (1 - prog(f, at + hold, 6));
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 90, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: '50%', border: `3px solid ${C.accent}`, opacity: (1 - ring) * 0.9, transform: `scale(${0.4 + ring * 1.3})`, display: t >= 0 ? 'block' : 'none' }} />
      <div style={{ position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.35)', border: '2px solid rgba(255,255,255,.85)', boxShadow: '0 6px 18px rgba(0,0,0,.35)', opacity: down, transform: `scale(${1 - press * 0.22}) translateY(${(1 - down) * 24}px)` }} />
    </div>
  );
};
export { C, D, ease };
