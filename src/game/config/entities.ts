import { ReadonlyVec3, vec3 } from 'munum';
import { Character, Weapon } from '../entities';
import { Enemy } from '../entities/enemy';
import { ORIGIN } from './config';
import { HitBoxWeaponLarge, HitBoxWeaponNormal, HitBoxWeaponSmall } from './physics';
import { Sprite } from './sprite';

export const Weapons = {
  BOW: new Weapon(0, Sprite.BOW),
  KNIFE: new Weapon(2, Sprite.KNIFE, HitBoxWeaponSmall),
  AXE: new Weapon(3, Sprite.AXE, HitBoxWeaponNormal),
  SWORD: new Weapon(5, Sprite.SWORD, HitBoxWeaponNormal),
  GREATAXE: new Weapon(8, Sprite.GREATAXE, HitBoxWeaponLarge),
  DOUBLEAXE: new Weapon(10, Sprite.DOUBLEAXE, HitBoxWeaponLarge),
  WOODENSHIELD: new Weapon(5, Sprite.WOODENSHIELD),
  SMALLSHIELD: new Weapon(3, Sprite.SMALLSHIELD),
  STEELSHIELD: new Weapon(8, Sprite.STEELSHIELD)
} as const;

export function createHero(hp: number = 50, position: ReadonlyVec3 = ORIGIN): Character {
  const hero = new Character(
    hp,
    Sprite.HERO,
    Sprite.KNIGHTHELM,
    Sprite.CAPE0,
    true
  );

  hero.weapon = Weapons.SWORD;
  hero.shield = Weapons.WOODENSHIELD;
  vec3.copy(position, hero.position);

  return hero;
}

export function createMinotaur(hp: number = 70, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.MINOTAUR);
  enemy.weapon = Weapons.GREATAXE;
  enemy.shield = Weapons.STEELSHIELD;
  enemy.coins = 35;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 1.5;
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
  enemy.attackDelay = 0.5;
  enemy.speed = 48;
  vec3.copy(position, enemy.position);
  return enemy;
}
