import { Vec3, ReadonlyAABB, ReadonlyVec4, vec3 } from 'munum';
import { Body, SpritesRenderer } from '../../core';
import { HitBoxChar } from '../config';
import { Character } from './char';
import { Entity } from './entity';

export class Projectile implements Body, Entity {
  public readonly position: Vec3 = [0, 0, 0];
  public readonly initialVelocity: Vec3 = [0, 0, 0];
  public readonly velocity: Vec3 = [0, 0, 0];
  public owner: Character | null = null;
  public faceForward: boolean = false;
  public readonly hitbox: ReadonlyAABB = HitBoxChar;
  public readonly sensors: ReadonlyAABB[] = [];
  public isDead: boolean = false;
  public isSharp: boolean = false;
  public damage: number = 0;
  public hitpoint: number = 1;
  public lastTime: number = 0;

  public constructor(
    public sprite: ReadonlyVec4,
    public lifeTime: number = 3
  ) {
  }

  update(time: number): void {
    if (!this.lastTime) {
      this.lastTime = time;
    }
    if (this.hitpoint <= 0 || (time - this.lastTime) > this.lifeTime) {
      this.isDead = true;
      return;
    }

    vec3.copy(this.initialVelocity, this.velocity);

    this.sensors[0] = this.hitbox;
    if (this.velocity[0]) {
      this.faceForward = this.velocity[0] > 0;
    }
  }

  render(renderer: SpritesRenderer, time: number): void {
    let alpha = 1;
    if (this.isDead) {
      alpha = 0;
    } else if (this.lifeTime - time - this.lastTime < 1) {
      alpha = Math.max(0, this.lifeTime - (time - this.lastTime));
    }
    renderer.submit(this.sprite, this.position, this.faceForward ? 1 : -1, alpha, [0, 0, 0, 0]);
  }
}
