import { ReadonlyVec4 } from 'munum';
import { Action } from '../action';
import { Body } from '../../core';
import { Character } from './char';

export class Enemy extends Character {
  public coins = 1;
  public attackDelay = 1;
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

  if (!enemy.currentFocus || enemy.currentFocus.isDead) {
    let nextAction: Action = Action.None;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Left) ? 0.05 : -0.04)) nextAction = nextAction | Action.Left;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Right) ? 0.05 : -0.04)) nextAction = nextAction | Action.Right;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Up) ? 0.05 : -0.04)) nextAction = nextAction | Action.Up;
    if (Math.random() < 0.01 + ((enemy.actions & Action.Down) ? 0.05 : -0.04)) nextAction = nextAction | Action.Down;
    enemy.actions = nextAction;
    return;
  }

  enemy.actions = Action.None;

  const distX = enemy.position[0] - enemy.currentFocus.position[0];
  const distZ = enemy.position[2] - enemy.currentFocus.position[2];
  const hitRangeX = enemy.weapon?.hitbox.max[0] || 0;
  const hitRangeZ = enemy.weapon?.hitbox.max[2] || 0;

  if (Math.abs(distX) <= hitRangeX && Math.abs(distZ) <= hitRangeZ) {
    if (!t || t - enemy.lastAttackTime > enemy.attackDelay) {
      enemy.actions = enemy.actions | Action.Attack;
      enemy.lastAttackTime = t;
    }
    (enemy.faceForward && distX > 0) && (enemy.actions = enemy.actions | Action.Left);
    (!enemy.faceForward && distX < 0) && (enemy.actions = enemy.actions | Action.Right);
  }

  if (enemy.hitpoint / enemy.maxHitPoint <= enemy.fleeThreshold) {
    if (Math.abs(distX) < 64) {
      enemy.actions = enemy.actions | (distX > 0 ? Action.Right : Action.Left);
    }
    enemy.actions = enemy.actions | (distZ > 0 ? Action.Down : Action.Up);
  } else if (Math.random() < 0.5) {
    (Math.abs(distZ) > hitRangeZ) && (enemy.actions = enemy.actions | (distZ > 0 ? Action.Up : Action.Down));
    (Math.abs(distX) > hitRangeX) && (enemy.actions = enemy.actions | (distX > 0 ? Action.Left : Action.Right));
  }
}
