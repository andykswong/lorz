import { Vec3, ReadonlyAABB } from 'munum';
import { Body, SpritesRenderer } from '../../core';
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
  public coins: number = Math.floor(30 + Math.random() * 170);

  update(time: number): void {
  }

  render(renderer: SpritesRenderer, time: number): void {
    renderer.submit(this.isOpen ? Sprite.CHESTOPEN : Sprite.CHEST, this.position, -1, 1, [0, 0, 0, 0]);
  }
}
