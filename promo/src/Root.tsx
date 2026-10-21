import React from 'react';
import { Composition } from 'remotion';
import { Promo, totalFrames } from './Promo';
import { FPS, H, W } from './tokens';

export const Root: React.FC = () => (
  <Composition id="Promo" component={Promo} durationInFrames={totalFrames} fps={FPS} width={W} height={H} defaultProps={{ voice: true }} />
);
