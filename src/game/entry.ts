import { Game } from '../core';
import { HEIGHT, WIDTH } from './config';
import { GameScreen } from './game';
import { GameSave } from './save';
import { StartScreen } from './start';

export class DungeonOfLorzGame extends Game {
  public readonly save: GameSave = new GameSave();
  private readonly startScreen = new StartScreen(this);
  private readonly gameScreen = new GameScreen(this);

  public constructor() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges';
    document.getElementById('game')?.appendChild(canvas);

    super(canvas);
  }

  public start(): void {
    super.start();
    this.restart();
  }

  public restart(): void {
    this.screen = this.startScreen;
  }

  public startGame(): void {
    this.screen = this.gameScreen;
  }
}
