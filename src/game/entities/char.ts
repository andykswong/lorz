import { ReadonlyAABB, ReadonlyVec4, vec3, Vec3 } from 'munum';
import { Sprite, HitBoxChar, HitBoxWeaponSmall } from '../config';
import { Body } from '../physics';
import { CharacterSprite } from '../graphics';
import { SpritesRenderer } from '../../engine';
import { Entity } from './entity';
import { Weapon } from './weapon';
import { Action } from '../action';

export class Character implements Body, Entity {
  public readonly sprite: CharacterSprite;
  public readonly velocity: Vec3 = vec3.create();
  public readonly friction: number = 16;
  public hitbox: ReadonlyAABB = HitBoxChar;
  public sensors: ReadonlyAABB[] = [];

  private _weapon: Weapon | null = null;
  private _shield: Weapon | null = null;

  public constructor(
    public hitpoint: number = 10,  
    body: ReadonlyVec4 = Sprite.HERO,
    armor: ReadonlyVec4 | null = null,
    cape: ReadonlyVec4 | null = null
  ) {
    this.sprite = new CharacterSprite(body, null, null, armor, cape);
  }

  public update(actions: Action = Action.None): void {
    this.sensors.length = 0;
    this.sprite.isWalking = false;

    if (this.velocity[0] < 0) {
      this.sprite.faceForward = false;
    } else if (this.velocity[0] > 0) {
      this.sprite.faceForward = true;
    }

    if (this.sprite.isDead) {
      return;
    }

    this.sprite.isBlocking = !!(this._shield && (actions & Action.Block));

    if (!this.sprite.isBlocking && !this.sprite.isAttacking && (actions & Action.Attack)) {
      this.sprite.attack();
      this.sensors.push(this._weapon?.hitbox || HitBoxWeaponSmall);
    }

    const drag = this.sprite.isBlocking ? .5 : 1;
    vec3.set(this.velocity, 0, 0, 0);
    (actions & Action.Up) && vec3.set(this.velocity, 0, 0, -16 * drag);
    (actions & Action.Down) && vec3.set(this.velocity, 0, 0, 16 * drag);
    (actions & Action.Left) && vec3.set(this.velocity, -24 * drag, 0, this.velocity[2]);
    (actions & Action.Right) && vec3.set(this.velocity, 24 * drag, 0, this.velocity[2]);

    this.sprite.isWalking = !!(this.velocity[0] || this.velocity[1] || this.velocity[2])
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
}
