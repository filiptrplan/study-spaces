import { interpolate, spring } from 'remotion';
import { FPS, ease, easeOut, easeIn } from './tokens';

/** 0 -> 1 over `dur` frames from `from`, on the signature curve. */
export const prog = (frame: number, from: number, dur = 12, fn: (t: number) => number = ease) =>
  interpolate(frame, [from, from + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn });

/** Smooth critically-damped travel, no bounce. */
export const glide = (frame: number, from: number, dur = 30) => spring({ frame: frame - from, fps: FPS, durationInFrames: dur, config: { damping: 200, mass: 0.9 } });
/** Slight overshoot for pops and badges. */
export const pop = (frame: number, from: number) => spring({ frame: frame - from, fps: FPS, config: { damping: 12, mass: 0.6, stiffness: 160 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (frame: number, a: number, b: number, from: number, to: number, fn: (t: number) => number = ease) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn });
/** In and out of a window [a, b] in one number, 0 -> 1 -> 0. */
export const window = (frame: number, a: number, b: number, inDur = 10, outDur = 10) =>
  prog(frame, a, inDur, easeOut) * (1 - prog(frame, b - outDur, outDur, easeIn));
