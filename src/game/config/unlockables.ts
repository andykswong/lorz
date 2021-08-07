export enum Hero {
  KNIGHT = 1 << 0,
}

export enum Unlockable {
  SHIELD = 1 << 0,
  SWORD = 1 << 1,
  SPEAR = 1 << 4,
  STEELSHIELD = 1 << 3,
  ARMOR = 1 << 2,
}

export interface UnlockableInfo {
  name: string;
  type: Unlockable;
  coins: number;
  exclude?: Unlockable;
  required?: Unlockable;
}

export interface HeroUnlocks {
  name: string;
  hero: Hero;
  coins: number;
  unlocks: UnlockableInfo[];
}

const TWOHANDED = Unlockable.SPEAR;
const WEAPONS = Unlockable.SWORD | TWOHANDED;
const SHIELDS = Unlockable.SHIELD | Unlockable.STEELSHIELD;
const ARMOR = Unlockable.ARMOR;

export const UnlockTable: HeroUnlocks[] = [
  {
    name: 'KNIGHT',
    hero: Hero.KNIGHT,
    coins: 0,
    unlocks: [
      { name: 'SHIELD', type: Unlockable.SHIELD, coins: 300, required: 0, exclude: SHIELDS | TWOHANDED },
      { name: 'SWORD', type: Unlockable.SWORD, coins: 600, required: 0, exclude: WEAPONS },
      { name: 'SHIELD', type: Unlockable.STEELSHIELD, coins: 900, required: Unlockable.SHIELD, exclude: SHIELDS | TWOHANDED },
      { name: 'SPEAR', type: Unlockable.SPEAR, coins: 1500, required: 0, exclude: WEAPONS | SHIELDS },
      { name: 'ARMOR', type: Unlockable.ARMOR, coins: 2100, required: 0, exclude: ARMOR },
    ]
  },
];
