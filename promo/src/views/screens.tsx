import React from 'react';
import { Button, Card, Text, TextInput, Title, Alert, Checkbox, Switch, Avatar, Notification } from '@mantine/core';
import { AppName } from '../../../frontend/src/components/AppName';
import { Icon } from '../../../frontend/src/components/Icon';
import { SpaceLists } from '../../../frontend/src/components/SpaceLists';
import { SeatChip } from '../../../frontend/src/components/SeatChip';
import { TimerCard } from '../../../frontend/src/components/TimerCard';
import { SeatSheet } from '../../../frontend/src/components/seat-map/SeatSheet';
import { stripeClass } from '../../../frontend/src/domain/seat';
import { filterSpaces, type StudySpace } from '../../../frontend/src/domain/space';
import { PersonAvatar } from '../../../frontend/src/features/social/SocialParts';
import { friendWhere } from '../../../frontend/src/features/social/studying';
import { rows as homeRows, spaces } from '../app/fixtures';
import { ActionBar, Bell, Header, Screen, ScreenMain } from './chrome';
import { SectionLabel } from '../../../frontend/src/components/SectionLabel';


/* ---------------------------------------------------------------- Home */
export const HomeView: React.FC<{ search: string; rowsIn?: number; scrollX?: number }> = ({ search, scrollX = 0 }) => {
  const matches = filterSpaces(spaces, search);
  return (
    <Screen>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <Title order={1}><AppName /></Title>
          <Bell count={1} />
        </div>
        <div className="-mx-4 -mt-4 -mb-2 bg-bg px-4 pt-4 pb-2">
          <TextInput type="search" placeholder="Search study spaces" aria-label="Search study spaces" leftSection={<Icon name="search" />} value={search} onChange={() => {}} />
        </div>
        <div className="-mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4" style={{ ['--sx' as string]: `${scrollX}px` }}>
          <SpaceLists fit matches={matches} search={search} rows={homeRows()} onToggleFavourite={() => {}} />
        </div>
      </div>
    </Screen>
  );
};

/* ---------------------------------------------------------------- Seat map screen */
export const SeatHeader: React.FC<{ name: string; free: number; total: number; friendsHere: number }> = ({ name, free, total, friendsHere }) => (
  <Header title={name} bell={0} subtitle={
    <p className="flex items-center gap-2 text-small text-text-muted before:size-2.5 before:rounded-full before:bg-avail-high before:content-['']">
      <span>{free} free of {total} seats · {friendsHere} friends here</span>
    </p>
  } />
);

export const SeatSheetView: React.FC<{ t: number; seat: string; detail: string; action: string }> = ({ t, seat, detail, action }) => (
  <div className="absolute inset-x-0 bottom-0 z-30" style={{ transform: `translateY(${(1 - t) * 105}%)`, opacity: Math.min(1, t * 3) }}>
    <SeatSheet title={`Seat ${seat}`} state="free" detail={detail} actionLabel={action} onAction={() => {}} onClose={() => {}} />
  </div>
);

/* ---------------------------------------------------------------- Reservation */
export const ReservationView: React.FC<{ now: number; expiresAt: number; seat: string; space: string }> = ({ now, expiresAt, seat, space }) => (
  <Screen nav={false}>
    <Header title="Your reservation" />
    <ScreenMain>
      <Card component="section" className={stripeClass.reserved}>
        <div className="flex items-center justify-between gap-2">
          <Title order={2} className="text-heading">Seat {seat}</Title>
          <SeatChip state="reserved" plain />
        </div>
        <Text c="dimmed" className="flex items-center gap-2"><Icon name="pin" size="sm" /> {space}</Text>
      </Card>
      <TimerCard label="Check in within" expiresAt={expiresAt} now={now} total={15 * 60}>
        <Text size="sm" c="dimmed">Scan the QR code on your table when you arrive. If the time runs out, the seat is released for others.</Text>
      </TimerCard>
    </ScreenMain>
    <ActionBar>
      <Button fullWidth leftSection={<Icon name="qr" />}>Check in</Button>
      <Button variant="secondary" fullWidth>Cancel reservation</Button>
    </ActionBar>
  </Screen>
);

/* ---------------------------------------------------------------- Session */
export const SessionView: React.FC<{
  now: number; end: number; seat: string; space: string; onBreak?: boolean; breakEnd?: number; total?: number;
  alert?: 'priority' | 'others' | null; breakButton?: number;
}> = ({ now, end, seat, space, onBreak = false, breakEnd = 0, total = 2 * 3600, alert = null, breakButton = 0 }) => (
  <Screen nav={false}>
    <Header title="Your session" />
    <ScreenMain>
      {alert === 'priority' && (
        <Alert icon={<Icon name="clock" />} title="Priority extension">
          <Text size="sm" c="dimmed">Only you can extend for the next 10 minutes.</Text>
          <div className="mt-2"><Button>Extend session</Button></div>
        </Alert>
      )}
      {alert === 'others' && (
        <Alert variant="warning" icon={<Icon name="alert" />} title="Others can reserve this seat now">
          <Text size="sm" c="dimmed">Extend before someone books it. If they do, you'll have to leave when your time is up.</Text>
          <div className="mt-2"><Button>Extend session</Button></div>
        </Alert>
      )}
      <Card component="section" className={onBreak ? stripeClass.break : stripeClass.yours}>
        <div className="flex items-center justify-between gap-2">
          <Title order={2} className="text-heading">Seat {seat}</Title>
          {onBreak ? <SeatChip state="break" /> : <SeatChip state="yours" plain>In session</SeatChip>}
        </div>
        <Text c="dimmed" className="flex items-center gap-2"><Icon name="pin" size="sm" /> {space}</Text>
      </Card>
      {onBreak && (
        <TimerCard label="Break ends in" expiresAt={breakEnd} now={now} total={15 * 60} stripe="break">
          <Text size="sm" c="dimmed">Your seat is held for you. Your session time keeps running.</Text>
          <Button fullWidth leftSection={<Icon name="qr" />}>Back at my seat</Button>
        </TimerCard>
      )}
      <TimerCard label="Session time left" expiresAt={end} now={now} total={total}>
        <Text size="sm" c="dimmed">Ends at 11:00 AM.</Text>
      </TimerCard>
    </ScreenMain>
    <ActionBar>
      {onBreak ? (
        <Button variant="danger" fullWidth>End session</Button>
      ) : (
        <div className="ui-button-row flex gap-2">
          <Button variant="secondary" className="flex-1" leftSection={<Icon name="coffee" />} style={{ transform: `scale(${1 - breakButton * 0.05})` }}>Take a break</Button>
          <Button variant="danger" className="flex-1">End session</Button>
        </div>
      )}
    </ActionBar>
  </Screen>
);

export { SectionLabel, Notification, Avatar, Switch, Checkbox, PersonAvatar, friendWhere };
export type { StudySpace };
