import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Button, Text } from '@mantine/core';
import { Device, focusPose, Stack, type Pose } from '../app/Device';
import { useFilmClock, BASE } from '../app/clock';
import { Tap } from '../app/fx';
import { HERO, FRIEND_SEATS, heroStates, initialsOf, people, seatId, seatsFor } from '../app/fixtures';
import { C, easeIn, easeOut } from '../tokens';
import { cue, sceneOf } from '../timeline';
import { glide, lerp, prog, range } from '../motion';
import { Kinetic, Pill, Sub, fontFamily } from '../stage';
import { PL, PR, TEXT_LEFT, TEXT_RIGHT } from '../layout';
import { HomeView, ReservationView, SeatHeader, SeatSheetView, SessionView } from '../views/screens';
import { SheetLayer, Screen } from '../views/chrome';
import { SeatMapView } from '../views/SeatMapView';
import { ScanView } from '../views/ScanView';
import { PersonAvatar } from '../../../frontend/src/features/social/SocialParts';
import { Icon } from '../../../frontend/src/components/Icon';
import { TimerCard } from '../../../frontend/src/components/TimerCard';
import { SeatChip } from '../../../frontend/src/components/SeatChip';
import { Card, Title as MTitle } from '@mantine/core';
import { AppProviders } from '../app/Providers';
import { stripeClass } from '../../../frontend/src/domain/seat';
import { friendsBySeat } from '../../../frontend/src/features/social/studying';

const Col: React.FC<{ side: 'left' | 'right'; children: React.ReactNode }> = ({ side, children }) => {
  const box = side === 'left' ? TEXT_LEFT : TEXT_RIGHT;
  return <div style={{ position: 'absolute', left: box.left, width: box.width, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>{children}</div>;
};
const Pills: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', marginTop: 8 }}>{children}</div>;

/** A phone that glides in, breathes while idle and glides out; `base` is where it rests. */
const enterPose = (f: number, total: number, base: { x: number; y: number }, from: 'left' | 'right', ry = -9): Pose => {
  const inn = glide(f, 0, 36), out = prog(f, total - 14, 14, easeIn);
  const dir = from === 'right' ? 1 : -1;
  return {
    x: base.x + dir * 300 * (1 - inn) + dir * 160 * out, y: base.y + 150 * (1 - inn) + Math.sin(f / 46) * 5,
    scale: 0.92 + 0.16 * inn - 0.04 * out, ry: (from === 'right' ? ry : -ry) * (0.4 + 0.6 * inn) + dir * -24 * (1 - inn), rx: 3 + Math.sin(f / 60) * 0.8, rz: 0, opacity: Math.min(1, inn * 2.4) * (1 - out),
  };
};
const mix = (a: Pose, b: Pose, t: number): Pose => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t), rx: lerp(a.rx ?? 0, b.rx ?? 0, t), ry: lerp(a.ry ?? 0, b.ry ?? 0, t), rz: lerp(a.rz ?? 0, b.rz ?? 0, t), opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t) });

/* ===================================================================== FIND */
export const Find: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const search = cue('find', 'search'), typos = cue('find', 'typos'), free = cue('find', 'free'), fav = cue('find', 'favourites');
  const typed = 'hg d3';
  const typeAt = typos - 14;
  const n = Math.max(0, Math.min(typed.length, Math.floor((f - typeAt) / 5)));
  const rest = enterPose(f, total, PR, 'right');
  const card = prog(f, free - 8, 30);                  // push in on the result
  const focus = focusPose({ x: 190, y: 300 }, { x: PR.x - 30, y: PR.y - 40 }, 1.32, { ry: -4, rx: 1 });
  const rowsBack = prog(f, fav - 6, 26);               // back to the rows for favourites and recents
  const pose = mix(mix(rest, { ...focus, opacity: rest.opacity }, card * (1 - rowsBack)), rest, rowsBack);
  const shown = f >= typeAt ? typed.slice(0, n) : '';
  const search$ = rowsBack > 0.5 ? '' : shown;
  return (
    <AbsoluteFill>
      <Col side="left">
        <Kinetic text="Find a room." at={10} size={112} />
        <Sub at={26} size={42}>Search forgives typos. Free seats, live.</Sub>
        <Pills>
          <Pill at={typos - 4} out={fav - 10} tone={C.accent}>Typo-proof search</Pill>
          <Pill at={free} out={fav - 10} tone={C.free}>Live free-seat count</Pill>
          <Pill at={fav + 2} tone={C.accent}>Favourites &amp; recents</Pill>
        </Pills>
      </Col>
      <Device pose={pose}>
        <HomeView search={search$} />
        <Tap at={search + 6} x={194} y={102} />
      </Device>
    </AbsoluteFill>
  );
};

