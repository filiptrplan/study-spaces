// Mirrors frontend/src/styles.css (dark theme) so the promo wears the app's own colours.
import { Easing } from 'remotion';

export const C = {
  bg: '#121212', surface: '#212121', surface2: '#3c3c3c', border: '#333333', borderStrong: '#808080',
  canvas: '#0a0a0a', text: '#ffffff', muted: '#bdbdbd', accent: '#6d9de0', onAccent: '#121212',
  danger: '#f47a70', free: '#6fbf73', reserved: '#b79cf0', bookable: '#f0883e', occupied: '#808080', brk: '#d3b177',
};
export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Corporate motion: one signature curve (0.2, 0, 0, 1), three durations (quick / standard / slow).
export const ease = Easing.bezier(0.2, 0, 0, 1);
export const easeOut = Easing.bezier(0.05, 0.7, 0.1, 1);
export const easeIn = Easing.bezier(0.3, 0, 1, 1);
export const D = { quick: 9, standard: 12, slow: 18 }; // frames at 30 fps: 300 / 400 / 600 ms
