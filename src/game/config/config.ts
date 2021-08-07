import { ReadonlyVec3, ReadonlyVec4 } from 'munum';

export const WIDTH = 64;
export const HEIGHT = 64;

export const ORIGIN: ReadonlyVec3 = [0, 0, 8];
export const MIN: ReadonlyVec3 = [-28, 0, -12];
export const MAX: ReadonlyVec3 = [Number.MAX_SAFE_INTEGER, 0, 28];

export const HIT_COLOR: ReadonlyVec3 = [0xa9 / 0xFF, 0x3b / 0xFF, 0x3b / 0xFF];
export const TEXT_COLOR: ReadonlyVec4 = [1, 1, 1, 1];

export const MAX_COINS = 999999;
