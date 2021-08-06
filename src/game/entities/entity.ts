import { SpritesRenderer } from '../../engine';
import { Action } from '../action';

export interface Entity {
  update(action?: Action): void;
  render(renderer: SpritesRenderer, time: number): void;
}
