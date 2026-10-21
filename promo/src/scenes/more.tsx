import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { Button, Card, Notification, Text, Title as MTitle } from '@mantine/core';
import { Device, focusPose, Stack, type Pose } from '../app/Device';
import { Tap } from '../app/fx';
import { AppProviders } from '../app/Providers';
import { seatId, seatsFor, heroStates, initialsOf, people } from '../app/fixtures';
import { C, easeIn, easeOut } from '../tokens';
import { cue, sceneOf } from '../timeline';
import { glide, lerp, pop, prog, range } from '../motion';
import { Kinetic, Pill, Sub, Wordmark, fontFamily } from '../stage';
import { PL, PR, TEXT_LEFT, TEXT_RIGHT } from '../layout';
import { FloorStack, FLOORS } from '../views/FloorStack';
import { FriendsView, NewPartyView, ProfileView } from '../views/social';
import { HomeView, SeatHeader } from '../views/screens';
import { ActionBar, Header, Screen } from '../views/chrome';
import { SeatMapView } from '../views/SeatMapView';
import { Icon } from '../../../frontend/src/components/Icon';
import { AvailabilityLabel } from '../../../frontend/src/components/AvailabilityLabel';
import { describeEvent } from '../../../frontend/src/domain/serverEvents';

const Col: React.FC<{ side: 'left' | 'right'; children: React.ReactNode }> = ({ side, children }) => {
  const box = side === 'left' ? TEXT_LEFT : TEXT_RIGHT;
  return <div style={{ position: 'absolute', left: box.left, width: box.width, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>{children}</div>;
};
const Pills: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', marginTop: 8 }}>{children}</div>;
const enterPose = (f: number, total: number, base: { x: number; y: number }, from: 'left' | 'right', ry = -9): Pose => {
  const inn = glide(f, 0, 36), out = prog(f, total - 14, 14, easeIn); const dir = from === 'right' ? 1 : -1;
  return { x: base.x + dir * 300 * (1 - inn) + dir * 160 * out, y: base.y + 150 * (1 - inn) + Math.sin(f / 46) * 5, scale: 0.92 + 0.16 * inn - 0.04 * out, ry: (from === 'right' ? ry : -ry) * (0.4 + 0.6 * inn) + dir * -24 * (1 - inn), rx: 3 + Math.sin(f / 60) * 0.8, rz: 0, opacity: Math.min(1, inn * 2.4) * (1 - out) };
};
const mix = (a: Pose, b: Pose, t: number): Pose => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t), rx: lerp(a.rx ?? 0, b.rx ?? 0, t), ry: lerp(a.ry ?? 0, b.ry ?? 0, t), rz: lerp(a.rz ?? 0, b.rz ?? 0, t), opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t) });

