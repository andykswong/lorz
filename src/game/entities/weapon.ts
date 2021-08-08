import { ReadonlyAABB, ReadonlyVec3, ReadonlyVec4 } from 'munum';
import { HitBoxNone } from '../config';
import { Projectile } from './projectile';

export class Weapon {
  public constructor(
    public damage: number,
    public readonly sprite: ReadonlyVec4,
    public readonly hitbox: ReadonlyAABB = HitBoxNone,
    public readonly speed: number = 0.5,
    public readonly twoHanded: boolean = false,
    public readonly pushBack: number = 1,
    public readonly createProjectile: ((position: ReadonlyVec3, faceForward: boolean) => Projectile) | null = null
  ) {
  }
}
