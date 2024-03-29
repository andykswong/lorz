import { ReadonlyVec3 } from 'munum';
import { Body, zrandom } from '../core'; 
import { createBat, createChest, createDemonSkeleton, createGoblin, createMinotaur, createMinotaur2, createSkeletonArcher, createRat, createSkeleton, createSkeleton2, createSlime, createSlime2, createSlime3, createSnake, createSpider, MAX, MIN, createMinotaurArcher, createSkeletonMage } from './config';
import { Character, Enemy, Entity } from './entities';

const SPAWN_POINT = 32;
const BIG_SPAWN_POINT = 8;
const END_POINT = 32;

export class Spawner {
  private maxSpawn: number = 0;

  public constructor(
    private readonly enemyList: Enemy[],
    private readonly itemList: (Body & Entity)[],
  ) {
  }

  public update(x: number, hero: Character): void {
    const spawn = Math.ceil(x / SPAWN_POINT);
    if (spawn <= Math.floor(this.maxSpawn)) {
      return;
    }
    this.maxSpawn = spawn;
    const spawnPosX = spawn * SPAWN_POINT;
    const spawnId = spawn % END_POINT;
    const multiplier = Math.floor(spawn / END_POINT);

    let spawnCount = 0;

    if (Math.random() < 0.15) {
      const pos = Math.random() < 0.8 ? spawnPosX : hero.position[0] - 16;
      this.enemyList.push(createGoblin([zrandom(pos - 12, pos + 12), 0, zrandom(MIN[2], MAX[2])], hero));
      ++spawnCount;
    }

    const totalSpawn = zrandom(1 + (spawn % END_POINT + multiplier)/5, 3 + ((spawn % END_POINT) + multiplier)/4);
    while (spawnCount < totalSpawn) {
      const pos = Math.random() < 0.8 ? spawnPosX : hero.position[0] - 32;
      if (Math.random() < 0.5 && zrandom(-4, 4, END_POINT) > spawnId) {
        this.enemyList.push(createRat([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.5 && zrandom(-4, 8, END_POINT) > spawnId) {
        this.enemyList.push(createBat([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.4 && zrandom(0, 24, END_POINT) > spawnId) {
        this.enemyList.push(createSpider([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.5 && zrandom(0, 28, END_POINT) > spawnId) {
        const rand = Math.random();
        const createSlimeFn = rand < 0.6 ? createSlime : rand < 0.85 ? createSlime2 : createSlime3;
        this.enemyList.push(createSlimeFn([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (spawnId > 4 && Math.random() < 0.5 && zrandom(0, 40, END_POINT) > spawnId) {
        this.enemyList.push(skeletonFactory(spawnId)([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (spawnId > 16 && Math.random() < 0.4 && zrandom(0, 40, END_POINT) > spawnId) {
        this.enemyList.push(createSnake([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (spawnId > 24 && Math.random() < 0.5 && zrandom(0, 56, END_POINT) > spawnId) {
        this.enemyList.push(minotaurFactory(spawnId)([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      }
    }

    if (spawn % BIG_SPAWN_POINT === 0) {
      this.itemList.push(createChest(
        [zrandom(spawnPosX - 12, spawnPosX + 12), 0, zrandom(MIN[2], MAX[2])],
        100 + spawn * 20, 200 + spawn * 25
      ));
      ++spawnCount;

      const bossType = (spawnId / BIG_SPAWN_POINT) | 0;
      switch (bossType) {
        case 1: {
          this.enemyList.push(createSlime3([zrandom(spawnPosX - 4, spawnPosX + 4), 0, zrandom(MIN[2], MAX[2])], hero));
          ++spawnCount;
          const slimCount = zrandom(10 + multiplier, 15 + multiplier * 2);
          for (let i = 0; i < slimCount; ++i) {
            const rand = Math.random();
            const createSlimeFn = rand < 0.5 ? createSlime : rand < 0.8 ? createSlime2 : createSlime3;
            this.enemyList.push(createSlimeFn([zrandom(spawnPosX - 32, spawnPosX + 32), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        }
        case 2: {
          const snakeCount = 2 + (Math.random() < 0.5 ? 0 : 1) + multiplier;
          for (let i = 0; i < snakeCount; ++i) {
            this.enemyList.push(createSnake([zrandom(spawnPosX - 24, spawnPosX + 24), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        }
        case 3:
          for (let i = 0; i < 2 + multiplier; ++i) {
            this.enemyList.push(minotaurFactory(spawnId)([zrandom(spawnPosX - 18, spawnPosX + 18), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        case 0: {
          const skelCount = zrandom(6 + multiplier, 9 + multiplier * 1.5);
          for (let i = 0; i < skelCount; ++i) {
            const pos = Math.random() < 0.5 ? spawnPosX : hero.position[0] - 32;
            this.enemyList.push(skeletonFactory(spawnId)([zrandom(pos - 24, pos + 24), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          for (let i = 0; i < multiplier; ++i) {
            this.enemyList.push(createDemonSkeleton([zrandom(spawnPosX - 8, spawnPosX + 8), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        }
      }
    }
  }

  public reset(): void {
    this.maxSpawn = 0;
  }
}

function skeletonFactory(spawnId: number): (pos: ReadonlyVec3, target: Character) => Enemy {
  const rand = Math.random();
  const createSkel =
    spawnId > 18 && rand < 0.1 ? createSkeletonMage :
    spawnId > 12 && rand < 0.3 ? createSkeletonArcher :
    rand < 0.65 ? createSkeleton : createSkeleton2;
  return createSkel;
}

function minotaurFactory(_spawnId: number): (pos: ReadonlyVec3, target: Character) => Enemy {
  const rand = Math.random();
  const createMino = rand < 0.4 ? createMinotaur : rand < 0.8 ? createMinotaur2 : createMinotaurArcher;
  return createMino;
}