/* ===================================================================== MAP */
export const CampusMap: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const stacks = cue('map', 'stacks'), flo = cue('map', 'floor'), lights = cue('map', 'lights'), book = cue('map', 'book');
  const flat = glide(f, 6, 24);
  const tilt = glide(f, stacks - 22, 44);
  const out = prog(f, total - 14, 14, easeIn);
  const gap = tilt * 120;
  const rx = tilt * 58, rz = tilt * -36 + Math.sin(f / 70) * 2 + (f / total) * -6;
  const scale = lerp(0.5, 0.4, tilt);
  const active = range(f, flo - 6, flo + 50, 6, 3) + range(f, lights + 4, lights + 40, 0, -2);
  const lit = prog(f, lights, 24, easeOut);
  const card = glide(f, book - 4, 22) * (1 - out);
  const floors = [...FLOORS].reverse();
  const sel = Math.round(active);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Col side="left">
        <Kinetic text="See the campus." at={8} size={100} />
        <Sub at={24} size={42}>Every floor stacked in 3D. Bookable rooms light up.</Sub>
      </Col>
      <div style={{ position: 'absolute', left: 1290 - 750, top: 650 - 832, width: 1500, height: 1665, perspective: 4600, opacity: flat }}>
        <FloorStack gap={gap} rx={rx} rz={rz} scale={scale} active={active} lights={lit} labelIn={tilt} />
      </div>
      {/* the app's floor wheel */}
      <div style={{ position: 'absolute', right: 70, top: 340, opacity: tilt, transform: `translateX(${(1 - tilt) * 60}px) scale(1.5)`, transformOrigin: 'right center' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, borderRadius: 16, padding: '6px 4px', width: 60, fontFamily, color: C.text, boxShadow: '0 14px 34px rgba(0,0,0,.45)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textAlign: 'center', color: C.muted, padding: '4px 0 6px', textTransform: 'uppercase' }}>Floor</div>
          {floors.map((fl, i) => {
            const on = FLOORS.length - 1 - i === sel;
            return <div key={fl.letter} style={{ height: 40, display: 'grid', placeItems: 'center', margin: '2px 0', borderRadius: 10, fontWeight: 700, fontSize: 18, background: on ? C.accent : 'transparent', color: on ? C.onAccent : C.text, opacity: on ? 1 : 0.7 }}>{fl.letter}</div>;
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 130, bottom: 110, width: 640, opacity: card, transform: `translateY(${(1 - card) * 50}px)` }}>
        <AppProviders>
          <div className="promo-app" style={{ zoom: 1.5 }}>
            <Card component="article" className="grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_auto] gap-2">
              <div className="flex items-center justify-between gap-2">
                <MTitle order={2}>HG D 3.1</MTitle>
                <div className="flex gap-1"><Icon name="star" filled /></div>
              </div>
              <AvailabilityLabel availability="high">14 free</AvailabilityLabel>
              <Button fullWidth>Open study space</Button>
            </Card>
          </div>
        </AppProviders>
      </div>
    </AbsoluteFill>
  );
};

/* ===================================================================== FRIENDS */
const partyStates = heroStates.map((s, i) => (i >= 8 && i <= 11 ? ('free' as const) : s));
const partySeats = seatsFor(partyStates);
export const Friends: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const fr = cue('friends', 'friends'), party = cue('friends', 'party'), person = cue('friends', 'person'), books = cue('friends', 'books'), seatsW = cue('friends', 'seats'), every = cue('friends', 'everyone'), racing = cue('friends', 'racing');
  const start = fr + 12, tick = party + 2, create = books - 8;
  const rest = enterPose(f, total, PR, 'right');
  const toNew = glide(f, start + 6, 20);
  const toSeats = glide(f, create + 8, 22);
  const name = 'Finals crew';
  const nTyped = Math.max(0, Math.min(name.length, Math.floor((f - (start + 28)) / 3)));
  const picked = [people.mara, people.jonas, people.lea].filter((_, i) => f > tick + 6 + i * 9).map((p) => p.id);
  const order = [people.you, people.mara, people.jonas, people.lea];
  const assigned = order.filter((_, i) => f > seatsW + 14 + i * 9).length;
  const seatPeople = Object.fromEntries(order.slice(0, assigned).map((p, i) => [seatId(8 + i), { initials: initialsOf(p.name), name: p.name }]));
  const states = partyStates.map((s, i) => (i >= 8 && i < 8 + assigned ? ('yours' as const) : s));
  const cam = { x: 160, y: 300, k: lerp(0.7, 1.35, glide(f, create + 12, 30)) };
  const pose = rest;
  const mapView = (
    <Screen nav={false}>
      <Header title="Finals crew" subtitle={<p className="text-small text-text-muted">HG D 3.1 · {assigned} of 4 seats picked</p>} />
      <div className="relative min-h-0 flex-1"><SeatMapView seats={seatsFor(states)} people={seatPeople} cam={cam} width={390} height={610} chooseFree={false} selected={null} /></div>
      <ActionBar><Button fullWidth disabled={assigned < 4}>Book 4 seats</Button></ActionBar>
    </Screen>
  );
  return (
    <AbsoluteFill>
      <Col side="left">
        <Kinetic text="Study together." at={8} size={112} />
        <Sub at={24} size={42}>One person books seats for the whole party.</Sub>
        <Pills>
          <Pill at={start} out={books} tone={C.accent}>Start a study party</Pill>
          <Pill at={tick} out={books} tone={C.accent}>Invite your friends</Pill>
          <Pill at={seatsW} tone={C.free}>Everyone gets a seat</Pill>
          <Pill at={racing} tone={C.accent}>No racing to register</Pill>
        </Pills>
      </Col>
      <Device pose={pose}>
        <Stack layers={[
          { node: <FriendsView press={prog(f, start + 2, 4) * (1 - prog(f, start + 8, 6))} /> },
          { node: <NewPartyView name={name.slice(0, nTyped)} picked={picked} press={prog(f, create + 2, 4) * (1 - prog(f, create + 8, 6))} />, x: 1 - toNew, z: 4 },
          { node: mapView, x: 1 - toSeats, z: 6 },
        ]} />
        <Tap at={start} x={195} y={679} />
        <Tap at={tick + 4} x={342} y={294} />
        <Tap at={tick + 13} x={342} y={355} />
        <Tap at={tick + 22} x={342} y={417} />
        <Tap at={create} x={195} y={745} />
      </Device>
      <div style={{ display: 'none' }}>{every}</div>
    </AbsoluteFill>
  );
};

