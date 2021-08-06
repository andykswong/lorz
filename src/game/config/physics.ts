import { aabb, ReadonlyAABB } from 'munum';

export const HitBoxChar: ReadonlyAABB = aabb.create([-4, 0, -2], [4, 8, 2]);

export const HitBoxNone: ReadonlyAABB = aabb.create();

export const HitBoxWeaponSmall: ReadonlyAABB = aabb.create([0, 2, -2], [6, 6, 2]);

export const HitBoxWeaponNormal: ReadonlyAABB = aabb.create([0, 2, -2], [8, 8, 2]);

export const HitBoxWeaponLarge: ReadonlyAABB = aabb.create([0, 0, -2], [12, 8, 2]);
