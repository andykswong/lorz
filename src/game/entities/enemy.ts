import { ReadonlyVec4 } from 'munum';
import { Action } from '../action';
import { Body } from '../../core';
import { Character } from './char';
import { HitBoxWeaponSmall } from '../config';

export class Enemy extends Character {
  public coins = 1;
  public aggressive = 0.5;
  public blockDuration = 2;
  public fleeThreshold = 0.2;
  public target: Body | null = null;
  public currentFocus: Body | null = null;
  public lastAttackTime: number = 0;

  public act: (thisEnemy: Enemy, t: number) => void = defaultEnemyAction;

  public constructor(
    hitpoint: number,  
    body: ReadonlyVec4
  ) {
    super(hitpoint, body, null, null);
  }
  
  public update(t: number = 0): void {
    this.act(this, t);
    super.update(t);
  }
}
 
export function defaultEnemyAction(enemy: Enemy, t: number): void {
  if (Math.random() < 0.05) {
    enemy.currentFocus = enemy.currentFocus ? null : enemy.target;
  }

  let nextAction: Action = Action.None;

  if ((enemy.actions & Action.Block) && (t - enemy.lastAttackTime < enemy.blockDuration)) {
    nextAction = nextAction | Action.Block;
  }

  const distX = enemy.position[0] - (enemy.currentFocus?.position[0] || -100);

  if (!enemy.currentFocus || enemy.currentFocus.isDead || Math.abs(distX) > 128) {
    if (Math.random() < 0.01 + ((enemy.actions & Action.Left) ? 0.05 : -0.04)) nextAction = nextAction | Action.Left;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Right) ? 0.05 : -0.04)) nextAction = nextAction | Action.Right;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Up) ? 0.05 : -0.04)) nextAction = nextAction | Action.Up;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Down) ? 0.05 : -0.04)) nextAction = nextAction | Action.Down;
    enemy.actions = nextAction;
    return;
  }

  const distZ = enemy.position[2] - enemy.currentFocus.position[2];
  const hitRangeX = (enemy.weapon?.hitbox || HitBoxWeaponSmall).max[0];
  const hitRangeZ = (enemy.weapon?.hitbox || HitBoxWeaponSmall).max[2];

  if (Math.abs(distX) <= hitRangeX && Math.abs(distZ) <= hitRangeZ) {
    if (t - enemy.lastAttackTime > enemy.attackDelay) {
      if (!enemy.shield || Math.random() < enemy.aggressive) {
        nextAction = (nextAction & ~Action.Block) | Action.Attack;
      } else if (enemy.shield) {
        nextAction = nextAction | Action.Block;
      }
      enemy.lastAttackTime = t;
    }
    (enemy.faceForward && distX > 0) && (nextAction = nextAction | Action.Left);
    (!enemy.faceForward && distX < 0) && (nextAction = nextAction | Action.Right);
  }

  if (enemy.hitpoint / enemy.maxHitPoint <= enemy.fleeThreshold) {
    if (Math.abs(distX) < 64) {
      nextAction = nextAction | (distX > 0 ? Action.Right : Action.Left);
    }
    nextAction = nextAction | (distZ > 0 ? Action.Down : Action.Up);
  } else {
    (Math.abs(distZ) > hitRangeZ) && (nextAction = nextAction | (distZ > 0 ? Action.Up : Action.Down));
    (Math.abs(distX) > hitRangeX) && (nextAction = nextAction | (distX > 0 ? Action.Left : Action.Right));
  }

  enemy.actions = nextAction;
}
