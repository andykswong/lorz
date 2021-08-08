import { Body, zrandom } from '../core'; 
import { createBat, createChest, createDemonSkeleton, createGoblin, createMinotaur, createMinotaur2, createRat, createSkeleton, createSkeleton2, createSlime, createSlime2, createSlime3, createSnake, createSpider, MAX, MIN } from './config';
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

    const totalSpawn = zrandom(1 + (spawn % END_POINT + multiplier)/4, 3 + ((spawn % END_POINT) + multiplier)/3);
    while (spawnCount < totalSpawn) {
      const pos = Math.random() < 0.8 ? spawnPosX : hero.position[0] - 32;
      if (Math.random() < 0.5 && zrandom(-4, 4, END_POINT) > spawnId) {
        this.enemyList.push(createRat([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.5 && zrandom(-4, 8, END_POINT) > spawnId) {
        this.enemyList.push(createBat([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.5 && zrandom(0, 20, END_POINT) > spawnId) {
        this.enemyList.push(createSpider([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.6 && zrandom(0, 32, END_POINT) > spawnId) {
        const rand = Math.random();
        const createSlimeFn = rand < 0.6 ? createSlime : rand < 0.85 ? createSlime2 : createSlime3;
        this.enemyList.push(createSlimeFn([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (Math.random() < 0.5 && zrandom(0, 40, END_POINT) > spawnId) {
        const createSkel = Math.random() < 0.5 ? createSkeleton : createSkeleton2;
        this.enemyList.push(createSkel([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (spawnId > 14 && Math.random() < 0.5 && zrandom(0, 40, END_POINT) > spawnId) {
        this.enemyList.push(createSnake([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
        ++spawnCount;
      } else if (spawnId > 22 && Math.random() < 0.5 && zrandom(0, 56, END_POINT) > spawnId) {
        const createMino = Math.random() < 0.5 ? createMinotaur : createMinotaur2;
        this.enemyList.push(createMino([zrandom(pos - 32, pos + 32), 0, zrandom(MIN[2], MAX[2])], hero));
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
        case 1:
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
        case 2:
          for (let i = 0; i < 3 + multiplier; ++i) {
            this.enemyList.push(createSnake([zrandom(spawnPosX - 24, spawnPosX + 24), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        case 3:
          for (let i = 0; i < 3 + multiplier; ++i) {
            const createMino = Math.random() < 0.5 ? createMinotaur : createMinotaur2;
            this.enemyList.push(createMino([zrandom(spawnPosX - 18, spawnPosX + 18), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
        case 0:
          const skelCount = zrandom(6 + multiplier, 9 + multiplier * 2);
          for (let i = 0; i < skelCount; ++i) {
            const createSkel = Math.random() < 0.5 ? createSkeleton : createSkeleton2;
            const pos = Math.random() < 0.5 ? spawnPosX : hero.position[0] - 32;
            this.enemyList.push(createSkel([zrandom(pos - 24, pos + 24), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          for (let i = 0; i < 1 + multiplier; ++i) {
            this.enemyList.push(createDemonSkeleton([zrandom(spawnPosX - 8, spawnPosX + 8), 0, zrandom(MIN[2], MAX[2])], hero));
            ++spawnCount;
          }
          break;
      }
    }
  }

  public reset(): void {
    this.maxSpawn = 0;
  }
}
