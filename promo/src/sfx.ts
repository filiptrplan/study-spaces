import { openingCues } from './scenes/opening';
import { productCues } from './scenes/product';
import { moreCues } from './scenes/more';

export type Cue = { name: string; frame: number; len: number; volume?: number };
/** Every sound effect in the film, placed on the frame it belongs to. */
export const sfxCues = (): Cue[] => [...openingCues(), ...productCues(), ...moreCues()];
