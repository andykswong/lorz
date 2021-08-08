import { ReadonlyVec3, ReadonlyVec4, vec3 } from 'munum';
import { Character, Chest, Weapon } from '../entities';
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

export function createChest(position: ReadonlyVec3, min: number = 100, max: number = 200): Chest {
  const chest = new Chest(min, max);
  vec3.copy(position, chest.position);
  return chest;
}

export function createRat(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 5): Enemy {
  const enemy = new Enemy(hp, Sprite.RAT);
  enemy.target = target;
  enemy.coins = 2;
  enemy.fleeThreshold = 0.5;
  enemy.speed = 12;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createBat(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 7): Enemy {
  const enemy = new Enemy(hp, Sprite.BAT);
  enemy.target = target;
  enemy.attack = 2;
  enemy.coins = 4;
  enemy.fleeThreshold = 0.5;
  enemy.speed = 24;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSpider(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 10): Enemy {
  const enemy = new Enemy(hp, Sprite.SPIDER);
  enemy.target = target;
  enemy.attack = 2;
  enemy.coins = 6;
  enemy.fleeThreshold = 0.5;
  enemy.attackDelay = 0.5;
  enemy.speed = 32;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createGoblin(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 30): Enemy {
  const enemy = new Enemy(hp, Sprite.GOBLIN);
  enemy.target = target;
  enemy.shield = Weapons.MONEYBAG;
  enemy.coins = Math.floor(hp + Math.random() * hp / 2);
  enemy.fleeThreshold = 1;
  enemy.speed = 24;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSnake(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 10): Enemy {
  const enemy = new Enemy(hp, Sprite.SNAKE);
  enemy.target = target;
  enemy.attack = 3;
  enemy.coins = 10;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.2;
  enemy.speed = 60;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 30): Enemy {
  const enemy = new Enemy(30, Sprite.SLIME);
  enemy.target = target;
  enemy.attack = 2;
  enemy.coins = 8;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 1;
  enemy.speed = 4;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 40): Enemy {
  const enemy = createSlime(position, target, hp);
  enemy.sprite.body = Sprite.BLUESLIME;
  return enemy;
}

export function createSlime3(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 50): Enemy {
  const enemy = createSlime(position, target, hp);
  enemy.sprite.body = Sprite.REDSLIME;
  return enemy;
}

export function createMinotaur(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 100): Enemy {
  const enemy = new Enemy(hp, Sprite.MINOTAUR);
  enemy.target = target;
  enemy.weapon = Weapons.GREATAXE;
  enemy.shield = Weapons.STEELSHIELD;
  enemy.coins = 50;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.5;
  enemy.speed = 16;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createMinotaur2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 100): Enemy {
  const enemy = createMinotaur(position, target, hp);
  enemy.weapon = Weapons.DOUBLEAXE;
  enemy.shield = null;
  return enemy;
}

export function createSkeleton(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 15): Enemy {
  const enemy = new Enemy(hp, Sprite.SKELETON);
  enemy.target = target;
  enemy.weapon = Weapons.AXE;
  enemy.shield = Weapons.SMALLSHIELD;
  enemy.coins = 10;
  enemy.fleeThreshold = 0.5;
  enemy.attackDelay = 1.5;
  enemy.speed = 8;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSkeleton2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 15): Enemy {
  const enemy = createSkeleton(position, target, hp);
  enemy.weapon = Weapons.KNIFE;
  enemy.shield = null;
  return enemy;
}

export function createDemonSkeleton(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 50): Enemy {
  const enemy = new Enemy(hp, Sprite.DEMONSKELETON);
  enemy.target = target;
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

export function createArrow(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.ARROW);
  proj.lifeTime = 2;
  proj.damage = 4;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 96;
  proj.isSharp = true;
  return proj;
}

export function createFireball(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.FIREBALL);
  proj.damage = 6;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 40;

  return proj;
}

export function createIceball(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.ICEBALL);
  proj.damage = 6;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 32;

  return proj;
}
