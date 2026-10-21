import { staticFile } from 'remotion';
import type { StudySpace } from '../../../frontend/src/domain/space';
import { describeAvailability } from '../../../frontend/src/domain/space';
import type { MapSeat } from '../../../frontend/src/domain/room';
import type { SeatState } from '../../../frontend/src/domain/seat';

/** Rooms as the Home screen lists them. Photos are the rooms' own ETH photos (served by the app's backend). */
const room = (id: string, name: string, free: number, total: number, photo?: string, favourite = false): StudySpace => ({
  id, name, freeSeats: free, favourite, ...describeAvailability(free, total, true),
  photoUrl: photo ? staticFile(`photos/${photo}.jpg`) : undefined,
});
export const HERO = room('hg-d-3', 'HG D 3.1', 14, 32, 'hg-d-3', true);
export const spaces: StudySpace[] = [
  HERO,
  room('hg-f-5', 'HG F 5', 9, 24, 'hg-f-5', true),
  room('hph-g-1', 'HPH G 1', 21, 40, 'hph-g-1'),
  room('hg-e-51', 'HG E 51', 3, 16),
  room('cab-e-11', 'CAB E 11.1', 17, 28),
  room('hil-e-2', 'Baubibliothek HIL E 2.1', 26, 60),
  room('chn-f-14', 'CHN F 14', 0, 20),
];
export const rows = (): { id: string; title: string; spaces: StudySpace[] }[] => [
  { id: 'favourites', title: 'Favourites', spaces: [spaces[0], spaces[1]] },
  { id: 'recent', title: 'Recent', spaces: [spaces[3], spaces[2]] },
  { id: 'popular', title: 'Most popular', spaces: [spaces[1], spaces[0], spaces[4]] },
];

export const people = {
  you: { id: 'you', name: 'Filip', photo_url: null },
  mara: { id: 'mara', name: 'Mara Keller', photo_url: null },
  jonas: { id: 'jonas', name: 'Jonas Weber', photo_url: null },
  lea: { id: 'lea', name: 'Lea Brunner', photo_url: null },
  noah: { id: 'noah', name: 'Noah Meier', photo_url: null },
};
export const initialsOf = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

/* The stand-in floor plan's 35 seat slots (frontend/src/domain/room.ts), four per table, then the side bench. */
const slots = [
  [132, 92], [188, 92], [132, 188], [188, 188], [408, 92], [464, 92], [408, 188], [464, 188],
  [132, 252], [188, 252], [132, 348], [188, 348], [408, 252], [464, 252], [408, 348], [464, 348],
  [132, 412], [188, 412], [132, 508], [188, 508], [408, 412], [464, 412], [408, 508], [464, 508],
  [132, 572], [188, 572], [132, 668], [188, 668], [408, 572], [464, 572], [408, 668], [464, 668],
  [548, 224], [548, 284], [548, 344],
] as const;
const tableLetters = 'ABCDEFGH';
export const seatId = (i: number) => `s${i}`;
export const seatLabel = (i: number) => (i < 32 ? `${tableLetters[Math.floor(i / 4)]}-${(i % 4) + 1}` : `I-${i - 31}`);

/** Which seats are taken, held, on a break or free in the hero room. A-2 (index 1) is the one we book. */
export const heroStates: SeatState[] = Array.from({ length: 35 }, (_, i) => {
  if (i === 1) return 'free';
  const x = (i * 7 + 3) % 11;
  if ([0, 2, 3].includes(i)) return 'occupied';          // Mara, Jonas, Lea at table A
  if (x < 4) return 'occupied';
  if (x === 4 || x === 9) return 'reserved';
  if (x === 5) return 'break';
  return 'free';
});
export const seatsFor = (states: SeatState[]): MapSeat[] =>
  slots.map(([x, y], i) => ({ id: seatId(i), label: seatLabel(i), state: states[i], reservableAt: null, x, y, angle: 0, badges: [] }));
export const FRIEND_SEATS = { [seatId(0)]: people.mara, [seatId(2)]: people.jonas, [seatId(3)]: people.lea };
