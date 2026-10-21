import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Barlow';
import { C } from './tokens';
import { prog, window as win } from './motion';
import { easeOut } from './tokens';

export const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });

/** The seat mark as the app draws it: a desk, four seats, one free. */
export const Mark: React.FC<{ size: number; free?: string; pulse?: number }> = ({ size, free = C.free, pulse = 0 }) => (
  <svg width={size} height={size * (120 / 112)} viewBox="72 68 112 120" style={{ overflow: 'visible' }}>
    <rect x="72" y="111" width="112" height="34" rx="12" fill={C.occupied} />
    {pulse > 0 && <rect x="88" y="68" width="34" height="34" rx="9" fill="none" stroke={free} strokeWidth="3" opacity={1 - pulse} transform={`translate(105 85) scale(${1 + pulse * 1.6}) translate(-105 -85)`} />}
    <rect x="88" y="68" width="34" height="34" rx="9" fill={free} />
    <rect x="134" y="68" width="34" height="34" rx="9" fill={C.occupied} />
    <rect x="88" y="154" width="34" height="34" rx="9" fill={C.occupied} />
    <rect x="134" y="154" width="34" height="34" rx="9" fill={C.occupied} />
  </svg>
);

export const Wordmark: React.FC<{ size: number; pulse?: number }> = ({ size, pulse = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3, fontFamily, fontSize: size, color: C.text, lineHeight: 1 }}>
    <Mark size={size * 0.9} pulse={pulse} />
    <span style={{ wordSpacing: '-0.1em', letterSpacing: -size * 0.01 }}><b style={{ fontWeight: 700 }}>Study</b> <span style={{ fontWeight: 400 }}>Spaces</span></span>
  </div>
);

/** Backdrop: app background, a slow glow that follows the story, and a faint grid of seats. */
export const Backdrop: React.FC<{ glow?: { x: number; y: number; color: string; r?: number; o?: number } }> = ({ glow }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {glow && <div style={{ position: 'absolute', left: glow.x - (glow.r ?? 900), top: glow.y - (glow.r ?? 900), width: (glow.r ?? 900) * 2, height: (glow.r ?? 900) * 2, borderRadius: '50%', background: `radial-gradient(circle, ${glow.color} 0%, transparent 62%)`, opacity: glow.o ?? 0.22 }} />}
      <AbsoluteFill style={{ opacity: 0.05, backgroundImage: `radial-gradient(${C.text} 1.4px, transparent 1.5px)`, backgroundSize: '48px 48px', backgroundPosition: `${f * 0.12}px ${f * 0.06}px` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.5) 100%)' }} />
    </AbsoluteFill>
  );
};

/** One big line that rises in word by word; `at` is the start frame, `gap` frames between words. */
export const Kinetic: React.FC<{ text: string; at: number; size?: number; gap?: number; color?: string; weight?: number; out?: number; align?: 'left' | 'center'; accentWords?: string[] }> = ({ text, at, size = 120, gap = 4, color = C.text, weight = 700, out, align = 'left', accentWords = [] }) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const o = out === undefined ? 0 : prog(f, out, 10);
  return (
    <div style={{ fontFamily, fontSize: size, fontWeight: weight, color, lineHeight: 1.02, letterSpacing: -size * 0.02, textAlign: align, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26, opacity: 1 - o, transform: `translateY(${-o * 16}px)` }}>
      {words.map((w, i) => {
        const p = prog(f, at + i * gap, 14, easeOut);
        return <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * size * 0.28}px)`, filter: `blur(${(1 - p) * 8}px)`, color: accentWords.includes(w.replace(/[.,!?]/g, '')) ? C.accent : color }}>{w}</span>;
      })}
    </div>
  );
};

/** Small supporting line. */
export const Sub: React.FC<{ children: React.ReactNode; at: number; size?: number; out?: number; align?: 'left' | 'center'; color?: string }> = ({ children, at, size = 40, out, align = 'left', color = C.muted }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, easeOut);
  const o = out === undefined ? 0 : prog(f, out, 10);
  return <div style={{ fontFamily, fontSize: size, fontWeight: 400, color, lineHeight: 1.3, textAlign: align, opacity: p * (1 - o), transform: `translateY(${(1 - p) * 18}px)` }}>{children}</div>;
};

/** Floating label pill, like the app's chips: a shape cue plus words. */
export const Pill: React.FC<{ at: number; out?: number; tone?: string; children: React.ReactNode; size?: number; icon?: React.ReactNode }> = ({ at, out, tone = C.accent, children, size = 32, icon }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14, easeOut);
  const o = out === undefined ? 0 : prog(f, out, 10);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 16, background: C.surface, border: `2px solid ${C.border}`, boxShadow: '0 18px 40px rgba(0,0,0,.35)', fontFamily, fontSize: size, fontWeight: 500, color: C.text, opacity: p * (1 - o), transform: `translateY(${(1 - p) * 22}px) scale(${0.96 + 0.04 * p})` }}>
      {icon ?? <span style={{ width: 16, height: 16, borderRadius: 5, background: tone }} />}{children}
    </div>
  );
};
export { win };
