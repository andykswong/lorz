import { Device } from 'mugl';
import { ReadonlyMat4 } from 'munum';
import { COMPONENTS_PER_SPRITE, SpritesRenderer } from '../../core';
import { Sprite } from '../config';

export class Background extends SpritesRenderer {
  public constructor(
    device: Device,
    private seed = Math.random()
  ) {
    super(device, false, [0x47 / 0xFF, 0x2d / 0xFF, 0x3c / 0xFF, 1], void 0, 80);
  }

  public start(): void {
    super.start();

    this.i = COMPONENTS_PER_SPRITE * 10;
    for (let r = 0; r < 6; ++r) {
      for (let j = 0; j < 10; ++j) {
        this.submit(Sprite.FLOOR, [j * 8 - 36, 0, -8 + r * 8]);
      }
    }
    this.i = 0;
  }

  public update(x: number = 0): void {
    const offset = Math.floor(x / 8), dx = Math.floor(x % 8);
    for (let j = 0; j < 10; ++j) {
      const rand = ((offset + j) * (offset + j) * this.seed + (offset + j) * 7 * this.seed * this.seed) % 1;
      const sprite = (rand < 0.6) ? Sprite.WALL0 :
        (rand < 0.75) ? Sprite.WALL1 :
          (rand < 0.85) ? Sprite.WALL2 :
            Sprite.WALL3;
      this.submit(sprite, [j * 8 - 36 - dx, 0, -16]);
    }
  }

  public render(viewProj: ReadonlyMat4): void {
    this.i = COMPONENTS_PER_SPRITE * 70;
    super.render(viewProj);
  }
}
