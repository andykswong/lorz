import { ReadonlyAABB, ReadonlyVec4 } from 'munum';
import { HitBoxNone } from '../config';

export class Weapon {
  public constructor(
    public damage: number,
    public readonly sprite: ReadonlyVec4,
    public readonly hitbox: ReadonlyAABB = HitBoxNone,
    public readonly speed: number = 0.5,
    public readonly twoHanded: boolean = false
  ) {
  }
}
