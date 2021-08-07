import { ReadonlyAABB, ReadonlyVec4, vec3, Vec3 } from 'munum';
import { Sprite, HitBoxChar, HitBoxWeaponSmall } from '../config';
import { CharacterSprite } from '../graphics';
import { Body, SpritesRenderer } from '../../core';
import { Entity } from './entity';
import { Weapon } from './weapon';
import { Action } from '../action';
import { Sound } from '../sound';

export class Character implements Body, Entity {
  public readonly sprite: CharacterSprite;
  public readonly velocity: Vec3 = vec3.create();
  public speed: number = 24;
  public readonly friction: number = 16;
  public hitbox: ReadonlyAABB = HitBoxChar;
  public sensors: ReadonlyAABB[] = [];
  public readonly maxHitPoint: number;

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
    this.sensors.length = 0;
    const wasWalking = this.sprite.isWalking;
    this.sprite.isWalking = false;

    if (this.sprite.isDead) {
      return;
    }

    this.sprite.isBlocking = !!(this._shield && (this.actions & Action.Block));

    if (!this.sprite.isBlocking && !this.sprite.isHit && !this.sprite.isAttacking && (this.actions & Action.Attack)) {
      this.sprite.attack();
      this.sensors.push(this._weapon?.hitbox || HitBoxWeaponSmall);
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
      Sound.Footstep.play();
    }
  }

  public render(renderer: SpritesRenderer, t: number = 0): void {
    this.sprite.render(renderer, t);
  }

  public damage(damage: number): boolean {
    if (this.hitpoint <= 0) {
      return false;
    }
    if (this.sprite.isBlocking) {
      damage = Math.max(0, damage - (this._shield?.damage || 0));
    }
    if ((this.hitpoint -= damage) <= 0) {
      this.sprite.isDead = true;
    }
    if (damage) {
      this.sprite.hit();
    }
    return true;
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
