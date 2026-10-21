import React from 'react';
import { ActionIcon, Title } from '@mantine/core';
import { Icon } from '../../../frontend/src/components/Icon';
import { BottomNavigation } from '../../../frontend/src/components/BottomNavigation';
import { cx } from '../../../frontend/src/components/cx';

/** ScreenHeader without the router hooks: back arrow, title, optional subtitle, requests bell. */
export const Header: React.FC<{ title: string; subtitle?: React.ReactNode; bell?: number }> = ({ title, subtitle, bell = 0 }) => (
  <header className="border-b border-border bg-surface">
    <div className={cx('flex items-center gap-2 pr-2 pl-4', subtitle ? 'min-h-14 py-1' : 'min-h-16')}>
      <ActionIcon aria-label="Back"><Icon name="back" /></ActionIcon>
      <div className="min-w-0 flex-1">
        <Title order={1} className="truncate text-title font-bold">{title}</Title>
        {subtitle}
      </div>
      <Bell count={bell} />
    </div>
  </header>
);

export const Bell: React.FC<{ count?: number }> = ({ count = 0 }) => (
  <ActionIcon className="relative" aria-label="Requests">
    <Icon name="bell" />
    {count > 0 && (
      <span className="absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-label leading-none font-bold text-on-accent ring-2 ring-surface">{count}</span>
    )}
  </ActionIcon>
);

/** The app's bottom navigation, in the router's memory, with a given tab current. */
export const Nav: React.FC = () => <BottomNavigation />;

/** Phone screen frame: full height column with the nav at the bottom. */
export const Screen: React.FC<{ children: React.ReactNode; nav?: boolean }> = ({ children, nav = true }) => (
  <div className="relative flex min-h-0 flex-1 flex-col bg-bg">
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    {nav && <Nav />}
    <div className={nav ? 'h-[22px] flex-none bg-surface' : 'h-[22px] flex-none bg-bg'} />
  </div>
);

export const ActionBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid gap-2 border-t border-border bg-bg px-4 pt-3 pb-3">{children}</div>
);

/** A bottom sheet drawn where the decision sheet would be, slid in by `t` (0 hidden, 1 open) with its dim layer. */
export const SheetLayer: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <>
    <div className="ui-sheet-overlay absolute inset-0 z-40" style={{ opacity: t }} />
    <div className="absolute inset-x-0 bottom-0 z-41" style={{ transform: `translateY(${(1 - t) * 105}%)` }}>
      <div className="ui-sheet-content relative max-h-none!">
        <div className="grid justify-center py-2 before:h-1 before:w-10 before:rounded-full before:bg-border-strong before:content-['']" />
        <ActionIcon className="absolute top-2 right-2" aria-label="Close"><Icon name="close" /></ActionIcon>
        {children}
      </div>
    </div>
  </>
);

/** Scrolling content of a screen: 16px gutter, 16px between blocks. */
export const ScreenMain: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <main className={cx('flex flex-1 flex-col gap-4 px-4 py-4', className)}>{children}</main>
);