/* ===================================================================== SEAT */
const seats = seatsFor(heroStates);
export const Seat: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const plan = cue('seat', 'floor'), friendsW = cue('seat', 'friends'), tap = cue('seat', 'tap'), confirm = cue('seat', 'confirm'), min = cue('seat', 'fifteen');
  const rest = enterPose(f, total, PL, 'left');
  const W = 390, MAP_H = 650;
  // camera on the room: fit, drift, then glide to A-2
  const fit = Math.min(W / 640, MAP_H / 760) * 1.02;
  const toSeat = glide(f, tap + 2, 30);
  const cam = { x: lerp(320, 188, toSeat), y: lerp(380, 92 + 24, toSeat), k: lerp(fit + range(f, plan, friendsW, 0, 0.05), 1.55, toSeat) };
  const selected = f > tap + 34 ? seatId(1) : null;
  const sheet = glide(f, tap + 34, 16);
  const decide = glide(f, confirm - 4, 18) * (1 - prog(f, confirm + 24, 12, easeIn));
  const toRes = glide(f, confirm + 30, 22);
  const clock = useFilmClock();
  const reserveAt = BASE + ((confirm + 30) / 30) * 1000;
  const friendRings: Record<string, number> = {};
  [0, 2, 3].forEach((i, k) => { const t = prog(f, friendsW + k * 6, 26, easeOut); if (t > 0 && t < 1) friendRings[seatId(i)] = t; });
  const friends = Object.fromEntries(Object.entries(FRIEND_SEATS).map(([id, p]) => [id, { name: p.name, initials: initialsOf(p.name), photoUrl: null, onBreak: false }]));
  const pose: Pose = mix(rest, { ...rest, ry: -4, rx: 2, scale: rest.scale * 1.04 }, toSeat);
  const mapView = (
    <Screen>
      <SeatHeader name="HG D 3.1" free={14} total={32} friendsHere={3} />
      <div className="relative min-h-0 flex-1">
        <SeatMapView seats={seats} selected={selected} friends={friends} cam={cam} width={390} height={MAP_H - 12} pulse={friendRings} />
        <SeatSheetView t={sheet} seat="A-2" detail="HG D 3.1 · Available now" action="Reserve seat A-2" />
      </div>
    </Screen>
  );
  const resView = <ReservationView now={clock} expiresAt={reserveAt + 15 * 60 * 1000} seat="A-2" space="HG D 3.1" />;
  return (
    <AbsoluteFill>
      <Col side="right">
        <Kinetic text="Pick your seat." at={10} size={112} />
        <Sub at={26} size={42}>The room's real floor plan, with your friends on it.</Sub>
        <Pills>
          <Pill at={friendsW} out={tap - 8} tone={C.accent} icon={<PillAvatars />}>Friends studying here</Pill>
          <Pill at={tap + 10} out={confirm + 8} tone={C.free}>Tap a free seat</Pill>
          <Pill at={min - 10} tone={'#b79cf0'}>Held for 15 minutes</Pill>
        </Pills>
      </Col>
      <Device pose={pose}>
        <Stack layers={[{ node: mapView, x: -toSeat * 0, dim: decide }, { node: resView, x: 1 - toRes, z: 5 }]} />
        <SheetLayer t={decide}>
          <div className="grid gap-3 px-4 pt-2 pb-4">
            <h2 className="ui-sheet-title">Reserve seat A-2?</h2>
            <Text c="dimmed">Check in within <b>15 minutes</b> or the seat is released.</Text>
            <div className="ui-button-row mt-2 grid grid-cols-2 gap-3"><Button variant="secondary">Cancel</Button><Button style={{ transform: `scale(${1 - prog(f, confirm + 10, 4) * 0.06 * (1 - prog(f, confirm + 16, 6))})` }}>Reserve seat A-2</Button></div>
          </div>
        </SheetLayer>
        <Tap at={tap + 28} x={194} y={362} />
        <Tap at={confirm - 8} x={195} y={669} />
        <Tap at={confirm + 14} x={286} y={757} />
      </Device>
    </AbsoluteFill>
  );
};
const PillAvatars: React.FC = () => (
  <span style={{ display: 'inline-flex' }}>
    {[people.mara, people.jonas, people.lea].map((p, i) => (
      <span key={p.id} style={{ width: 34, height: 34, borderRadius: 17, marginLeft: i ? -10 : 0, background: C.surface2, border: `2px solid ${C.accent}`, display: 'grid', placeItems: 'center', fontFamily, fontWeight: 700, fontSize: 14, color: C.text }}>{initialsOf(p.name)}</span>
    ))}
  </span>
);