/* ===================================================================== LIVE */
const EVENTS = [
  { type: 'friend_request.accepted', person: { id: 'n', name: 'Noah Meier', photo_url: null } },
  { type: 'party.replied', accepted: true, person: { id: 'm', name: 'Mara Keller', photo_url: null }, party_id: 'p', party_name: 'Finals crew' },
  { type: 'party.booked', party_id: 'p', party_name: 'Finals crew' },
] as const;
export const Live: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const rest = enterPose(f, total, PR, 'right');
  const at = [cue('live', 'accepts'), cue('live', 'joins'), cue('live', 'booked')].map((c) => c - 4);
  const bannerEl = (i: number) => {
    const n = describeEvent(EVENTS[i] as never)!;
    const t = glide(f, at[i], 20);
    return (
      <div key={i} style={{ opacity: Math.min(1, t * 2), transform: `translateY(${(1 - t) * -90}px)` }}>
        <Notification icon={<Icon name={n.icon} />} title={n.title} withCloseButton={false}>{n.message}</Notification>
      </div>
    );
  };
  const push = glide(f, at[0] - 6, 30);
  const pose = mix(rest, { ...focusPose({ x: 195, y: 190 }, { x: PR.x, y: PR.y + 40 }, 1.35, { ry: -5, rx: 2 }), opacity: rest.opacity }, push * (1 - prog(f, total - 22, 14)));
  return (
    <AbsoluteFill>
      <Col side="left">
        <Kinetic text="Always live." at={8} size={112} />
        <Sub at={24} size={42}>Friends, parties, bookings. The moment they happen.</Sub>
        <Pills>
          <Pill at={at[0]} tone={C.accent} icon={<Icon name="userCheck" />}>Friend request accepted</Pill>
          <Pill at={at[1]} tone={C.accent} icon={<Icon name="userCheck" />}>Friend joined your party</Pill>
          <Pill at={at[2]} tone={C.free} icon={<Icon name="calendarCheck" />}>Seats booked</Pill>
        </Pills>
      </Col>
      <Device pose={pose}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <HomeView search="" />
          <div className="absolute inset-x-2 top-14 z-30 grid gap-2">{[0, 1, 2].map(bannerEl)}</div>
        </div>
      </Device>
    </AbsoluteFill>
  );
};

/* ===================================================================== INSTALL */
const IconTile: React.FC<{ hue: number; size?: number }> = ({ hue, size = 74 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.23, background: `linear-gradient(145deg, hsl(${hue} 22% 34%), hsl(${hue} 24% 20%))`, boxShadow: '0 6px 14px rgba(0,0,0,.35)' }} />
);
const PwaHome: React.FC<{ drop: number }> = ({ drop }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #26324a 0%, #151a26 55%, #0e1219 100%)', padding: '34px 20px 0' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 26, justifyItems: 'center' }}>
      {Array.from({ length: 20 }, (_, i) => (i === 6
        ? <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 6, transform: `scale(${0.3 + 0.7 * drop}) translateY(${(1 - drop) * -40}px)`, opacity: drop }}>
            <div style={{ width: 74, height: 74, borderRadius: 17, overflow: 'hidden', boxShadow: `0 0 0 ${3 * drop}px rgba(109,157,224,.9), 0 10px 22px rgba(0,0,0,.45)` }}><Img src={staticFile('icons/icon-192.png')} style={{ width: 74, height: 74 }} /></div>
            <span style={{ fontFamily, fontSize: 12.5, color: '#fff', fontWeight: 500 }}>Study Spaces</span>
          </div>
        : <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}><IconTile hue={[210, 160, 30, 280, 340, 190][i % 6]} /><span style={{ width: 46, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.22)' }} /></div>))}
    </div>
  </div>
);
export const Install: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const dark = cue('install', 'dark'), light = cue('install', 'light'), inst = cue('install', 'install'), home = cue('install', 'home');
  const rest = enterPose(f, total, PL, 'left');
  const wipe = glide(f, light + 8, 40);
  const toHome = glide(f, inst + 6, 22);
  const drop = pop(f, home + 4);
  return (
    <AbsoluteFill>
      <Col side="right">
        <Kinetic text="Yours, your way." at={8} size={112} />
        <Sub at={24} size={42}>Dark or light. Install it like any app.</Sub>
        <Pills>
          <Pill at={dark} out={light} tone={'#0a0a0a'} icon={<Icon name="moon" />}>Dark theme</Pill>
          <Pill at={light + 2} tone={C.accent} icon={<Icon name="sun" />}>Light theme</Pill>
          <Pill at={inst} tone={C.free} icon={<Icon name="home" />}>Add to your home screen</Pill>
        </Pills>
      </Col>
      <Device pose={rest} reveal={{ x: 340, y: 278, r: wipe * 900 }} clearBar={toHome}>
        {(sch) => (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Stack layers={[{ node: <ProfileView dark={sch === 'dark'} /> }, { node: <div className="relative flex-1" style={{ marginTop: -47, height: 844 }}><PwaHome drop={drop} /></div>, x: 1 - toHome, z: 5 }]} />
            {sch === 'dark' && <Tap at={light + 2} x={340} y={278} />}
          </div>
        )}
      </Device>
    </AbsoluteFill>
  );
};

