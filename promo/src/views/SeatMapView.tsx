import React from 'react';
import { Button } from '@mantine/core';
import { roomGeometry, roomTables, type MapSeat } from '../../../frontend/src/domain/room';
import { SeatMarker } from '../../../frontend/src/components/seat-map/SeatMarker';
import { seatStateName, stateVar } from '../../../frontend/src/domain/seat';
import type { SeatFriend } from '../../../frontend/src/features/social/studying';

export type Cam = { x: number; y: number; k: number };
/** The room the app draws when no layout is saved, with the camera under the film's control instead of pan and zoom. */
export const SeatMapView: React.FC<{
  seats: MapSeat[]; selected?: string | null; friends?: Record<string, SeatFriend>;
  people?: Record<string, { initials: string; name: string }>;
  cam: Cam; width: number; height: number; chooseFree?: boolean; pulse?: Record<string, number>;
}> = ({ seats, selected = null, friends, people, cam, width, height, chooseFree = true, pulse }) => (
  <div className="relative size-full overflow-hidden bg-canvas" style={{ width, height }}>
    <div className="absolute top-0 left-0 h-190 w-160 origin-top-left" style={{ transform: `translate(${width / 2 - cam.x * cam.k}px, ${height / 2 - cam.y * cam.k}px) scale(${cam.k})` }}>
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${roomGeometry.width} ${roomGeometry.height}`}>
        <path className="fill-surface" d={roomGeometry.fill} />
        <path className="fill-none stroke-border-strong stroke-2" strokeLinejoin="round" d={roomGeometry.walls} />
        <path className="fill-none stroke-accent stroke-6" d={roomGeometry.windows} />
        <path className="fill-none stroke-border-strong stroke-1" d={roomGeometry.door} />
        {roomTables.map((t) => (
          <g key={`${t.x}-${t.y}`}>
            <rect className="fill-surface-2 stroke-border-strong stroke-1" x={t.x} y={t.y} width={t.width} height={t.height} rx={5} />
            {t.label && <text className="fill-text-muted text-label font-semibold" x={t.x + t.width / 2} y={t.y + 22} textAnchor="middle">{t.label}</text>}
          </g>
        ))}
      </svg>
      {seats.map((s) => (
        <React.Fragment key={s.id}>
          {pulse?.[s.id] ? (
            <span className="absolute rounded-full border-2 border-accent" style={{ left: s.x, top: s.y, width: 60, height: 60, marginLeft: -30, marginTop: -30, opacity: 1 - pulse[s.id], transform: `scale(${0.6 + pulse[s.id] * 1.2})` }} />
          ) : null}
          <SeatMarker id={s.id} label={s.label} state={s.state} x={s.x} y={s.y} angle={0} selected={s.id === selected} onSelect={() => {}} friend={friends?.[s.id]} person={people?.[s.id]} />
        </React.Fragment>
      ))}
    </div>
    {chooseFree && (
      <div className="absolute top-3 right-3 z-1"><Button variant="map">Choose any free seat</Button></div>
    )}
  </div>
);
export { seatStateName, stateVar };
