import { Vec3, ReadonlyAABB } from 'munum';
import { Body, SpritesRenderer, zrandom } from '../../core';
import { HitBoxChar, Sprite } from '../config';
import { Entity } from './entity';

export class Chest implements Body, Entity {
  public readonly position: Vec3 = [0, 0, 0];
  public readonly velocity: Vec3 = [0, 0, 0];
  public readonly faceForward: boolean = true;
  public readonly hitbox: ReadonlyAABB = HitBoxChar;
  public readonly sensors: ReadonlyAABB[] = [];
  public isDead: boolean = false;
  public isOpen: boolean = false;
  public coins: number;

  public constructor(min: number = 100, max: number = 200) {
    this.coins = zrandom(min, max);
  }

  update(_time: number): void {
    // noop
  }

  render(renderer: SpritesRenderer, _time: number): void {
    renderer.submit(this.isOpen ? Sprite.CHESTOPEN : Sprite.CHEST, this.position, -1, 1, [0, 0, 0, 0]);
  }
}
