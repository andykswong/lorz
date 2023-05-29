import { ReadonlyVec3, ReadonlyVec4, vec3 } from 'munum';
import { Armor, Character, Chest, Weapon } from '../entities';
import { Enemy } from '../entities/enemy';
import { Effect, Projectile } from '../entities/projectile';
import { FIRE_HIT_COLOR, HOLY_HIT_COLOR, ICE_HIT_COLOR, ORIGIN } from './config';
import { HitBoxWeaponLarge, HitBoxWeaponNormal, HitBoxWeaponSmall, HitBoxWeaponXLarge } from './physics';
import { Sprite } from './sprite';
import { Hero, Unlockable } from './unlockables';

export const Armors = {
  KNIGHT: new Armor(Sprite.KNIGHTHELM),
  ROGUE: new Armor(Sprite.ROBINHOOD),
  MAGE: new Armor(Sprite.WIZARD),
  CRUSADER: new Armor(Sprite.CRUSADER, 1),
  PRIEST: new Armor(Sprite.PRIEST, 0, 1),
} as const;

export const Weapons = {
  BOW: new Weapon(2, Sprite.BOW, HitBoxWeaponNormal, 0.6, true, 4, true, createArrow),
  SHORTBOW: new Weapon(1, Sprite.BOW, HitBoxWeaponNormal, 0.6, true, 4, true, createShortArrow),
  AXE: new Weapon(3, Sprite.AXE, HitBoxWeaponNormal),
  KNIFE: new Weapon(2, Sprite.KNIFE, HitBoxWeaponSmall, 0.2),
  SWORD: new Weapon(5, Sprite.SWORD, HitBoxWeaponNormal),
  GREATAXE: new Weapon(8, Sprite.GREATAXE, HitBoxWeaponLarge, 1),
  SPEAR: new Weapon(8, Sprite.SPEAR, HitBoxWeaponXLarge, 0.6, true),
  DOUBLEAXE: new Weapon(12, Sprite.DOUBLEAXE, HitBoxWeaponLarge, 0.9, true),
  STAFF: new Weapon(3, Sprite.STAFF, HitBoxWeaponNormal, 0.5, true, 2, false, createHolyAttack),
  FIRESTAFF: new Weapon(2, Sprite.FIRESTAFF, HitBoxWeaponNormal, 0.7, true, 4, false, createFireball),
  ICESTAFF: new Weapon(2, Sprite.ICESTAFF, HitBoxWeaponNormal, 0.6, true, 4, false, createIceball),
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

const HeroArmor: Record<Hero, Armor> = {
  [Hero.KNIGHT]: Armors.KNIGHT,
  [Hero.ROGUE]: Armors.ROGUE,
  [Hero.MAGE]: Armors.MAGE,
};

const HeroCape: Record<Hero, ReadonlyVec4 | null> = {
  [Hero.KNIGHT]: Sprite.CAPE0,
  [Hero.ROGUE]: null,
  [Hero.MAGE]: null,
};

const HeroStartWeapon: Record<Hero, Weapon> = {
  [Hero.KNIGHT]: Weapons.AXE,
  [Hero.ROGUE]: Weapons.KNIFE,
  [Hero.MAGE]: Weapons.FIRESTAFF,
};

export function createHero(hero: Hero, unlock: Unlockable = 0 as Unlockable, position: ReadonlyVec3 = ORIGIN): Character {
  let cape = HeroCape[hero];
  let armor = HeroArmor[hero];
  if (unlock & Unlockable.ARMOR) {
    armor = Armors.CRUSADER;
  } else if (unlock & Unlockable.PRIEST) {
    armor = Armors.PRIEST;
    cape = null;
  } else if (unlock & Unlockable.ICESTAFF) {
    cape = Sprite.CAPE1;
  }

  const char = new Character(
    HeroHP[hero],
    Sprite.HERO,
    armor,
    cape,
    true
  );

  char.speed = HeroSpeed[hero];
  char.weapon = HeroStartWeapon[hero];
  char.shield = null;
  vec3.copy(position, char.position);

  if (unlock & Unlockable.PRIEST) {
    char.weapon = Weapons.STAFF;
  } if (unlock & Unlockable.ICESTAFF) {
    char.weapon = Weapons.ICESTAFF;
  } else if (unlock & Unlockable.BOW) {
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
  enemy.attack = 1;
  enemy.coins = 3;
  enemy.fleeThreshold = 0.6;
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
  enemy.attackDelay = 0.8;
  enemy.speed = 32;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createGoblin(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 20): Enemy {
  const enemy = new Enemy(hp, Sprite.GOBLIN);
  enemy.target = target;
  enemy.shield = Weapons.MONEYBAG;
  enemy.coins = Math.floor(hp + Math.random() * hp / 2);
  enemy.fleeThreshold = 1;
  enemy.speed = 16;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSnake(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 10): Enemy {
  const enemy = new Enemy(hp, Sprite.SNAKE);
  enemy.target = target;
  enemy.attack = 3;
  enemy.coins = 18;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.3;
  enemy.speed = 60;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 20): Enemy {
  const enemy = new Enemy(hp, Sprite.SLIME);
  enemy.target = target;
  enemy.attack = 2;
  enemy.coins = 8;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 1;
  enemy.speed = 4;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSlime2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 30): Enemy {
  const enemy = createSlime(position, target, hp);
  enemy.sprite.body = Sprite.BLUESLIME;
  enemy.coins = 10;
  return enemy;
}

export function createSlime3(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 40): Enemy {
  const enemy = createSlime(position, target, hp);
  enemy.sprite.body = Sprite.REDSLIME;
  enemy.coins = 12;
  return enemy;
}

export function createMinotaur(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 90): Enemy {
  const enemy = new Enemy(hp, Sprite.MINOTAUR);
  enemy.target = target;
  enemy.weapon = Weapons.GREATAXE;
  enemy.shield = Weapons.STEELSHIELD;
  enemy.coins = 45;
  enemy.fleeThreshold = 0;
  enemy.attackDelay = 0.5;
  enemy.speed = 16;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createMinotaur2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 90): Enemy {
  const enemy = createMinotaur(position, target, hp);
  enemy.weapon = Weapons.DOUBLEAXE;
  enemy.shield = null;
  return enemy;
}

export function createMinotaurArcher(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 90): Enemy {
  const enemy = createMinotaur(position, target, hp);
  enemy.attackDelay = 1;
  enemy.coins = 60;
  enemy.weapon = Weapons.BOW;
  enemy.shield = null;
  return enemy;
}

export function createSkeleton(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 25): Enemy {
  const enemy = new Enemy(hp, Sprite.SKELETON);
  enemy.target = target;
  enemy.weapon = Weapons.AXE;
  enemy.shield = Weapons.SMALLSHIELD;
  enemy.coins = 10;
  enemy.fleeThreshold = 0.4;
  enemy.attackDelay = 1.5;
  enemy.speed = 8;
  vec3.copy(position, enemy.position);
  return enemy;
}

export function createSkeleton2(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 25): Enemy {
  const enemy = createSkeleton(position, target, hp);
  enemy.weapon = Weapons.KNIFE;
  enemy.shield = null;
  return enemy;
}

export function createSkeletonArcher(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 20): Enemy {
  const enemy = createSkeleton(position, target, hp);
  enemy.coins = 20;
  enemy.weapon = Weapons.SHORTBOW;
  enemy.shield = null;
  return enemy;
}

export function createSkeletonMage(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 20): Enemy {
  const enemy = createSkeleton(position, target, hp);
  enemy.coins = 20;
  enemy.weapon = Weapons.FIRESTAFF;
  enemy.shield = null;
  return enemy;
}

export function createDemonSkeleton(position: ReadonlyVec3 = ORIGIN, target: Character | null = null, hp: number = 70): Enemy {
  const enemy = new Enemy(hp, Sprite.DEMONSKELETON);
  enemy.target = target;
  enemy.weapon = Weapons.SWORD;
  enemy.shield = Weapons.WOODENSHIELD;
  enemy.coins = 80;
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
  proj.effect = Effect.Pushback;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 96;
  proj.isSharp = true;
  return proj;
}

export function createShortArrow(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.ARROW);
  proj.lifeTime = 0.8;
  proj.damage = 4;
  proj.effect = Effect.Pushback;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 80;
  proj.isSharp = true;
  return proj;
}

export function createFireball(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.FIREBALL);
  proj.hitColor = FIRE_HIT_COLOR;
  proj.damage = 6;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 40;

  return proj;
}

export function createIceball(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.ICEBALL);
  proj.hitColor = ICE_HIT_COLOR;
  proj.damage = 4;
  proj.effect = Effect.Freeze;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 32;

  return proj;
}

export function createHolyAttack(position: ReadonlyVec3, faceForward: boolean = true): Projectile {
  const proj = new Projectile(Sprite.HOLY);
  proj.hitColor = HOLY_HIT_COLOR;
  proj.lifeTime = 1;
  proj.damage = 5;
  proj.flip = true;
  vec3.copy(position, proj.position);
  proj.initialVelocity[0] = (faceForward ? 1 : -1) * 20;

  return proj;
}