/* ===================================================================== OUTRO */
export const Outro: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const adm = cue('outro', 'admins'), lay = cue('outro', 'lay'), print = cue('outro', 'print'), watch = cue('outro', 'watch'), built = cue('outro', 'built'), study = cue('outro', 'study', 0), find = cue('outro', 'find');
  const inn = glide(f, 2, 40);
  const toCard = glide(f, built - 6, 26);
  const lap = {
    x: 1270 + (1 - inn) * 200, y: 560 + (1 - inn) * 120 - toCard * 40 + Math.sin(f / 50) * 6, scale: 0.72 + 0.05 * inn + f * 0.00018 - toCard * 0.15,
    ry: -14 * (0.4 + 0.6 * inn) + Math.sin(f / 90) * 2, rx: 6, opacity: Math.min(1, inn * 2) * (1 - toCard),
  };
  const card = glide(f, built + 10, 30);
  const mark = prog(f, find - 20, 24, easeOut);
  const ender = prog(f, find + 26, 20, easeOut);
  const endFade = prog(f, total - 22, 22, easeIn);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - toCard }}>
        <Col side="left">
          <Kinetic text="Run it for your campus." at={8} size={104} gap={5} />
          <Sub at={26} size={42}>An admin dashboard comes with it.</Sub>
          <Pills>
            <Pill at={lay} tone={C.accent}>Room layout editor</Pill>
            <Pill at={print} tone={C.accent}>Printable QR codes</Pill>
            <Pill at={watch} tone={C.free}>Live occupancy</Pill>
          </Pills>
        </Col>
        <div style={{ position: 'absolute', left: lap.x, top: lap.y, opacity: lap.opacity, transform: `translate(-50%, -50%) perspective(2600px) rotateY(${lap.ry}deg) rotateX(${lap.rx}deg) scale(${lap.scale})`, filter: 'drop-shadow(0 60px 80px rgba(0,0,0,.55))' }}>
          <Img src={staticFile('admin.png')} style={{ width: 1500 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: card * (1 - endFade) }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 34, transform: `translateY(${(1 - card) * 40}px)` }}>
          <div style={{ opacity: mark, transform: `scale(${0.9 + 0.1 * mark})` }}><Wordmark size={170} pulse={prog(f, find, 40)} /></div>
          <div style={{ opacity: ender, transform: `translateY(${(1 - ender) * 16}px)`, fontFamily, fontSize: 56, fontWeight: 500, color: C.text }}>Find your seat. Get to work.</div>
          <div style={{ opacity: ender, fontFamily, fontSize: 40, fontWeight: 600, color: C.accent }}>02.hackathon.ethz.ch</div>
          <div style={{ marginTop: 28, opacity: prog(f, built + 20, 20), fontFamily, fontSize: 30, color: C.muted, textAlign: 'center', lineHeight: 1.45 }}>
            Built by The Wurst Team at the ETH Zurich hackathon.<br />A hackathon prototype, not an official ETH product.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const moreCues = () => {
  const m = sceneOf('map'), fr = sceneOf('friends'), lv = sceneOf('live'), ins = sceneOf('install'), o = sceneOf('outro');
  return [
    { name: 'whoosh', frame: m.from + 2, len: 1.2, volume: 0.5 },
    { name: 'riser', frame: m.from + cue('map', 'stacks') - 40, len: 3, volume: 0.4 },
    { name: 'impact', frame: m.from + cue('map', 'stacks'), len: 2, volume: 0.4 },
    { name: 'tick', frame: m.from + cue('map', 'floor') + 8, len: 0.5, volume: 0.4 },
    { name: 'tick', frame: m.from + cue('map', 'floor') + 28, len: 0.5, volume: 0.4 },
    { name: 'pop', frame: m.from + cue('map', 'lights'), len: 0.5, volume: 0.5 },
    { name: 'chime', frame: m.from + cue('map', 'book') - 2, len: 1.4, volume: 0.45 },
    { name: 'whoosh', frame: fr.from + 2, len: 1.2, volume: 0.5 },
    { name: 'tap', frame: fr.from + cue('friends', 'friends') + 12, len: 0.5, volume: 0.5 },
    { name: 'swish', frame: fr.from + cue('friends', 'friends') + 18, len: 0.8, volume: 0.4 },
    { name: 'tap', frame: fr.from + cue('friends', 'party') + 6, len: 0.5, volume: 0.4 },
    { name: 'tap', frame: fr.from + cue('friends', 'party') + 15, len: 0.5, volume: 0.4 },
    { name: 'tap', frame: fr.from + cue('friends', 'party') + 24, len: 0.5, volume: 0.4 },
    { name: 'tap', frame: fr.from + cue('friends', 'books') - 8, len: 0.5, volume: 0.5 },
    { name: 'swish', frame: fr.from + cue('friends', 'books') + 2, len: 0.8, volume: 0.4 },
    { name: 'pop', frame: fr.from + cue('friends', 'seats') + 14, len: 0.5, volume: 0.45 },
    { name: 'pop', frame: fr.from + cue('friends', 'seats') + 23, len: 0.5, volume: 0.45 },
    { name: 'pop', frame: fr.from + cue('friends', 'seats') + 32, len: 0.5, volume: 0.45 },
    { name: 'pop', frame: fr.from + cue('friends', 'seats') + 41, len: 0.5, volume: 0.45 },
    { name: 'chime', frame: fr.from + cue('friends', 'seats') + 52, len: 1.4, volume: 0.45 },
    { name: 'whoosh', frame: lv.from + 2, len: 1.2, volume: 0.5 },
    { name: 'ping', frame: lv.from + cue('live', 'accepts') - 4, len: 1.2, volume: 0.55 },
    { name: 'ping', frame: lv.from + cue('live', 'joins') - 4, len: 1.2, volume: 0.55 },
    { name: 'ping', frame: lv.from + cue('live', 'booked') - 4, len: 1.2, volume: 0.55 },
    { name: 'whoosh', frame: ins.from + 2, len: 1.2, volume: 0.5 },
    { name: 'tap', frame: ins.from + cue('install', 'light') + 2, len: 0.5, volume: 0.5 },
    { name: 'swish', frame: ins.from + cue('install', 'light') + 8, len: 0.8, volume: 0.5 },
    { name: 'swish', frame: ins.from + cue('install', 'install') + 6, len: 0.8, volume: 0.45 },
    { name: 'pop', frame: ins.from + cue('install', 'home') + 4, len: 0.5, volume: 0.6 },
    { name: 'whoosh', frame: o.from + 2, len: 1.2, volume: 0.5 },
    { name: 'swish', frame: o.from + cue('outro', 'lay'), len: 0.8, volume: 0.35 },
    { name: 'swish', frame: o.from + cue('outro', 'print'), len: 0.8, volume: 0.35 },
    { name: 'swish', frame: o.from + cue('outro', 'watch'), len: 0.8, volume: 0.35 },
    { name: 'whoosh', frame: o.from + cue('outro', 'built') - 6, len: 1.2, volume: 0.5 },
    { name: 'impact', frame: o.from + cue('outro', 'find') - 18, len: 2, volume: 0.5 },
    { name: 'chime', frame: o.from + cue('outro', 'find') + 8, len: 1.4, volume: 0.5 },
  ];
};
