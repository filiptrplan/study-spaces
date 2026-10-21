import React, { useEffect, useRef } from 'react';
import { AppProviders } from './Providers';

export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BAR = 47; // status bar strip

export type Pose = { x: number; y: number; scale: number; rx?: number; ry?: number; rz?: number; opacity?: number };

/** A phone showing the app's real components. Position and 3D rotation are given per frame by the scene. */
type Kids = React.ReactNode | ((scheme: 'dark' | 'light') => React.ReactNode);
export const Device: React.FC<{ pose: Pose; scheme?: 'dark' | 'light'; children: Kids; clock?: string; reveal?: { x: number; y: number; r: number }; clearBar?: number }> = ({ pose, scheme = 'dark', children, clock = '9:41', reveal, clearBar = 0 }) => {
  const { x, y, scale, rx = 0, ry = 0, rz = 0, opacity = 1 } = pose;
  const light = scheme === 'light';
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!process.env.PROMO_RECTS) return;
    const root = content.current; if (!root) return;
    const o = root.getBoundingClientRect(); const k = o.width / SCREEN_W;
    const out = [...root.querySelectorAll('button, a, input, h2, [role=img]')].map((e) => { const r = e.getBoundingClientRect(); return `${(e.textContent || (e as HTMLInputElement).placeholder || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 24)} @ ${Math.round((r.x - o.x) / k + r.width / k / 2)},${Math.round((r.y - o.y) / k + r.height / k / 2)} (${Math.round(r.width / k)}x${Math.round(r.height / k)})`; });
    console.log('RECTS ' + out.join(' | '));
  });
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, transformStyle: 'preserve-3d', transform: `translate(-50%, -50%) perspective(2600px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})` }}>
      <div style={{ position: 'relative', padding: 13, borderRadius: 66, background: 'linear-gradient(145deg,#3a3f3d 0%,#161817 45%,#2b2f2d 100%)', boxShadow: '0 70px 140px rgba(0,0,0,.6), 0 0 0 1.5px #4a4f4c inset, 0 0 0 1px #000' }}>
        {/* side keys */}
        <i style={{ position: 'absolute', left: -4, top: 150, width: 4, height: 62, borderRadius: 2, background: '#2a2d2b' }} />
        <i style={{ position: 'absolute', left: -4, top: 230, width: 4, height: 62, borderRadius: 2, background: '#2a2d2b' }} />
        <i style={{ position: 'absolute', right: -4, top: 200, width: 4, height: 96, borderRadius: 2, background: '#2a2d2b' }} />
        <div className="promo-app" style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 54, overflow: 'hidden', background: light ? '#f5f5f5' : '#121212', isolation: 'isolate' }}>
          {(reveal && reveal.r > 0 ? (['dark', 'light'] as const) : ([scheme] as const)).map((sch) => (
            <div key={sch} style={{ position: 'absolute', inset: 0, clipPath: sch === 'light' && reveal ? `circle(${reveal.r}px at ${reveal.x}px ${reveal.y + BAR}px)` : undefined, zIndex: sch === 'light' ? 2 : 1 }}>
              <AppProviders scheme={sch}>
                <div className={sch === 'light' ? 'promo-light' : undefined} style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                  <div ref={sch === (reveal && reveal.r > 0 ? 'light' : scheme) ? content : undefined} style={{ position: 'absolute', left: 0, right: 0, top: BAR, bottom: 0, display: 'flex', flexDirection: 'column' }}>{typeof children === 'function' ? children(sch) : children}</div>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 30px 0 34px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16, color: clearBar > 0.5 ? '#fff' : 'var(--color-text)', background: clearBar > 0.5 ? 'transparent' : 'var(--color-bg)', zIndex: 50 }}>
                    <span>{clock}</span>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" /></svg>
                      <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="2" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: 11, left: '50%', width: 118, height: 34, marginLeft: -59, borderRadius: 20, background: '#000', zIndex: 60 }} />
                  <div style={{ position: 'absolute', bottom: 7, left: '50%', width: 134, height: 5, marginLeft: -67, borderRadius: 3, background: sch === 'light' ? '#21212199' : '#ffffffaa', zIndex: 60 }} />
                </div>
              </AppProviders>
            </div>
          ))}
          {/* glass sheen */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 54, pointerEvents: 'none', background: 'linear-gradient(115deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 32%)', zIndex: 70 }} />
        </div>
      </div>
    </div>
  );
};

/** Pose that puts phone-local point `local` (in 390 x 844 screen space) at stage point `at`, at zoom `k`. */
export const focusPose = (local: { x: number; y: number }, at: { x: number; y: number }, k: number, tilt: Partial<Pose> = {}): Pose => ({
  x: at.x - (local.x - SCREEN_W / 2) * k,
  y: at.y - (local.y - SCREEN_H / 2) * k,
  scale: k,
  ...tilt,
});

/** Screens stacked in one phone: each layer is placed by `x` (0 = in place, 1 = a full width to the right). */
export const Stack: React.FC<{ layers: { node: React.ReactNode; x?: number; dim?: number; z?: number }[] }> = ({ layers }) => (
  <div className="relative min-h-0 flex-1 overflow-hidden">
    {layers.map((l, i) => (
      <div key={i} className="absolute inset-0 flex flex-col" style={{ transform: `translateX(${(l.x ?? 0) * 100}%)`, filter: l.dim ? `brightness(${1 - l.dim * 0.5})` : undefined, zIndex: l.z ?? i, boxShadow: (l.x ?? 0) > 0 ? '-20px 0 40px rgba(0,0,0,.35)' : undefined }}>{l.node}</div>
    ))}
  </div>
);
