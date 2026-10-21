import { useCurrentFrame } from 'remotion';
import { FPS } from '../tokens';

/** The app's countdowns read a clock; in the film it is the frame, so every render is the same. */
export const BASE = Date.UTC(2026, 9, 21, 9, 0, 0);
export function useFilmClock(startFrame = 0) {
  const f = useCurrentFrame();
  return BASE + ((f - startFrame) / FPS) * 1000;
}