/* ===================================================================== CHECK IN */
export const CheckIn: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const scan = cue('checkin', 'scan'), late = cue('checkin', 'time'), back = cue('checkin', 'else'), check = cue('checkin', 'check'), two = cue('checkin', 'hours');
  const rest = enterPose(f, total, PR, 'right');
  const clock = useFilmClock();
  const tapIn = scan + 2;
  const toScan = glide(f, tapIn + 10, 20);
  const locked = prog(f, check + 4, 8);
  const toSession = glide(f, check + 16, 20);
  const sweep = 0.5 + 0.5 * Math.sin((f - scan) / 14);
  const resEnd = BASE + (-60 + 14.4 * 60) * 1000;      // continues from the previous scene (14:24 left)
  const sessionEnd = BASE + ((check + 16) / 30 + 2 * 3600) * 1000;
  return (
    <AbsoluteFill>
      <Col side="left">
        <Kinetic text="Scan to check in." at={10} size={112} />
        <Sub at={26} size={42}>No scan, no seat. It goes back to the pool.</Sub>
        <Pills>
          <Pill at={scan} out={back} tone={C.accent}>QR code on your table</Pill>
          <Pill at={check} tone={C.free}>2-hour session</Pill>
        </Pills>
      </Col>
      <ExpiringTimer at={late - 4} out={check - 6} f={f} />
      <Device pose={rest}>
        <Stack layers={[
          { node: <ReservationView now={clock} expiresAt={resEnd + (f / 30) * 1000} seat="A-2" space="HG D 3.1" /> },
          { node: <ScanView t={f} sweep={sweep} locked={locked} />, x: 1 - toScan, z: 4 },
          { node: <SessionView now={clock} end={sessionEnd} seat="A-2" space="HG D 3.1" />, x: 1 - toSession, z: 6 },
        ]} />
        <Tap at={tapIn} x={195} y={688} />
      </Device>
    </AbsoluteFill>
  );
};

