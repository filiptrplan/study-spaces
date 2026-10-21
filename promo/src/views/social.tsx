import React from 'react';
import { ActionIcon, Avatar, Button, Card, Checkbox, Switch, Text, TextInput } from '@mantine/core';
import { Icon } from '../../../frontend/src/components/Icon';
import { SectionLabel } from '../../../frontend/src/components/SectionLabel';
import { PeopleList, PersonAvatar, PersonRow } from '../../../frontend/src/features/social/SocialParts';
import { ActionBar, Header, Screen, ScreenMain } from './chrome';
import { people } from '../app/fixtures';

type P = typeof people.mara;
const studying = [
  { p: people.jonas, where: 'HG D 3.1 · seat A-3' },
  { p: people.lea, where: 'HG D 3.1 · seat A-4' },
  { p: people.mara, where: 'HG D 3.1 · seat A-1' },
];

export const FriendsView: React.FC<{ press?: number }> = ({ press = 0 }) => (
  <Screen>
    <Header title="Friends" />
    <ScreenMain>
      <TextInput type="search" placeholder="Search friends or add people" aria-label="Search friends or add people" leftSection={<Icon name="search" />} value="" onChange={() => {}} />
      <div className="-mb-2 flex min-h-11 items-center justify-between gap-2">
        <SectionLabel>Studying now</SectionLabel>
        <Button variant="quiet">Edit</Button>
      </div>
      <PeopleList label="Studying now">
        <PersonRow person={people.you} name="You" detail="Sharing your room"><div className="flex-none"><Switch aria-label="Share my room with friends" checked onChange={() => {}} /></div></PersonRow>
        {studying.map(({ p, where }) => <PersonRow key={p.id} person={p} detail={where} pinned studying="here" to="/seats/x" />)}
      </PeopleList>
      <SectionLabel>Others</SectionLabel>
      <PeopleList label="Others"><PersonRow person={people.noah} /></PeopleList>
    </ScreenMain>
    <ActionBar>
      <Button fullWidth leftSection={<Icon name="plus" />} style={{ transform: `scale(${1 - press * 0.04})` }}>Start a study party</Button>
    </ActionBar>
  </Screen>
);

export const NewPartyView: React.FC<{ name: string; picked: string[]; press?: number }> = ({ name, picked, press = 0 }) => (
  <Screen nav={false}>
    <Header title="New study party" />
    <ScreenMain>
      <TextInput label={<>Group name<span className="font-normal text-text-muted">Required</span></>} labelProps={{ className: 'flex w-full justify-between' }} withAsterisk={false} placeholder="e.g. Exam prep" value={name} onChange={() => {}} />
      <SectionLabel>Invite{picked.length ? ` · ${picked.length}` : ''}</SectionLabel>
      <TextInput type="search" placeholder="Search people" aria-label="Search people" leftSection={<Icon name="search" />} value="" onChange={() => {}} />
      <PeopleList label="Invite people">
        {[people.mara, people.jonas, people.lea, people.noah].map((p) => (
          <li key={p.id}>
            <label className="flex min-h-15 items-center gap-3 py-2 pr-4 pl-4">
              <PersonAvatar person={p} />
              <Text className="min-w-0 flex-1 font-medium wrap-anywhere">{p.name}</Text>
              <Checkbox aria-label={`Invite ${p.name}`} checked={picked.includes(p.id)} onChange={() => {}} />
            </label>
          </li>
        ))}
      </PeopleList>
    </ScreenMain>
    <ActionBar>
      <Button fullWidth style={{ transform: `scale(${1 - press * 0.04})` }}>{!name ? 'Name your party' : picked.length ? `Create and invite ${picked.length}` : 'Create study party'}</Button>
    </ActionBar>
  </Screen>
);

export const ProfileView: React.FC<{ dark: boolean }> = ({ dark }) => (
  <Screen>
    <Header title="Profile" />
    <ScreenMain>
      <Card component="section" aria-label="Your account">
        <div className="flex items-start gap-3">
          <Avatar size="lg" className="shrink-0">F</Avatar>
          <div className="grid min-w-0 flex-1 gap-1">
            <Text className="text-title font-semibold wrap-anywhere">Filip</Text>
            <Text size="sm" c="dimmed" className="break-all">filip@student.ethz.ch</Text>
          </div>
          <ActionIcon aria-label="Edit" className="shrink-0"><Icon name="edit" /></ActionIcon>
        </div>
      </Card>
      <SectionLabel>Appearance</SectionLabel>
      <Card component="section" aria-label="Appearance settings"><Switch label="Dark theme" checked={dark} onChange={() => {}} /></Card>
    </ScreenMain>
  </Screen>
);
export type { P };
