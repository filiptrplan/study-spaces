import React from 'react';
import { ActionIcon, Text } from '@mantine/core';
import qrcode from 'qrcode-generator';
import { Icon } from '../../../frontend/src/components/Icon';

const qr = qrcode(0, 'M');
qr.addData('https://02.hackathon.ethz.ch/qr?qr_token=0sw_sq0Vh1OIMR1xgNLcUMynwAhv705c6yVfsC5e_gU');
qr.make();
const N = qr.getModuleCount();
export const QrCode: React.FC<{ size: number; fg?: string; bg?: string }> = ({ size, fg = '#111', bg = '#fff' }) => (
  <svg width={size} height={size} viewBox={`-2 -2 ${N + 4} ${N + 4}`} shapeRendering="crispEdges">
    <rect x={-2} y={-2} width={N + 4} height={N + 4} fill={bg} />
    {Array.from({ length: N * N }, (_, i) => (qr.isDark(Math.floor(i / N), i % N) ? <rect key={i} x={i % N} y={Math.floor(i / N)} width={1} height={1} fill={fg} /> : null))}
  </svg>
);

/** The scan screen: a dark camera view, the app's scan frame, and a table with the seat's QR code swaying in it. */
export const ScanView: React.FC<{ t: number; sweep: number; locked: number; title?: string; seat?: string; space?: string }> = ({ t, sweep, locked, title = 'Scan the QR code on your table', seat = 'A-2', space = 'HG D 3.1' }) => {
  const sway = Math.sin(t / 17) * 6, sway2 = Math.cos(t / 23) * 5;
  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-camera-bg text-camera-fg">
      {/* camera feed: a table seen from above, the QR code printed on it */}
      <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: 'radial-gradient(120% 80% at 50% 40%, #6a5a47 0%, #3d3328 55%, #1e1812 100%)' }}>
        <div style={{ position: 'absolute', left: '50%', top: '47%', width: 190, height: 190, marginLeft: -95 + sway, marginTop: -95 + sway2, transform: `rotate(${-4 + Math.sin(t / 29) * 2}deg) scale(${1 + locked * 0.08})`, boxShadow: '0 20px 50px rgba(0,0,0,.5)', borderRadius: 8, overflow: 'hidden' }}>
          <QrCode size={190} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '100%', background: 'linear-gradient(115deg, rgba(255,255,255,.07), transparent 40%)' }} />
      </div>
      <div className="relative z-1 flex items-center justify-between p-2">
        <ActionIcon variant="camera" aria-label="Back"><Icon name="back" /></ActionIcon>
        <ActionIcon variant="camera" aria-label="Flashlight"><Icon name="flashlight" /></ActionIcon>
      </div>
      <div className="grid flex-1 place-content-center justify-items-center gap-4 px-4 text-center">
        <div className="relative block aspect-square w-[280px] rounded-sheet border-3 border-camera-fg shadow-camera-dim" style={{ borderColor: locked ? 'var(--color-seat-free)' : undefined, transform: `scale(${1 - locked * 0.04})` }}>
          <div className="absolute inset-x-0 border-t-2 border-accent" style={{ top: `${sweep * 100}%`, opacity: 1 - locked, boxShadow: '0 0 18px var(--color-accent)' }} />
          {locked > 0 && <div className="absolute inset-0 grid place-items-center rounded-sheet" style={{ background: 'rgba(111,191,115,.18)' }}><span className="grid size-14 place-items-center rounded-full bg-seat-free text-on-seat" style={{ transform: `scale(${locked})` }}><Icon name="check" /></span></div>}
        </div>
        <div className="relative z-1 grid gap-2">
          <Text className="text-title">{title}</Text>
          <Text size="sm" className="text-camera-fg/72">Seat {seat} · {space}</Text>
        </div>
      </div>
      <div className="h-8" />
    </div>
  );
};
