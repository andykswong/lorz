import { ReadonlyVec3, vec3 } from 'munum';
import { Character, Weapon } from '../entities';
import { Enemy } from '../entities/enemy';
import { ORIGIN } from './config';
import { HitBoxNone, HitBoxWeaponLarge, HitBoxWeaponNormal, HitBoxWeaponSmall, HitBoxWeaponXLarge } from './physics';
import { Sprite } from './sprite';
import { Hero, Unlockable } from './unlockables';

export const Weapons = {
  BOW: new Weapon(0, Sprite.BOW, HitBoxNone, 1, true),
  AXE: new Weapon(3, Sprite.AXE, HitBoxWeaponNormal),
  KNIFE: new Weapon(2, Sprite.KNIFE, HitBoxWeaponSmall, 0.2),
  SWORD: new Weapon(5, Sprite.SWORD, HitBoxWeaponNormal),
  GREATAXE: new Weapon(8, Sprite.GREATAXE, HitBoxWeaponLarge, 1),
  SPEAR: new Weapon(8, Sprite.SPEAR, HitBoxWeaponXLarge, 0.7, true),
  DOUBLEAXE: new Weapon(12, Sprite.DOUBLEAXE, HitBoxWeaponLarge, 1, true),
  SMALLSHIELD: new Weapon(3, Sprite.SMALLSHIELD),
  WOODENSHIELD: new Weapon(4, Sprite.WOODENSHIELD),
  STEELSHIELD: new Weapon(6, Sprite.STEELSHIELD)
} as const;

const HeroHP: Record<Hero, number> = {
  [Hero.KNIGHT]: 50,
};

export function createHero(hero: Hero, unlock: Unlockable = 0, position: ReadonlyVec3 = ORIGIN): Character {
  let char: Character;

  let armor = Sprite.KNIGHTHELM;
  if (unlock & Unlockable.ARMOR) {
    armor = Sprite.CRUSADER;
  } 

  char = new Character(
    HeroHP[hero],
    Sprite.HERO,
    armor,
    Sprite.CAPE0,
    true
  );

  char.weapon = Weapons.AXE;
  char.shield = null;
  vec3.copy(position, char.position);

  if (unlock & Unlockable.SPEAR) {
    char.weapon = Weapons.SPEAR;
  } else if (unlock & Unlockable.SWORD) {
    char.weapon = Weapons.SWORD;
  }

  if (!char.weapon?.twoHanded) {
    if (unlock & Unlockable.STEELSHIELD) {
      char.shield = Weapons.STEELSHIELD;
    } else if (unlock & Unlockable.SHIELD) {
      char.shield = Weapons.WOODENSHIELD;
    }
  }

  return char;
}

export function createMinotaur(hp: number = 70, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.MINOTAUR);
  enemy.weapon = Weapons.GREATAXE;
  enemy.shield = Weapons.STEELSHIELD;
  enemy.coins = 35;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.5;
  enemy.speed = 16;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createMinotaur2(hp: number = 70, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = createMinotaur(hp, position);
  enemy.weapon = Weapons.DOUBLEAXE;
  enemy.shield = null;
  return enemy;
}

export function createSkeleton(hp: number = 10, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.SKELETON);
  enemy.weapon = Weapons.AXE;
  enemy.shield = Weapons.SMALLSHIELD;
  enemy.coins = 5;
  enemy.fleeThreshold = 0.5;
  enemy.attackDelay = 2;
  enemy.speed = 8;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSkeleton2(hp: number = 10, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = createSkeleton(hp, position);
  enemy.weapon = Weapons.KNIFE;
  enemy.shield = null;
  return enemy;
}

export function createDemonSkeleton(hp: number = 30, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.DEMONSKELETON);
  enemy.weapon = Weapons.SWORD;
  enemy.shield = Weapons.WOODENSHIELD;
  enemy.coins = 45;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0;
  enemy.speed = 48;
  vec3.copy(position, enemy.position);
  return enemy;
}
