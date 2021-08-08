import { ReadonlyVec3, ReadonlyVec4, vec3 } from 'munum';
import { Character, Weapon } from '../entities';
import { Enemy } from '../entities/enemy';
import { Projectile } from '../entities/projectile';
import { ORIGIN } from './config';
import { HitBoxWeaponLarge, HitBoxWeaponNormal, HitBoxWeaponSmall, HitBoxWeaponXLarge } from './physics';
import { Sprite } from './sprite';
import { Hero, Unlockable } from './unlockables';

export const Weapons = {
  BOW: new Weapon(2, Sprite.BOW, HitBoxWeaponLarge, 0.6, true, 4, createArrow),
  AXE: new Weapon(3, Sprite.AXE, HitBoxWeaponNormal),
  KNIFE: new Weapon(2, Sprite.KNIFE, HitBoxWeaponSmall, 0.2),
  SWORD: new Weapon(5, Sprite.SWORD, HitBoxWeaponNormal),
  GREATAXE: new Weapon(8, Sprite.GREATAXE, HitBoxWeaponLarge, 1),
  SPEAR: new Weapon(8, Sprite.SPEAR, HitBoxWeaponXLarge, 0.7, true),
  DOUBLEAXE: new Weapon(12, Sprite.DOUBLEAXE, HitBoxWeaponLarge, 1, true),
  FIRESTAFF: new Weapon(2, Sprite.FIRESTAFF, HitBoxWeaponLarge, 0.6, true, 4, createFireball),
  SMALLSHIELD: new Weapon(3, Sprite.SMALLSHIELD),
  WOODENSHIELD: new Weapon(4, Sprite.WOODENSHIELD),
  STEELSHIELD: new Weapon(6, Sprite.STEELSHIELD),
  MONEYBAG: new Weapon(1, Sprite.MONEYBAG, HitBoxWeaponNormal, 1, true),
} as const;

const HeroHP: Record<Hero, number> = {
  [Hero.KNIGHT]: 50,
  [Hero.ROGUE]: 40,
  [Hero.MAGE]: 30,
};

const HeroSpeed: Record<Hero, number> = {
  [Hero.KNIGHT]: 24,
  [Hero.ROGUE]: 32,
  [Hero.MAGE]: 20,
};

const HeroArmor: Record<Hero, ReadonlyVec4> = {
  [Hero.KNIGHT]: Sprite.KNIGHTHELM,
  [Hero.ROGUE]: Sprite.ROBINHOOD,
  [Hero.MAGE]: Sprite.ROBINHOOD,
};

const HeroCape: Record<Hero, ReadonlyVec4 | null> = {
  [Hero.KNIGHT]: Sprite.CAPE0,
  [Hero.ROGUE]: null,
  [Hero.MAGE]: Sprite.WIZARD,
};

const HeroStartWeapon: Record<Hero, Weapon> = {
  [Hero.KNIGHT]: Weapons.AXE,
  [Hero.ROGUE]: Weapons.KNIFE,
  [Hero.MAGE]: Weapons.FIRESTAFF,
};

export function createHero(hero: Hero, unlock: Unlockable = 0, position: ReadonlyVec3 = ORIGIN): Character {
  let char: Character;

  let armor = HeroArmor[hero];
  if (unlock & Unlockable.ARMOR) {
    armor = Sprite.CRUSADER;
  } 

  char = new Character(
    HeroHP[hero],
    Sprite.HERO,
    armor,
    HeroCape[hero],
    true
  );

  char.speed = HeroSpeed[hero];
  char.weapon = HeroStartWeapon[hero];
  char.shield = null;
  vec3.copy(position, char.position);

  if (unlock & Unlockable.BOW) {
    char.weapon = Weapons.BOW;
  } else if (unlock & Unlockable.SPEAR) {
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

export function createRat(hp: number = 5, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.RAT);
  enemy.coins = 2;
  enemy.fleeThreshold = 0.5;
  enemy.speed = 12;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createBat(hp: number = 7, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.BAT);
  enemy.attack = 2;
  enemy.coins = 4;
  enemy.fleeThreshold = 0.5;
  enemy.speed = 24;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSpider(hp: number = 10, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.SPIDER);
  enemy.attack = 2;
  enemy.coins = 6;
  enemy.fleeThreshold = 0.5;
  enemy.attackDelay = 0.5;
  enemy.speed = 32;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSnake(hp: number = 10, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.SNAKE);
  enemy.attack = 3;
  enemy.coins = 10;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.2;
  enemy.speed = 60;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime(hp: number = 30, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.SLIME);
  enemy.attack = 2;
  enemy.coins = 8;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 1;
  enemy.speed = 4;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime2(hp: number = 40, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = createSlime(hp, position);
  enemy.sprite.body = Sprite.BLUESLIME;
  return enemy;
}

export function createSlime3(hp: number = 50, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = createSlime(hp, position);
  enemy.sprite.body = Sprite.REDSLIME;
  return enemy;
}

export function createGoblin(hp: number = 30, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.GOBLIN);
  enemy.shield = Weapons.MONEYBAG;
  enemy.coins = Math.floor(30 + Math.random() * 20);
  enemy.fleeThreshold = 1;
  enemy.speed = 24;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createMinotaur(hp: number = 70, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.MINOTAUR);
  enemy.weapon = Weapons.GREATAXE;
  enemy.shield = Weapons.STEELSHIELD;
  enemy.coins = 50;
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

export function createSkeleton(hp: number = 15, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.SKELETON);
  enemy.weapon = Weapons.AXE;
  enemy.shield = Weapons.SMALLSHIELD;
  enemy.coins = 10;
  enemy.aggressive = 0.3;
  enemy.fleeThreshold = 0.5;
  enemy.attackDelay = 2;
  enemy.speed = 8;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSkeleton2(hp: number = 15, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = createSkeleton(hp, position);
  enemy.weapon = Weapons.KNIFE;
  enemy.shield = null;
  return enemy;
}

export function createDemonSkeleton(hp: number = 30, position: ReadonlyVec3 = ORIGIN): Enemy {
  const enemy = new Enemy(hp, Sprite.DEMONSKELETON);
  enemy.weapon = Weapons.SWORD;
  enemy.shield = Weapons.WOODENSHIELD;
  enemy.coins = 60;
  enemy.aggressive = 0.8;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.2;
  enemy.speed = 48;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createArrow(position: ReadonlyVec3, faceForward: boolean): Projectile {
  const proj = new Projectile(Sprite.ARROW);
  proj.lifeTime = 2;
  proj.damage = 4;
  vec3.copy(position, proj.position);
  proj.velocity[0] = (faceForward ? 1 : -1) * 96;
  proj.isSharp = true;
  return proj;
}

export function createFireball(position: ReadonlyVec3, faceForward: boolean): Projectile {
  const proj = new Projectile(Sprite.FIREBALL);
  proj.damage = 6;
  vec3.copy(position, proj.position);
  proj.velocity[0] = (faceForward ? 1 : -1) * 40;

  return proj;
}
