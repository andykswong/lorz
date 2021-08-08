import { ReadonlyVec3, ReadonlyVec4, Vec4 } from 'munum';

export let UISprite: Record<string, ReadonlyVec4> = {
  HP: [0, 32, 1, 1],
  HPBG: [7, 32, 1, 2],
  MP: [8, 32, 8, 2],
  COIN: [16, 32, 5, 5],
  LEFT: [24, 32, 4, 7],
  RIGHT: [27, 32, 4, 7],
  UP: [24, 32, 7, 4],
  DOWN: [24, 35, 7, 4],
  SELECT: [40, 32, 8, 8],

  A: [96, 32, 3, 5],
  K: [96, 37, 3, 5],
  U: [96, 42, 3, 5],
  
  '0': [108, 37, 3, 5],
  '1': [120, 32, 3, 5],
  '2': [111, 42, 3, 5],
  '3': [114, 42, 3, 5],
  '4': [117, 42, 3, 5],
  '5': [120, 37, 3, 5],
  '6': [120, 42, 3, 5],
  '7': [123, 42, 3, 5],
  '8': [120, 47, 3, 5],
  '9': [123, 47, 3, 5],
  '-': [120, 52, 3, 5],
  ':': [123, 52, 1, 5],
  '!': [124, 52, 1, 5],
  ';': [125, 52, 3, 5],
}

for (let c = 'A'.charCodeAt(0) + 1; c < 'K'.charCodeAt(0); ++c) {
  UISprite[String.fromCharCode(c)] = [96 + 3 * (c - 'A'.charCodeAt(0)), 32, 3, 5];
}
for (let c = 'K'.charCodeAt(0) + 1; c < 'U'.charCodeAt(0); ++c) {
  UISprite[String.fromCharCode(c)] = [96 + 3 * (c - 'K'.charCodeAt(0)), 37, 3, 5];
}
for (let c = 'U'.charCodeAt(0) + 1; c <= 'Z'.charCodeAt(0); ++c) {
  UISprite[String.fromCharCode(c)] = [96 + 3 * (c - 'U'.charCodeAt(0)), 42, 3, 5];
}

export const Sprite: Record<string, ReadonlyVec4> = {
  WALL0: [64, 24, 8, 16],
  WALL1: [72, 24, 8, 16],
  WALL2: [80, 24, 8, 16],
  WALL3: [88, 24, 8, 16],
  FLOOR: [64, 40, 8, 8],

  KNIGHTHELM: [0, 40, 8, 8],
  CRUSADER: [8, 40, 8, 8],
  ROBINHOOD: [16, 40, 8, 8],
  PRIEST: [24, 40, 8, 8],
  WIZARD: [32, 32, 8, 16],
  NECRO: [40, 40, 8, 8],
  CAPE0: [48, 40, 8, 8],
  CAPE1: [56, 40, 8, 8],

  ARROW: [64, 16, 8, 7],
  FIREBALL: [72, 16, 8, 7],
  ICEBALL: [80, 16, 8, 7],
  HEAL: [88, 16, 8, 7],

  CHEST: [48, 32, 8, 8],
  CHESTOPEN: [56, 32, 8, 8],

  AXE: [0, 0, 16, 8],
  SWORD: [16, 0, 16, 8],
  KNIFE: [32, 0, 16, 8],
  BOW: [48, 0, 16, 8],
  SPEAR: [64, 0, 16, 8],
  STAFF: [80, 0, 16, 8],
  ICESTAFF: [96, 0, 16, 8],
  DOUBLEAXE: [112, 0, 16, 8],
  FIRESTAFF: [96, 16, 16, 8],
  GREATAXE: [112, 16, 16, 8],
  STEELSHIELD: [0, 16, 16, 8],
  WOODENSHIELD: [16, 16, 16, 8],
  SMALLSHIELD: [32, 16, 16, 8],
  MONEYBAG: [48, 16, 16, 8],

  HERO: [0, 48, 8, 8],
  BERSERKER: [8, 48, 8, 8],
  SKELETON: [16, 48, 8, 8],
  GOBLIN: [24, 48, 8, 8],
  DEMONSKELETON: [32, 48, 8, 8],
  ORC: [40, 48, 8, 8],
  ELF: [48, 48, 8, 8],
  MINOTAUR: [56, 48, 8, 8],
  RAT: [64, 48, 8, 8],
  SNAKE: [72, 48, 8, 8],
  BAT: [80, 48, 8, 8],
  SLIME: [88, 48, 8, 8],
  BLUESLIME: [96, 48, 8, 8],
  REDSLIME: [104, 48, 8, 8],
  SPIDER: [112, 48, 8, 8],
};

export const WEAPON_OFFSET: ReadonlyVec3 = [4, 0, 0];

export function frame(quad: ReadonlyVec4, i: number, vertical: boolean = true): ReadonlyVec4 {
  const f = Math.floor(i % 2);
  if (!f) {
    return quad;
  }
  const v: Vec4 = [...quad];
  if (vertical) {
    v[1] += v[3];
  } else {
    v[0] += v[2];
  }
  return v;
}
