import { SpritesRenderer } from '../../core';

export interface Entity {
  update(time: number): void;
  render(renderer: SpritesRenderer, time: number): void;
}
