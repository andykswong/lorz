import { Game } from '../core';
import { HEIGHT, WIDTH } from './config';
import { GameScreen } from './game';
import { StartScreen } from './start';

export class LaDungeonGame extends Game {
  private readonly startScreen = new StartScreen(this);
  private readonly gameScreen = new GameScreen(this);

  public constructor() {
    super(document.getElementById('game')!, WIDTH, HEIGHT);
  }

  public start(): void {
    super.start();
    //this.restart();
    this.startGame();
  }

  public restart(): void {
    this.setScreen(this.startScreen);
  }

  public startGame(): void {
    this.setScreen(this.gameScreen);
  }
}
