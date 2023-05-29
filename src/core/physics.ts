import { aabb, AABB, clamp, mat4, Mat4, ReadonlyAABB, translate, vec3, Vec3 } from 'munum';
import { MAX, MIN } from '../game/config';

/** A physics body. */
export interface Body {
  readonly position: Vec3;
  readonly velocity: Vec3;
  readonly faceForward: boolean;
  readonly hitbox: ReadonlyAABB;
  readonly sensors: ReadonlyAABB[];
  readonly friction?: number;
  readonly isDead: boolean;
}

const tmpV: Vec3 = vec3.create();
const tmpMat4A: Mat4 = mat4.create();
const tmpMat4B: Mat4 = mat4.create();
const tmpAABBA: AABB = aabb.create();
const tmpAABBB: AABB = aabb.create();

/** Simulates a system of bodies for a fixed time interval. */
export function simulate(dt: number, bodies: Body[], hit?: (target: Body, by: Body, sensor: number) => void): void {
  // Integrate and damp velocity
  for (const body of bodies) {
    vec3.scale(body.velocity, dt, tmpV);
    vec3.add(body.position, tmpV, body.position);
    vec3.scale(tmpV, body.friction || 1, tmpV);
    for (let i = 0; i < 3; ++i) {
      body.velocity[i] = Math.sign(body.velocity[i]) * Math.max(0, Math.abs(body.velocity[i]) - Math.abs(tmpV[i]));
      body.position[i] = clamp(body.position[i], MIN[i], MAX[i]);
    }
  }

  // Check collisions
  for (let i = 0; i < bodies.length; ++i) {
    aabb.transform(bodies[i].hitbox, translate(bodies[i].position, tmpMat4A), tmpAABBA);
    for (let j = 0; j < bodies.length; ++j) {
      if (i === j) {
        continue;
      }
      for (let k = 0; k < bodies[j].sensors.length; ++k) {
        translate(bodies[j].position, tmpMat4B);
        if (!bodies[j].faceForward) {
          tmpMat4B[0] = -1;
        }
        aabb.transform(bodies[j].sensors[k], tmpMat4B, tmpAABBB);
        if (intersect(tmpAABBA, tmpAABBB)) {
          hit?.(bodies[i], bodies[j], k);
        }
      }
    }
  }
}

/** Checks if 2 AABBs intersacts. */
export function intersect(a: ReadonlyAABB, b: ReadonlyAABB): boolean {
  for (let i = 0; i < 3; ++i) {
    if (a.min[i] > b.max[i] || b.min[i] > a.max[i]) {
      return false;
    }
  }
  return true;
}
