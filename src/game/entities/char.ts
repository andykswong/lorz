import { ReadonlyAABB, ReadonlyVec4, vec3, Vec3 } from 'munum';
import { Sprite, HitBoxChar, HitBoxWeaponSmall } from '../config';
import { CharacterSprite } from '../graphics';
import { Body, SpritesRenderer } from '../../core';
import { Entity } from './entity';
import { Weapon } from './weapon';
import { Action } from '../action';
import { Sound } from '../sound';
import { Projectile } from './projectile';

export class Character implements Body, Entity {
  public readonly sprite: CharacterSprite;
  public readonly velocity: Vec3 = vec3.create();
  public attack: number = 1;
  public attackDelay: number = 1;
  public speed: number = 24;
  public readonly friction: number = 16;
  public hitbox: ReadonlyAABB = HitBoxChar;
  public sensors: ReadonlyAABB[] = [];
  public projectile: Projectile | null = null;
  public readonly maxHitPoint: number;
  private blockedDamage: number = 0;
  private shieldBroken: number = 0;
  protected lastTime: number = 0;

  public actions: Action = Action.None;

  private _weapon: Weapon | null = null;
  private _shield: Weapon | null = null;

  public constructor(
    public hitpoint: number = 10,  
    body: ReadonlyVec4 = Sprite.HERO,
    armor: ReadonlyVec4 | null = null,
    cape: ReadonlyVec4 | null = null,
    public isHero = false
  ) {
    this.maxHitPoint = hitpoint;
    this.sprite = new CharacterSprite(body, null, null, armor, cape);
  }

  public update(t: number = 0): void {
    if (!this.lastTime) {
      this.lastTime = t;
    }
    const dt = t - this.lastTime;

    this.sensors.length = 0;
    const wasWalking = this.sprite.isWalking;
    this.sprite.isWalking = false;

    if (this.sprite.isDead) {
      return;
    }

    this.shieldBroken = Math.max(0, this.shieldBroken - dt);
    this.sprite.isBlocking = !this.shieldBroken && !!(this._shield && (this.actions & Action.Block));

    if (!this.sprite.isBlocking && !this.sprite.isHit && !this.sprite.isAttacking && (this.actions & Action.Attack)) {
      this.sprite.attack(this.weapon?.speed);
      this.sensors.push(this._weapon?.hitbox || HitBoxWeaponSmall);
      if (this.weapon?.createProjectile) {
        const proj = this.weapon.createProjectile(this.position, this.faceForward);
        proj.initialVelocity[2] = this.velocity[2];
        proj.owner = this;
        this.projectile = proj;
      }
    }

    if (this.actions & Action.Left) {
      if (!(this.actions & Action.Right)) {
        this.sprite.faceForward = false;
      }
    } else if (this.actions & Action.Right) {
      this.sprite.faceForward = true;
    }

    if (this.sprite.isHit) {
      return;
    }

    const drag = this.sprite.isBlocking ? .5 : 1;
    if (this.actions & (Action.Up | Action.Down | Action.Left | Action.Right)) {
      vec3.set(this.velocity, 0, 0, 0);
      (this.actions & Action.Up) && vec3.set(this.velocity, 0, 0, -this.speed * .66 * drag);
      (this.actions & Action.Down) && vec3.set(this.velocity, 0, 0, this.speed * .66 * drag);
      (this.actions & Action.Left) && vec3.set(this.velocity, -this.speed * drag, 0, this.velocity[2]);
      (this.actions & Action.Right) && vec3.set(this.velocity, this.speed * drag, 0, this.velocity[2]);
      this.sprite.isWalking = true;
    }

    if (this.isHero && this.sprite.isWalking && (!wasWalking || Sound.Footstep.ended)) {
      Sound.Footstep.currentTime = 0;
      Sound.Footstep.volume = 0.05;
      Sound.Footstep.play();
    }

    this.lastTime = t;
  }

  public render(renderer: SpritesRenderer, t: number = 0): void {
    this.sprite.render(renderer, t);
  }

  public damage(damage: number, frontAttack: boolean = true): boolean {
    if (this.hitpoint <= 0) {
      return false;
    }
    let blocked = frontAttack && this.sprite.isBlocking;
    if (blocked) {
      damage = Math.max(0, damage - (this._shield?.damage || 0));
      this.blockedDamage += Math.min(damage, this._shield?.damage || 0);
      if (this.blockedDamage >= (this._shield?.damage || 0) * 5) {
        blocked = false;
        this.shieldBroken = 1;
        this.blockedDamage = 0;
        this.sprite.isBlocking = false;
      }
    } else if (!frontAttack && this.sprite.isBlocking) {
      this.shieldBroken = 0.5;
    }
    if ((this.hitpoint -= damage) <= 0) {
      this.sprite.isDead = true;
    }
    if (!blocked) {
      this.sprite.hit();
    }
    return !blocked;
  }

  public get position(): Vec3 {
    return this.sprite.position;
  }

  public get faceForward(): boolean {
    return this.sprite.faceForward;
  }

  public get blocking(): boolean {
    return this.sprite.isBlocking;
  }

  public get weapon(): Weapon | null {
    return this._weapon;
  }

  public set weapon(weapon: Weapon | null) {
    this._weapon = weapon;
    this.sprite.weapon = weapon?.sprite || null;
  }

  public get shield(): Weapon | null {
    return this._shield;
  }

  public set shield(weapon: Weapon | null) {
    this._shield = weapon;
    this.sprite.shield = weapon?.sprite || null;
  }

  public get isDead(): boolean {
    return this.sprite.isFullyDead;
  }
}
