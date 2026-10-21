import React from 'react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cssVariablesResolver, theme } from '../../../frontend/src/theme/theme';
import '../app.css';

const qc = new QueryClient();
/** The app's own theme and providers around anything we draw. `scheme` swaps dark/light like the Profile switch does. */
export const AppProviders: React.FC<{ scheme?: 'dark' | 'light'; children: React.ReactNode }> = ({ scheme = 'dark', children }) => (
  <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="dark">
    <QueryClientProvider client={qc}>
      <MemoryRouter><div className={scheme === 'light' ? 'promo-light' : undefined} style={{ display: 'contents' }}>{children}</div></MemoryRouter>
    </QueryClientProvider>
  </MantineProvider>
);
