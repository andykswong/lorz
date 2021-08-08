import { ReadonlyVec4 } from 'munum';
import { Action } from '../action';
import { Body } from '../../core';
import { Character } from './char';
import { HitBoxWeaponSmall } from '../config';

export class Enemy extends Character {
  public coins = 1;
  public aggressive = 0.7;
  public blockDuration = 1;
  public fleeThreshold = 0.2;
  public target: Body | null = null;
  public lastAttackTime: number = 0;
  public lastBlockTime: number = 0;
  public dt: number = 0;

  public act: (thisEnemy: Enemy, t: number, dt: number) => void = defaultEnemyAction;

  public constructor(
    hitpoint: number,  
    body: ReadonlyVec4
  ) {
    super(hitpoint, body, null, null);
  }
  
  public update(t: number = 0): void {
    this.dt += (t && this.lastTime) ? t - this.lastTime : 0;
    if (this.dt >= 0.2) {
      this.act(this, t, this.dt);
      this.dt = 0;
    }
    super.update(t);
  }
}

export function defaultEnemyAction(enemy: Enemy, t: number, dt: number): void {
  enemy.target = enemy.target;

  let nextAction: Action = Action.None;

  const flee = enemy.hitpoint / enemy.maxHitPoint <= enemy.fleeThreshold;
  const distX = enemy.position[0] - (enemy.target ? enemy.target.position[0] : -100);

  if (!enemy.target || enemy.target.isDead || (!flee && Math.abs(distX) > 48)) {
    if (Math.random() < 0.01 + ((enemy.actions & Action.Left) ? 0.05 : -0.04)) nextAction = nextAction | Action.Left;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Right) ? 0.05 : -0.04)) nextAction = nextAction | Action.Right;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Up) ? 0.05 : -0.04)) nextAction = nextAction | Action.Up;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Down) ? 0.05 : -0.04)) nextAction = nextAction | Action.Down;
    enemy.actions = nextAction;
    return;
  }

  const distZ = enemy.position[2] - enemy.target.position[2];
  const hitRangeX = (enemy.weapon?.hitbox || HitBoxWeaponSmall).max[0] + 2;
  const hitRangeZ = (enemy.weapon?.hitbox || HitBoxWeaponSmall).max[2] + 2;

  if (Math.abs(distZ) <= hitRangeZ) {
    if (t - enemy.lastAttackTime > enemy.attackDelay) {
      if (enemy.shield && (t - enemy.lastBlockTime > enemy.blockDuration * 2) && (Math.random() < (1 - enemy.aggressive) / dt) && (
        Math.abs(distX) <= hitRangeX ||
        (enemy.target instanceof Character && enemy.target.weapon?.createProjectile && Math.abs(distX) < 64)
      )) {
        nextAction = nextAction | Action.Block;
        enemy.lastBlockTime = t;
      }
      if (Math.abs(distX) <= hitRangeX && Math.random() < enemy.aggressive) {
        nextAction = (nextAction & ~Action.Block) | Action.Attack;
        enemy.lastAttackTime = t;
      }
    }
    (enemy.faceForward && distX > 0) && (nextAction = nextAction | Action.Left);
    (!enemy.faceForward && distX < 0) && (nextAction = nextAction | Action.Right);
  }
  
  if ((enemy.actions & Action.Block) && (t - enemy.lastBlockTime < enemy.blockDuration)) {
    nextAction = nextAction | Action.Block;
  }

  if (flee) {
    if (Math.abs(distX) < 196 && !(nextAction & Action.Block)) {
      nextAction = nextAction | (distX > 0 ? Action.Right : Action.Left);
    }
    nextAction = nextAction | (distZ > 0 ? Action.Down : Action.Up);
  } else {
    (Math.abs(distZ) > hitRangeZ) && (nextAction = nextAction | (distZ > 0 ? Action.Up : Action.Down));
    (Math.abs(distX) > hitRangeX) && (nextAction = nextAction | (distX > 0 ? Action.Left : Action.Right));
  }

  enemy.actions = nextAction;
}