/** A floating copy of the app's timer card running out: the seat is released. */
const ExpiringTimer: React.FC<{ at: number; out: number; f: number }> = ({ at, out, f }) => {
  const p = prog(f, at, 16, easeOut) * (1 - prog(f, out, 12, easeIn));
  const left = Math.max(0, 6 - (f - at) / 30 * 2.2);
  const gone = left <= 0;
  const now = BASE;
  return (
    <div style={{ position: 'absolute', left: 150, bottom: 120, width: 560, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${1 + (gone ? 0 : 0)})` }}>
      <AppProviders>
        <div className="promo-app" style={{ zoom: 1.35 }}>
          {gone ? (
            <Card component="section" className={stripeClass.free}>
              <div className="flex items-center justify-between gap-2"><MTitle order={2} className="text-heading">Seat A-2</MTitle><SeatChip state="free" /></div>
              <Text c="dimmed" className="flex items-center gap-2"><Icon name="pin" size="sm" /> Back in the pool</Text>
            </Card>
          ) : (
            <TimerCard label="Check in within" expiresAt={now + left * 1000} now={now} total={15 * 60}><Text size="sm" c="dimmed">If the time runs out, the seat is released.</Text></TimerCard>
          )}
        </div>
      </AppProviders>
    </div>
  );
};

/* ===================================================================== BREAK */
export const Break: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const coffee = cue('break', 'coffee'), brk = cue('break', 'break'), held = cue('break', 'stays');
  const rest = enterPose(f, total, PL, 'left');
  const clock = useFilmClock();
  const sheet = glide(f, coffee + 8, 16) * (1 - prog(f, brk + 14, 12, easeIn));
  const onBreak = f > brk + 18;
  const focus = prog(f, held - 6, 28);
  const pose = mix(rest, { ...focusPose({ x: 195, y: 330 }, { x: PL.x + 30, y: PL.y - 30 }, 1.22, { ry: 4, rx: 1 }), opacity: rest.opacity }, focus * (1 - prog(f, total - 22, 14)));
  const sessionEnd = BASE + (2 * 3600 - 130) * 1000 + (f / 30) * 0;
  return (
    <AbsoluteFill>
      <Col side="right">
        <Kinetic text="Step away." at={10} size={112} />
        <Sub at={26} size={42}>Take a break. Your seat waits for you.</Sub>
        <Pills><Pill at={held} tone={'#d3b177'} icon={<Icon name="coffee" />}>Seat held while you're gone</Pill></Pills>
      </Col>
      <Device pose={pose}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <SessionView now={clock} end={sessionEnd} seat="A-2" space="HG D 3.1" onBreak={onBreak} breakEnd={clock + 15 * 60 * 1000 - (f / 30) * 1000} breakButton={prog(f, coffee + 4, 4) * (1 - prog(f, coffee + 10, 6))} />
          <SheetLayer t={sheet}>
            <div className="grid gap-3 px-4 pt-2 pb-4">
              <h2 className="ui-sheet-title">Take a break?</h2>
              <Text c="dimmed">Your seat stays reserved for you. Scan the QR code when you are back.</Text>
              <div className="ui-button-row mt-2 grid grid-cols-2 gap-3"><Button variant="secondary">Not now</Button><Button>Take a break</Button></div>
            </div>
          </SheetLayer>
        </div>
        <Tap at={coffee + 2} x={105} y={748} />
        <Tap at={brk + 4} x={289} y={757} />
      </Device>
    </AbsoluteFill>
  );
};

/* ===================================================================== FAIR */
export const Fair: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const twenty = cue('fair', 'twenty'), ten = cue('fair', 'ten'), grab = cue('fair', 'grab'), sits = cue('fair', 'sits');
  const rest = enterPose(f, total, PL, 'left', -7);
  // the session clock fast-forwards: minutes elapsed in a 120 minute session
  const mins = range(f, 14, twenty - 4, 0, 100, (t) => t * t * (3 - 2 * t)) + range(f, twenty + 20, ten + 4, 0, 10) + range(f, ten + 22, sits + 10, 0, 10);
  const m = Math.min(120, mins);
  const alert = m >= 110 ? 'others' : m >= 100 ? 'priority' : null;
  const now = BASE, end = BASE + (120 - m) * 60 * 1000;
  const X0 = 1000, BAR = 760;
  const px = (min: number) => X0 + (min / 120) * BAR;
  const barIn = prog(f, 8, 20, easeOut);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 940, top: 150, width: 880 }}><Kinetic text="Fair for everyone." at={8} size={104} gap={5} /></div>
      {/* timeline */}
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: barIn }}>
        <div style={{ position: 'absolute', left: X0, top: 520, width: BAR, height: 70, borderRadius: 18, background: C.surface2 }} />
        <div style={{ position: 'absolute', left: X0, top: 520, width: (m / 120) * BAR, height: 70, borderRadius: 18, background: C.accent }} />
        <Band from={100} to={110} at={twenty - 6} f={f} px={px} color="#d3b177" label="Extend" sub="Opens 20 min before the end" y={640} />
        <Band from={110} to={120} at={ten - 6} f={f} px={px} color={C.free} label="Open to everyone" sub="The last 10 minutes" y={440} up />
        <div style={{ position: 'absolute', left: px(m) - 3, top: 496, width: 6, height: 118, borderRadius: 3, background: '#fff', boxShadow: '0 0 24px rgba(255,255,255,.7)' }} />
        <div style={{ position: 'absolute', left: X0, top: 612, fontFamily, fontSize: 28, color: C.muted, display: 'none' }} />
        <div style={{ position: 'absolute', left: X0, top: 600, fontFamily, fontSize: 28, color: C.muted, transform: 'translateY(-72px)' }} />
        <div style={{ position: 'absolute', left: X0, top: 800, fontFamily, fontSize: 28, color: C.muted, display: 'none' }} />
        <div style={{ position: 'absolute', left: X0, top: 446, fontFamily, fontSize: 28, color: C.muted, display: 'none' }} />
      </div>
      <div style={{ position: 'absolute', left: X0, top: 864, width: BAR, display: 'flex', justifyContent: 'space-between', fontFamily, fontSize: 28, color: C.muted, opacity: barIn }}><span>Check in</span><span>2:00:00</span></div>
      <Device pose={rest}>
        <SessionView now={now} end={end} seat="A-2" space="HG D 3.1" alert={alert} />
      </Device>
      <div style={{ display: 'none' }}>{grab}</div>
    </AbsoluteFill>
  );
};

const Band: React.FC<{ from: number; to: number; at: number; f: number; px: (m: number) => number; color: string; label: string; sub: string; y: number; up?: boolean }> = ({ from, to, at, f, px, color, label, sub, y, up }) => {
  const p = prog(f, at, 18, easeOut);
  return (
    <>
      <div style={{ position: 'absolute', left: px(from), top: 520, width: (px(to) - px(from)) * p, height: 70, borderRadius: 18, background: color, opacity: 0.95 }} />
      <div style={{ position: 'absolute', left: px(to) - 560, top: up ? 410 : 640, width: 560, textAlign: 'right', opacity: p, transform: `translateY(${(up ? -1 : 1) * (1 - p) * 18}px)`, fontFamily }}>
        <div style={{ fontSize: 44, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: 30, color: C.muted, marginTop: 4 }}>{sub}</div>
      </div>
    </>
  );
};

export const productCues = () => {
  const find = sceneOf('find'), seat = sceneOf('seat'), ci = sceneOf('checkin'), br = sceneOf('break'), fair = sceneOf('fair');
  return [
    { name: 'whoosh', frame: find.from + 2, len: 1.2, volume: 0.5 },
    { name: 'tap', frame: find.from + cue('find', 'search') + 6, len: 0.5, volume: 0.5 },
    { name: 'key', frame: find.from + cue('find', 'typos') - 14 + 5, len: 0.5, volume: 0.25 },
    { name: 'key', frame: find.from + cue('find', 'typos') - 14 + 15, len: 0.5, volume: 0.25 },
    { name: 'key', frame: find.from + cue('find', 'typos') - 14 + 25, len: 0.5, volume: 0.25 },
    { name: 'pop', frame: find.from + cue('find', 'free'), len: 0.5, volume: 0.5 },
    { name: 'whoosh', frame: seat.from + 2, len: 1.2, volume: 0.5 },
    { name: 'pop', frame: seat.from + cue('seat', 'friends'), len: 0.5, volume: 0.45 },
    { name: 'swish', frame: seat.from + cue('seat', 'tap') + 2, len: 0.8, volume: 0.45 },
    { name: 'tap', frame: seat.from + cue('seat', 'tap') + 28, len: 0.5, volume: 0.55 },
    { name: 'swish', frame: seat.from + cue('seat', 'confirm') - 4, len: 0.8, volume: 0.4 },
    { name: 'tap', frame: seat.from + cue('seat', 'confirm') + 14, len: 0.5, volume: 0.55 },
    { name: 'chime', frame: seat.from + cue('seat', 'confirm') + 32, len: 1.4, volume: 0.5 },
    { name: 'whoosh', frame: ci.from + 2, len: 1.2, volume: 0.5 },
    { name: 'tap', frame: ci.from + cue('checkin', 'scan') + 2, len: 0.5, volume: 0.55 },
    { name: 'swish', frame: ci.from + cue('checkin', 'time') - 4, len: 0.8, volume: 0.4 },
    { name: 'scan', frame: ci.from + cue('checkin', 'check') + 4, len: 0.7, volume: 0.6 },
    { name: 'chime', frame: ci.from + cue('checkin', 'check') + 16, len: 1.4, volume: 0.45 },
    { name: 'whoosh', frame: br.from + 2, len: 1.2, volume: 0.5 },
    { name: 'tap', frame: br.from + cue('break', 'coffee') + 2, len: 0.5, volume: 0.5 },
    { name: 'tap', frame: br.from + cue('break', 'break') + 4, len: 0.5, volume: 0.5 },
    { name: 'pop', frame: br.from + cue('break', 'break') + 18, len: 0.5, volume: 0.5 },
    { name: 'whoosh', frame: fair.from + 2, len: 1.2, volume: 0.5 },
    { name: 'ping', frame: fair.from + cue('fair', 'twenty'), len: 1.2, volume: 0.45 },
    { name: 'ping', frame: fair.from + cue('fair', 'ten'), len: 1.2, volume: 0.45 },
    { name: 'pop', frame: fair.from + cue('fair', 'sits'), len: 0.5, volume: 0.45 },
  ];
};
