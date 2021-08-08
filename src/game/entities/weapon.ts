import { ReadonlyAABB, ReadonlyVec3, ReadonlyVec4 } from 'munum';
import { HitBoxNone } from '../config';
import { Projectile } from './projectile';

export class Weapon {
  public constructor(
    public readonly damage: number,
    public readonly sprite: ReadonlyVec4,
    public readonly hitbox: ReadonlyAABB = HitBoxNone,
    public readonly speed: number = 0.5,
    public readonly twoHanded: boolean = false,
    public readonly pushBack: number = 1,
    public readonly isSharp: boolean = true,
    public readonly createProjectile: ((position: ReadonlyVec3, faceForward: boolean) => Projectile) | null = null
  ) {
  }
}

export class Armor {
  public constructor(
    public readonly sprite: ReadonlyVec4,
    public readonly armor: number = 0,
    public readonly recoverRate: number = 0
  ) {
  }
}
